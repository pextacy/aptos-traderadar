// @generated automatically by Diesel CLI.

diesel::table! {
    ledger_infos (chain_id) {
        chain_id -> Int8,
    }
}

diesel::table! {
    messages (message_obj_addr) {
        #[max_length = 300]
        message_obj_addr -> Varchar,
        #[max_length = 300]
        creator_addr -> Varchar,
        creation_timestamp -> Int8,
        last_update_timestamp -> Int8,
        last_update_event_idx -> Int8,
        content -> Text,
    }
}

diesel::table! {
    trades (trade_obj_addr) {
        #[max_length = 300]
        trade_obj_addr -> Varchar,
        #[max_length = 300]
        trader_addr -> Varchar,
        trade_type -> Int2,
        #[max_length = 100]
        token_from -> Varchar,
        #[max_length = 100]
        token_to -> Varchar,
        amount_from -> Int8,
        amount_to -> Int8,
        price -> Int8,
        status -> Int2,
        creation_timestamp -> Int8,
        last_update_timestamp -> Int8,
        last_update_event_idx -> Int8,
        notes -> Text,
    }
}

diesel::table! {
    trader_stats (trader_addr) {
        #[max_length = 300]
        trader_addr -> Varchar,
        creation_timestamp -> Int8,
        last_update_timestamp -> Int8,
        total_trades -> Int8,
        completed_trades -> Int8,
        cancelled_trades -> Int8,
        total_buy_trades -> Int8,
        total_sell_trades -> Int8,
        total_swap_trades -> Int8,
        total_volume -> Int8,
        points -> Int8,
    }
}

diesel::table! {
    module_upgrade_history (module_addr, module_name, upgrade_number) {
        #[max_length = 300]
        module_addr -> Varchar,
        #[max_length = 300]
        module_name -> Varchar,
        upgrade_number -> Int8,
        module_bytecode -> Bytea,
        module_source_code -> Text,
        module_abi -> Json,
        tx_version -> Int8,
    }
}

diesel::table! {
    package_upgrade_history (package_addr, package_name, upgrade_number) {
        #[max_length = 300]
        package_addr -> Varchar,
        #[max_length = 300]
        package_name -> Varchar,
        upgrade_number -> Int8,
        upgrade_policy -> Int8,
        package_manifest -> Text,
        source_digest -> Text,
        tx_version -> Int8,
    }
}

diesel::table! {
    processor_status (processor) {
        #[max_length = 50]
        processor -> Varchar,
        last_success_version -> Int8,
        last_updated -> Timestamp,
        last_transaction_timestamp -> Nullable<Timestamp>,
    }
}

diesel::table! {
    user_stats (user_addr) {
        #[max_length = 300]
        user_addr -> Varchar,
        creation_timestamp -> Int8,
        last_update_timestamp -> Int8,
        created_messages -> Int8,
        updated_messages -> Int8,
        s1_points -> Int8,
        total_points -> Int8,
    }
}

diesel::table! {
    hyperion_pools (pool_address) {
        #[max_length = 300]
        pool_address -> Varchar,
        #[max_length = 300]
        token0_address -> Varchar,
        #[max_length = 300]
        token1_address -> Varchar,
        #[max_length = 50]
        token0_symbol -> Varchar,
        #[max_length = 50]
        token1_symbol -> Varchar,
        fee_tier -> Int4,
        tick_spacing -> Int4,
        #[max_length = 100]
        liquidity -> Varchar,
        #[max_length = 100]
        sqrt_price_x96 -> Varchar,
        tick -> Int4,
        creation_timestamp -> Int8,
        last_update_timestamp -> Int8,
        last_update_version -> Int8,
    }
}

diesel::table! {
    hyperion_swaps (swap_id) {
        #[max_length = 400]
        swap_id -> Varchar,
        #[max_length = 300]
        pool_address -> Varchar,
        #[max_length = 300]
        sender -> Varchar,
        #[max_length = 300]
        recipient -> Varchar,
        #[max_length = 300]
        token_in -> Varchar,
        #[max_length = 300]
        token_out -> Varchar,
        #[max_length = 100]
        amount_in -> Varchar,
        #[max_length = 100]
        amount_out -> Varchar,
        #[max_length = 100]
        sqrt_price_x96_after -> Varchar,
        #[max_length = 100]
        liquidity_after -> Varchar,
        tick_after -> Int4,
        tx_version -> Int8,
        event_idx -> Int8,
        timestamp -> Int8,
    }
}

diesel::table! {
    hyperion_pool_stats (pool_address) {
        #[max_length = 300]
        pool_address -> Varchar,
        #[max_length = 100]
        tvl_usd -> Varchar,
        #[max_length = 100]
        volume_24h -> Varchar,
        #[max_length = 100]
        volume_7d -> Varchar,
        #[max_length = 100]
        fees_24h -> Varchar,
        #[max_length = 100]
        fees_7d -> Varchar,
        #[max_length = 50]
        apr -> Varchar,
        swap_count_24h -> Int8,
        swap_count_7d -> Int8,
        unique_traders_24h -> Int8,
        unique_traders_7d -> Int8,
        #[max_length = 100]
        last_price -> Varchar,
        #[max_length = 50]
        price_change_24h -> Varchar,
        last_update_timestamp -> Int8,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    ledger_infos,
    messages,
    module_upgrade_history,
    package_upgrade_history,
    processor_status,
    user_stats,
    trades,
    trader_stats,
    hyperion_pools,
    hyperion_swaps,
    hyperion_pool_stats,
);
