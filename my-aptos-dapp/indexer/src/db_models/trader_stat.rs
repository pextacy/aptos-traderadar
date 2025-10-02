use crate::db_migrations::schema::trader_stats;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Insertable, Queryable, Serialize)]
#[diesel(table_name = trader_stats)]
pub struct TraderStat {
    pub trader_addr: String,
    pub creation_timestamp: i64,
    pub last_update_timestamp: i64,
    pub total_trades: i64,
    pub completed_trades: i64,
    pub cancelled_trades: i64,
    pub total_buy_trades: i64,
    pub total_sell_trades: i64,
    pub total_swap_trades: i64,
    pub total_volume: i64,
    pub points: i64,
}

impl TraderStat {
    pub fn new(trader_addr: String, timestamp: i64) -> Self {
        Self {
            trader_addr,
            creation_timestamp: timestamp,
            last_update_timestamp: timestamp,
            total_trades: 0,
            completed_trades: 0,
            cancelled_trades: 0,
            total_buy_trades: 0,
            total_sell_trades: 0,
            total_swap_trades: 0,
            total_volume: 0,
            points: 0,
        }
    }

    pub fn increment_create_trade(&mut self, trade_type: i16, price: i64, timestamp: i64) {
        self.total_trades += 1;
        match trade_type {
            1 => self.total_buy_trades += 1,
            2 => self.total_sell_trades += 1,
            3 => self.total_swap_trades += 1,
            _ => {}
        }
        self.total_volume += price;
        self.points += 10; // 10 points for creating a trade
        self.last_update_timestamp = timestamp;
    }

    pub fn increment_update_trade(&mut self, timestamp: i64) {
        self.points += 2; // 2 points for updating a trade
        self.last_update_timestamp = timestamp;
    }

    pub fn increment_complete_trade(&mut self, timestamp: i64) {
        self.completed_trades += 1;
        self.points += 20; // 20 points for completing a trade
        self.last_update_timestamp = timestamp;
    }

    pub fn increment_cancel_trade(&mut self, timestamp: i64) {
        self.cancelled_trades += 1;
        self.last_update_timestamp = timestamp;
    }
}
