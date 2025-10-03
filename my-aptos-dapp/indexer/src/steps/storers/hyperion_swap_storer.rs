use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{insert_into, upsert::excluded, ExpressionMethods, QueryResult};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};

use crate::{
    db_models::{hyperion_swap::HyperionSwap, hyperion_pool_stat::HyperionPoolStat},
    db_migrations::schema::{hyperion_swaps, hyperion_pool_stats},
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

async fn execute_hyperion_swap_sql(
    conn: &mut AsyncPgConnection,
    items_to_insert: Vec<HyperionSwap>,
    pool_stats_updates: Vec<HyperionPoolStat>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let swap_query = insert_into(hyperion_swaps::table)
                .values(items_to_insert)
                .on_conflict(hyperion_swaps::swap_id)
                .do_nothing();
            swap_query.execute(conn).await?;

            let stats_query = insert_into(hyperion_pool_stats::table)
                .values(pool_stats_updates)
                .on_conflict(hyperion_pool_stats::pool_address)
                .do_update()
                .set((
                    hyperion_pool_stats::volume_24h.eq(excluded(hyperion_pool_stats::volume_24h)),
                    hyperion_pool_stats::fees_24h.eq(excluded(hyperion_pool_stats::fees_24h)),
                    hyperion_pool_stats::swap_count_24h.eq(excluded(hyperion_pool_stats::swap_count_24h)),
                    hyperion_pool_stats::last_price.eq(excluded(hyperion_pool_stats::last_price)),
                    hyperion_pool_stats::last_update_timestamp.eq(excluded(hyperion_pool_stats::last_update_timestamp)),
                ));
            stats_query.execute(conn).await?;

            Ok(())
        })
    })
    .await
}

pub async fn process_hyperion_swap_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    swaps: Vec<HyperionSwap>,
) -> Result<(), ProcessorError> {
    if swaps.is_empty() {
        return Ok(());
    }

    let mut pool_stats_map: AHashMap<String, HyperionPoolStat> = AHashMap::new();
    let swaps_vec: Vec<HyperionSwap> = swaps
        .into_iter()
        .map(|swap| {
            let stat = pool_stats_map
                .entry(swap.pool_address.clone())
                .or_insert_with(|| HyperionPoolStat::new(swap.pool_address.clone()));

            stat.update_from_swap(
                &swap.amount_in,
                &swap.amount_out,
                3000, // default fee tier 0.3%
                swap.timestamp,
            );
            swap
        })
        .collect();

    let pool_stats: Vec<HyperionPoolStat> = pool_stats_map.into_values().collect();

    let chunk_size = get_config_table_chunk_size::<HyperionSwap>("hyperion_swaps", &per_table_chunk_sizes);
    let tasks = swaps_vec
        .chunks(chunk_size)
        .enumerate()
        .map(|(i, chunk)| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            let stats = if i == 0 {
                pool_stats.clone()
            } else {
                vec![]
            };
            tokio::spawn(async move {
                let conn = &mut get_db_connection(&pool).await.expect(
                    "Failed to get connection from pool while processing hyperion swap events",
                );
                execute_hyperion_swap_sql(conn, items, stats).await
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
