use crate::db_migrations::schema::hyperion_pools;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Insertable, Queryable, Serialize)]
#[diesel(table_name = hyperion_pools)]
pub struct HyperionPool {
    pub pool_address: String,
    pub token0_address: String,
    pub token1_address: String,
    pub token0_symbol: String,
    pub token1_symbol: String,
    pub fee_tier: i32,
    pub tick_spacing: i32,
    pub liquidity: String,
    pub sqrt_price_x96: String,
    pub tick: i32,
    pub creation_timestamp: i64,
    pub last_update_timestamp: i64,
    pub last_update_version: i64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PoolCreatedEventOnChain {
    pub pool_address: String,
    pub token0: String,
    pub token1: String,
    pub token0_symbol: String,
    pub token1_symbol: String,
    pub fee: String,
    pub tick_spacing: String,
    pub sqrt_price_x96: String,
    pub tick: String,
    pub timestamp: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PoolStateUpdateEventOnChain {
    pub pool_address: String,
    pub liquidity: String,
    pub sqrt_price_x96: String,
    pub tick: String,
    pub timestamp: String,
}

impl HyperionPool {
    pub fn from_pool_created_event(
        event: &PoolCreatedEventOnChain,
        tx_version: i64,
    ) -> Self {
        Self {
            pool_address: event.pool_address.clone(),
            token0_address: event.token0.clone(),
            token1_address: event.token1.clone(),
            token0_symbol: event.token0_symbol.clone(),
            token1_symbol: event.token1_symbol.clone(),
            fee_tier: event.fee.parse::<i32>().unwrap_or(3000), // default 0.3%
            tick_spacing: event.tick_spacing.parse::<i32>().unwrap_or(60),
            liquidity: "0".to_string(),
            sqrt_price_x96: event.sqrt_price_x96.clone(),
            tick: event.tick.parse::<i32>().unwrap_or(0),
            creation_timestamp: event.timestamp.parse::<i64>().unwrap_or(0),
            last_update_timestamp: event.timestamp.parse::<i64>().unwrap_or(0),
            last_update_version: tx_version,
        }
    }

    pub fn update_from_state_event(
        &mut self,
        event: &PoolStateUpdateEventOnChain,
        tx_version: i64,
    ) {
        self.liquidity = event.liquidity.clone();
        self.sqrt_price_x96 = event.sqrt_price_x96.clone();
        self.tick = event.tick.parse::<i32>().unwrap_or(0);
        self.last_update_timestamp = event.timestamp.parse::<i64>().unwrap_or(0);
        self.last_update_version = tx_version;
    }
}
