use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{insert_into, upsert::excluded, ExpressionMethods, QueryResult};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};

use crate::{
    db_models::{trade::Trade, trader_stat::TraderStat},
    schema::{trades, trader_stats},
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

async fn execute_update_trade_events_sql(
    conn: &mut AsyncPgConnection,
    items_to_update: Vec<Trade>,
    trader_stats_updates: Vec<TraderStat>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let update_trade_query = insert_into(trades::table)
                .values(items_to_update.clone())
                .on_conflict(trades::trade_obj_addr)
                .do_update()
                .set((
                    trades::amount_from.eq(excluded(trades::amount_from)),
                    trades::amount_to.eq(excluded(trades::amount_to)),
                    trades::price.eq(excluded(trades::price)),
                    trades::notes.eq(excluded(trades::notes)),
                    trades::last_update_timestamp.eq(excluded(trades::last_update_timestamp)),
                    trades::last_update_event_idx.eq(excluded(trades::last_update_event_idx)),
                ));
            update_trade_query.execute(conn).await?;

            if !trader_stats_updates.is_empty() {
                let update_trader_stat_query = insert_into(trader_stats::table)
                    .values(trader_stats_updates)
                    .on_conflict(trader_stats::trader_addr)
                    .do_update()
                    .set((
                        trader_stats::last_update_timestamp
                            .eq(excluded(trader_stats::last_update_timestamp)),
                        trader_stats::points
                            .eq(trader_stats::points + excluded(trader_stats::points)),
                    ));
                update_trader_stat_query.execute(conn).await?;
            }

            Ok(())
        })
    })
    .await
}

pub async fn process_update_trade_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    update_events: Vec<(Trade, i64)>,
) -> Result<(), ProcessorError> {
    let mut trader_stats_map: AHashMap<String, TraderStat> = AHashMap::new();
    let trades: Vec<Trade> = update_events
        .iter()
        .map(|(trade, _)| {
            let stat = trader_stats_map
                .entry(trade.trader_addr.clone())
                .or_insert_with(|| TraderStat::new(trade.trader_addr.clone(), trade.last_update_timestamp));

            stat.increment_update_trade(trade.last_update_timestamp);
            trade.clone()
        })
        .collect();

    let trader_stats: Vec<TraderStat> = trader_stats_map.into_values().collect();

    let chunk_size = get_config_table_chunk_size::<Trade>("trades", &per_table_chunk_sizes);
    let tasks = trades
        .chunks(chunk_size)
        .enumerate()
        .map(|(i, chunk)| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            let stats = if i == 0 {
                trader_stats.clone()
            } else {
                vec![]
            };
            tokio::spawn(async move {
                let conn = &mut get_db_connection(&pool).await.expect(
                    "Failed to get connection from pool while processing update trade events",
                );
                execute_update_trade_events_sql(conn, items, stats).await
            })
        })
        .collect::<Vec<_>>();

    let results = futures_util::future::try_join_all(tasks)
        .await
        .expect("Task panicked executing in chunks");
    for res in results {
        res.map_err(|e| {
            tracing::warn!("Error running query: {:?}", e);
            ProcessorError::ProcessError {
                message: e.to_string(),
            }
        })?;
    }
    Ok(())
}
