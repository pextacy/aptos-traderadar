CREATE TABLE IF NOT EXISTS hyperion_swaps (
    swap_id VARCHAR(400) PRIMARY KEY,
    pool_address VARCHAR(300) NOT NULL,
    sender VARCHAR(300) NOT NULL,
    recipient VARCHAR(300) NOT NULL,
    token_in VARCHAR(300) NOT NULL,
    token_out VARCHAR(300) NOT NULL,
    amount_in VARCHAR(100) NOT NULL,
    amount_out VARCHAR(100) NOT NULL,
    sqrt_price_x96_after VARCHAR(100) NOT NULL,
    liquidity_after VARCHAR(100) NOT NULL,
    tick_after INTEGER NOT NULL,
    tx_version BIGINT NOT NULL,
    event_idx BIGINT NOT NULL,
    timestamp BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hyperion_swaps_pool ON hyperion_swaps (pool_address);
CREATE INDEX IF NOT EXISTS idx_hyperion_swaps_sender ON hyperion_swaps (sender);
CREATE INDEX IF NOT EXISTS idx_hyperion_swaps_timestamp ON hyperion_swaps (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hyperion_swaps_pool_time ON hyperion_swaps (pool_address, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hyperion_swaps_tx_version ON hyperion_swaps (tx_version);
