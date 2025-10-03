use crate::db_migrations::schema::hyperion_swaps;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Insertable, Queryable, Serialize)]
#[diesel(table_name = hyperion_swaps)]
pub struct HyperionSwap {
    pub swap_id: String,
    pub pool_address: String,
    pub sender: String,
    pub recipient: String,
    pub token_in: String,
    pub token_out: String,
    pub amount_in: String,
    pub amount_out: String,
    pub sqrt_price_x96_after: String,
    pub liquidity_after: String,
    pub tick_after: i32,
    pub tx_version: i64,
    pub event_idx: i64,
    pub timestamp: i64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SwapEventOnChain {
    pub pool: String,
    pub sender: String,
    pub recipient: String,
    pub token_in: String,
    pub token_out: String,
    pub amount_in: String,
    pub amount_out: String,
    pub sqrt_price_x96: String,
    pub liquidity: String,
    pub tick: String,
    pub timestamp: String,
}

impl HyperionSwap {
    pub fn from_swap_event(
        event: &SwapEventOnChain,
        tx_version: i64,
        event_idx: i64,
    ) -> Self {
        let swap_id = format!("{}-{}-{}", event.pool, tx_version, event_idx);

        Self {
            swap_id,
            pool_address: event.pool.clone(),
            sender: event.sender.clone(),
            recipient: event.recipient.clone(),
            token_in: event.token_in.clone(),
            token_out: event.token_out.clone(),
            amount_in: event.amount_in.clone(),
            amount_out: event.amount_out.clone(),
            sqrt_price_x96_after: event.sqrt_price_x96.clone(),
            liquidity_after: event.liquidity.clone(),
            tick_after: event.tick.parse::<i32>().unwrap_or(0),
            tx_version,
            event_idx,
            timestamp: event.timestamp.parse::<i64>().unwrap_or(0),
        }
    }
}
