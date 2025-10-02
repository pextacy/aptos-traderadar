use crate::db_migrations::schema::trades;
use aptos_indexer_processor_sdk::aptos_protos::transaction::v1::Event as EventPB;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Insertable, Serialize)]
#[diesel(table_name = trades)]
pub struct Trade {
    pub trade_obj_addr: String,
    pub trader_addr: String,
    pub trade_type: i16,
    pub token_from: String,
    pub token_to: String,
    pub amount_from: i64,
    pub amount_to: i64,
    pub price: i64,
    pub status: i16,
    pub creation_timestamp: i64,
    pub last_update_timestamp: i64,
    pub last_update_event_idx: i64,
    pub notes: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreateTradeEventOnChain {
    pub trade_obj_addr: String,
    pub trader: String,
    pub trade_type: u8,
    pub token_from: String,
    pub token_to: String,
    pub amount_from: String,
    pub amount_to: String,
    pub price: String,
    pub status: u8,
    pub creation_timestamp: String,
    pub last_update_timestamp: String,
    pub notes: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct UpdateTradeEventOnChain {
    pub trade_obj_addr: String,
    pub trader: String,
    pub trade_type: u8,
    pub token_from: String,
    pub token_to: String,
    pub amount_from: String,
    pub amount_to: String,
    pub price: String,
    pub status: u8,
    pub creation_timestamp: String,
    pub last_update_timestamp: String,
    pub notes: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CompleteTradeEventOnChain {
    pub trade_obj_addr: String,
    pub trader: String,
    pub trade_type: u8,
    pub token_from: String,
    pub token_to: String,
    pub amount_from: String,
    pub amount_to: String,
    pub price: String,
    pub status: u8,
    pub creation_timestamp: String,
    pub last_update_timestamp: String,
    pub notes: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CancelTradeEventOnChain {
    pub trade_obj_addr: String,
    pub trader: String,
    pub trade_type: u8,
    pub token_from: String,
    pub token_to: String,
    pub amount_from: String,
    pub amount_to: String,
    pub price: String,
    pub status: u8,
    pub creation_timestamp: String,
    pub last_update_timestamp: String,
    pub notes: String,
}

impl Trade {
    pub fn from_create_trade_event(
        event: &CreateTradeEventOnChain,
        event_index: i64,
    ) -> Self {
        Self {
            trade_obj_addr: event.trade_obj_addr.clone(),
            trader_addr: event.trader.clone(),
            trade_type: event.trade_type as i16,
            token_from: event.token_from.clone(),
            token_to: event.token_to.clone(),
            amount_from: event.amount_from.parse::<i64>().unwrap_or(0),
            amount_to: event.amount_to.parse::<i64>().unwrap_or(0),
            price: event.price.parse::<i64>().unwrap_or(0),
            status: event.status as i16,
            creation_timestamp: event.creation_timestamp.parse::<i64>().unwrap_or(0),
            last_update_timestamp: event.last_update_timestamp.parse::<i64>().unwrap_or(0),
            last_update_event_idx: event_index,
            notes: event.notes.clone(),
        }
    }

    pub fn from_update_trade_event(
        event: &UpdateTradeEventOnChain,
        event_index: i64,
    ) -> Self {
        Self {
            trade_obj_addr: event.trade_obj_addr.clone(),
            trader_addr: event.trader.clone(),
            trade_type: event.trade_type as i16,
            token_from: event.token_from.clone(),
            token_to: event.token_to.clone(),
            amount_from: event.amount_from.parse::<i64>().unwrap_or(0),
            amount_to: event.amount_to.parse::<i64>().unwrap_or(0),
            price: event.price.parse::<i64>().unwrap_or(0),
            status: event.status as i16,
            creation_timestamp: event.creation_timestamp.parse::<i64>().unwrap_or(0),
            last_update_timestamp: event.last_update_timestamp.parse::<i64>().unwrap_or(0),
            last_update_event_idx: event_index,
            notes: event.notes.clone(),
        }
    }

    pub fn from_complete_trade_event(
        event: &CompleteTradeEventOnChain,
        event_index: i64,
    ) -> Self {
        Self {
            trade_obj_addr: event.trade_obj_addr.clone(),
            trader_addr: event.trader.clone(),
            trade_type: event.trade_type as i16,
            token_from: event.token_from.clone(),
            token_to: event.token_to.clone(),
            amount_from: event.amount_from.parse::<i64>().unwrap_or(0),
            amount_to: event.amount_to.parse::<i64>().unwrap_or(0),
            price: event.price.parse::<i64>().unwrap_or(0),
            status: event.status as i16,
            creation_timestamp: event.creation_timestamp.parse::<i64>().unwrap_or(0),
            last_update_timestamp: event.last_update_timestamp.parse::<i64>().unwrap_or(0),
            last_update_event_idx: event_index,
            notes: event.notes.clone(),
        }
    }

    pub fn from_cancel_trade_event(
        event: &CancelTradeEventOnChain,
        event_index: i64,
    ) -> Self {
        Self {
            trade_obj_addr: event.trade_obj_addr.clone(),
            trader_addr: event.trader.clone(),
            trade_type: event.trade_type as i16,
            token_from: event.token_from.clone(),
            token_to: event.token_to.clone(),
            amount_from: event.amount_from.parse::<i64>().unwrap_or(0),
            amount_to: event.amount_to.parse::<i64>().unwrap_or(0),
            price: event.price.parse::<i64>().unwrap_or(0),
            status: event.status as i16,
            creation_timestamp: event.creation_timestamp.parse::<i64>().unwrap_or(0),
            last_update_timestamp: event.last_update_timestamp.parse::<i64>().unwrap_or(0),
            last_update_event_idx: event_index,
            notes: event.notes.clone(),
        }
    }
}
