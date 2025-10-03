CREATE TABLE IF NOT EXISTS hyperion_pools (
    pool_address VARCHAR(300) PRIMARY KEY,
    token0_address VARCHAR(300) NOT NULL,
    token1_address VARCHAR(300) NOT NULL,
    token0_symbol VARCHAR(50) NOT NULL,
    token1_symbol VARCHAR(50) NOT NULL,
    fee_tier INTEGER NOT NULL,
    tick_spacing INTEGER NOT NULL,
    liquidity VARCHAR(100) NOT NULL,
    sqrt_price_x96 VARCHAR(100) NOT NULL,
    tick INTEGER NOT NULL,
    creation_timestamp BIGINT NOT NULL,
    last_update_timestamp BIGINT NOT NULL,
    last_update_version BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hyperion_pools_token0 ON hyperion_pools (token0_symbol);
CREATE INDEX IF NOT EXISTS idx_hyperion_pools_token1 ON hyperion_pools (token1_symbol);
CREATE INDEX IF NOT EXISTS idx_hyperion_pools_pair ON hyperion_pools (token0_symbol, token1_symbol);
CREATE INDEX IF NOT EXISTS idx_hyperion_pools_update_time ON hyperion_pools (last_update_timestamp);
