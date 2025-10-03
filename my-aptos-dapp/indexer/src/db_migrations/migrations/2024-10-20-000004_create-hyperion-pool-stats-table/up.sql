CREATE TABLE IF NOT EXISTS hyperion_pool_stats (
    pool_address VARCHAR(300) PRIMARY KEY,
    tvl_usd VARCHAR(100) NOT NULL DEFAULT '0',
    volume_24h VARCHAR(100) NOT NULL DEFAULT '0',
    volume_7d VARCHAR(100) NOT NULL DEFAULT '0',
    fees_24h VARCHAR(100) NOT NULL DEFAULT '0',
    fees_7d VARCHAR(100) NOT NULL DEFAULT '0',
    apr VARCHAR(50) NOT NULL DEFAULT '0',
    swap_count_24h BIGINT NOT NULL DEFAULT 0,
    swap_count_7d BIGINT NOT NULL DEFAULT 0,
    unique_traders_24h BIGINT NOT NULL DEFAULT 0,
    unique_traders_7d BIGINT NOT NULL DEFAULT 0,
    last_price VARCHAR(100) NOT NULL DEFAULT '0',
    price_change_24h VARCHAR(50) NOT NULL DEFAULT '0',
    last_update_timestamp BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hyperion_pool_stats_tvl ON hyperion_pool_stats (CAST(tvl_usd AS NUMERIC) DESC);
CREATE INDEX IF NOT EXISTS idx_hyperion_pool_stats_volume ON hyperion_pool_stats (CAST(volume_24h AS NUMERIC) DESC);
CREATE INDEX IF NOT EXISTS idx_hyperion_pool_stats_apr ON hyperion_pool_stats (CAST(apr AS NUMERIC) DESC);
