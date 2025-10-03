use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{insert_into, upsert::excluded, ExpressionMethods, QueryResult};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};

use crate::{
    db_models::hyperion_pool::HyperionPool,
    db_migrations::schema::hyperion_pools,
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

async fn execute_hyperion_pool_sql(
    conn: &mut AsyncPgConnection,
    items_to_insert: Vec<HyperionPool>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let query = insert_into(hyperion_pools::table)
                .values(items_to_insert)
                .on_conflict(hyperion_pools::pool_address)
                .do_update()
                .set((
                    hyperion_pools::liquidity.eq(excluded(hyperion_pools::liquidity)),
                    hyperion_pools::sqrt_price_x96.eq(excluded(hyperion_pools::sqrt_price_x96)),
                    hyperion_pools::tick.eq(excluded(hyperion_pools::tick)),
                    hyperion_pools::last_update_timestamp.eq(excluded(hyperion_pools::last_update_timestamp)),
                    hyperion_pools::last_update_version.eq(excluded(hyperion_pools::last_update_version)),
                ));
            query.execute(conn).await?;
            Ok(())
        })
    })
    .await
}

pub async fn process_hyperion_pool_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    pools: Vec<HyperionPool>,
) -> Result<(), ProcessorError> {
    if pools.is_empty() {
        return Ok(());
    }

    let chunk_size = get_config_table_chunk_size::<HyperionPool>("hyperion_pools", &per_table_chunk_sizes);
    let tasks = pools
        .chunks(chunk_size)
        .map(|chunk| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            tokio::spawn(async move {
                let conn = &mut get_db_connection(&pool).await.expect(
                    "Failed to get connection from pool while processing hyperion pool events",
                );
                execute_hyperion_pool_sql(conn, items).await
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
