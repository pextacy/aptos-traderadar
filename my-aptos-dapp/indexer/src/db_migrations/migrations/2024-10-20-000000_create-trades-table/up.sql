-- Create trades table
CREATE TABLE
    trades (
        trade_obj_addr VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
        trader_addr VARCHAR(300) NOT NULL,
        trade_type SMALLINT NOT NULL,
        token_from VARCHAR(100) NOT NULL,
        token_to VARCHAR(100) NOT NULL,
        amount_from BIGINT NOT NULL,
        amount_to BIGINT NOT NULL,
        price BIGINT NOT NULL,
        status SMALLINT NOT NULL,
        creation_timestamp BIGINT NOT NULL,
        last_update_timestamp BIGINT NOT NULL,
        last_update_event_idx BIGINT NOT NULL,
        notes TEXT NOT NULL
    );

CREATE INDEX idx_trades_trader ON trades(trader_addr);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_creation ON trades(creation_timestamp DESC);
CREATE INDEX idx_trades_type ON trades(trade_type);
