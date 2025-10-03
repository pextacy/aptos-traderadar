use crate::db_migrations::schema::hyperion_pool_stats;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Insertable, Queryable, Serialize, AsChangeset)]
#[diesel(table_name = hyperion_pool_stats)]
pub struct HyperionPoolStat {
    pub pool_address: String,
    pub tvl_usd: String,
    pub volume_24h: String,
    pub volume_7d: String,
    pub fees_24h: String,
    pub fees_7d: String,
    pub apr: String,
    pub swap_count_24h: i64,
    pub swap_count_7d: i64,
    pub unique_traders_24h: i64,
    pub unique_traders_7d: i64,
    pub last_price: String,
    pub price_change_24h: String,
    pub last_update_timestamp: i64,
}

impl HyperionPoolStat {
    pub fn new(pool_address: String) -> Self {
        Self {
            pool_address,
            tvl_usd: "0".to_string(),
            volume_24h: "0".to_string(),
            volume_7d: "0".to_string(),
            fees_24h: "0".to_string(),
            fees_7d: "0".to_string(),
            apr: "0".to_string(),
            swap_count_24h: 0,
            swap_count_7d: 0,
            unique_traders_24h: 0,
            unique_traders_7d: 0,
            last_price: "0".to_string(),
            price_change_24h: "0".to_string(),
            last_update_timestamp: 0,
        }
    }

    pub fn update_from_swap(
        &mut self,
        amount_in: &str,
        amount_out: &str,
        fee_tier: i32,
        timestamp: i64,
    ) {
        // Calculate swap value in USD (simplified - would need price oracle in production)
        let amount_in_f64 = amount_in.parse::<f64>().unwrap_or(0.0);
        let amount_out_f64 = amount_out.parse::<f64>().unwrap_or(0.0);

        // Update current price
        if amount_in_f64 > 0.0 {
            let price = amount_out_f64 / amount_in_f64;
            self.last_price = price.to_string();
        }

        // Calculate fees (fee_tier is in basis points, e.g., 3000 = 0.3%)
        let fee_rate = fee_tier as f64 / 1_000_000.0;
        let fee_amount = amount_in_f64 * fee_rate;

        // Update 24h stats
        self.swap_count_24h += 1;

        let current_volume = self.volume_24h.parse::<f64>().unwrap_or(0.0);
        self.volume_24h = (current_volume + amount_in_f64).to_string();

        let current_fees = self.fees_24h.parse::<f64>().unwrap_or(0.0);
        self.fees_24h = (current_fees + fee_amount).to_string();

        self.last_update_timestamp = timestamp;
    }

    pub fn calculate_apr(&mut self, tvl: f64) {
        if tvl > 0.0 {
            let fees_24h = self.fees_24h.parse::<f64>().unwrap_or(0.0);
            let annual_fees = fees_24h * 365.0;
            let apr = (annual_fees / tvl) * 100.0;
            self.apr = apr.to_string();
        }
    }
}
