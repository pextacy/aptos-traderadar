use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{insert_into, upsert::excluded, ExpressionMethods, QueryResult};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};
use std::cmp;

use crate::{
    db_models::{trade::Trade, trader_stat::TraderStat},
    schema::{trades, trader_stats},
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

async fn execute_create_trade_events_sql(
    conn: &mut AsyncPgConnection,
    items_to_insert: Vec<Trade>,
    trader_stats_updates: Vec<TraderStat>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let create_trade_query = insert_into(trades::table)
                .values(items_to_insert.clone())
                .on_conflict(trades::trade_obj_addr)
                .do_nothing();
            create_trade_query.execute(conn).await?;

            let update_trader_stat_query = insert_into(trader_stats::table)
                .values(trader_stats_updates)
                .on_conflict(trader_stats::trader_addr)
                .do_update()
                .set((
                    trader_stats::last_update_timestamp
                        .eq(excluded(trader_stats::last_update_timestamp)),
                    trader_stats::total_trades
                        .eq(trader_stats::total_trades + excluded(trader_stats::total_trades)),
                    trader_stats::total_buy_trades
                        .eq(trader_stats::total_buy_trades + excluded(trader_stats::total_buy_trades)),
                    trader_stats::total_sell_trades
                        .eq(trader_stats::total_sell_trades + excluded(trader_stats::total_sell_trades)),
                    trader_stats::total_swap_trades
                        .eq(trader_stats::total_swap_trades + excluded(trader_stats::total_swap_trades)),
                    trader_stats::total_volume
                        .eq(trader_stats::total_volume + excluded(trader_stats::total_volume)),
                    trader_stats::points
                        .eq(trader_stats::points + excluded(trader_stats::points)),
                ));
            update_trader_stat_query.execute(conn).await?;

            Ok(())
        })
    })
    .await
}

pub async fn process_create_trade_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    create_events: Vec<(Trade, i64)>,
) -> Result<(), ProcessorError> {
    let mut trader_stats_map: AHashMap<String, TraderStat> = AHashMap::new();
    let trades: Vec<Trade> = create_events
        .iter()
        .map(|(trade, _)| {
            let stat = trader_stats_map
                .entry(trade.trader_addr.clone())
                .or_insert_with(|| TraderStat::new(trade.trader_addr.clone(), trade.creation_timestamp));

            stat.increment_create_trade(trade.trade_type, trade.price, trade.creation_timestamp);
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
                    "Failed to get connection from pool while processing create trade events",
                );
                execute_create_trade_events_sql(conn, items, stats).await
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
