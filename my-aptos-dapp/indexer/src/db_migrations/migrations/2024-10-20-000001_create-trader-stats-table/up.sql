-- Create trader stats table
CREATE TABLE
    trader_stats (
        trader_addr VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
        creation_timestamp BIGINT NOT NULL,
        last_update_timestamp BIGINT NOT NULL,
        total_trades BIGINT NOT NULL,
        completed_trades BIGINT NOT NULL,
        cancelled_trades BIGINT NOT NULL,
        total_buy_trades BIGINT NOT NULL,
        total_sell_trades BIGINT NOT NULL,
        total_swap_trades BIGINT NOT NULL,
        total_volume BIGINT NOT NULL,
        points BIGINT NOT NULL
    );

CREATE INDEX idx_trader_stats_points ON trader_stats(points DESC);
CREATE INDEX idx_trader_stats_volume ON trader_stats(total_volume DESC);
