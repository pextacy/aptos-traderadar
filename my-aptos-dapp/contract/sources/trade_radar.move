module message_board_addr::trade_radar {
    use std::signer;
    use std::string::String;

    use aptos_framework::event;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    /// Only the trade creator can update the trade
    const ERR_ONLY_TRADE_CREATOR_CAN_UPDATE: u64 = 1;
    /// Invalid trade type
    const ERR_INVALID_TRADE_TYPE: u64 = 2;
    /// Invalid trade status
    const ERR_INVALID_TRADE_STATUS: u64 = 3;
    /// Invalid price or amount
    const ERR_INVALID_AMOUNT: u64 = 4;

    /// Trade types
    const TRADE_TYPE_BUY: u8 = 1;
    const TRADE_TYPE_SELL: u8 = 2;
    const TRADE_TYPE_SWAP: u8 = 3;

    /// Trade status
    const TRADE_STATUS_PENDING: u8 = 1;
    const TRADE_STATUS_COMPLETED: u8 = 2;
    const TRADE_STATUS_CANCELLED: u8 = 3;

    struct Trade has copy, drop, key, store {
        trader: address,
        trade_type: u8,         // 1=BUY, 2=SELL, 3=SWAP
        token_from: String,     // Token being sold/swapped from
        token_to: String,       // Token being bought/swapped to
        amount_from: u64,       // Amount of token_from
        amount_to: u64,         // Amount of token_to
        price: u64,             // Price in smallest unit (e.g., octas)
        status: u8,             // 1=PENDING, 2=COMPLETED, 3=CANCELLED
        creation_timestamp: u64,
        last_update_timestamp: u64,
        notes: String,          // Additional notes or description
    }

    #[event]
    struct CreateTradeEvent has drop, store {
        trade_obj_addr: address,
        trade: Trade,
    }

    #[event]
    struct UpdateTradeEvent has drop, store {
        trade_obj_addr: address,
        trade: Trade,
    }

    #[event]
    struct CompleteTradeEvent has drop, store {
        trade_obj_addr: address,
        trade: Trade,
    }

    #[event]
    struct CancelTradeEvent has drop, store {
        trade_obj_addr: address,
        trade: Trade,
    }

    // This function is only called once when the module is published for the first time.
    fun init_module(_sender: &signer) {}

    // ======================== Write functions ========================

    /// Create a new trade entry
    public entry fun create_trade(
        sender: &signer,
        trade_type: u8,
        token_from: String,
        token_to: String,
        amount_from: u64,
        amount_to: u64,
        price: u64,
        notes: String,
    ) {
        assert!(trade_type >= TRADE_TYPE_BUY && trade_type <= TRADE_TYPE_SWAP, ERR_INVALID_TRADE_TYPE);
        assert!(amount_from > 0 && amount_to > 0 && price > 0, ERR_INVALID_AMOUNT);

        let trade_obj_constructor_ref = &object::create_object(@message_board_addr);
        let trade_obj_signer = &object::generate_signer(trade_obj_constructor_ref);
        let time_now = timestamp::now_seconds();

        let trade = Trade {
            trader: signer::address_of(sender),
            trade_type,
            token_from,
            token_to,
            amount_from,
            amount_to,
            price,
            status: TRADE_STATUS_PENDING,
            creation_timestamp: time_now,
            last_update_timestamp: time_now,
            notes,
        };

        move_to(trade_obj_signer, trade);

        event::emit(CreateTradeEvent {
            trade_obj_addr: object::address_from_constructor_ref(trade_obj_constructor_ref),
            trade,
        });
    }

    /// Update an existing trade, only trade creator can call
    public entry fun update_trade(
        sender: &signer,
        trade_obj: Object<Trade>,
        amount_from: u64,
        amount_to: u64,
        price: u64,
        notes: String,
    ) acquires Trade {
        let trade = borrow_global_mut<Trade>(object::object_address(&trade_obj));
        assert!(trade.trader == signer::address_of(sender), ERR_ONLY_TRADE_CREATOR_CAN_UPDATE);
        assert!(amount_from > 0 && amount_to > 0 && price > 0, ERR_INVALID_AMOUNT);

        trade.amount_from = amount_from;
        trade.amount_to = amount_to;
        trade.price = price;
        trade.notes = notes;
        trade.last_update_timestamp = timestamp::now_seconds();

        event::emit(UpdateTradeEvent {
            trade_obj_addr: object::object_address(&trade_obj),
            trade: *trade,
        });
    }

    /// Mark a trade as completed
    public entry fun complete_trade(
        sender: &signer,
        trade_obj: Object<Trade>,
    ) acquires Trade {
        let trade = borrow_global_mut<Trade>(object::object_address(&trade_obj));
        assert!(trade.trader == signer::address_of(sender), ERR_ONLY_TRADE_CREATOR_CAN_UPDATE);
        assert!(trade.status == TRADE_STATUS_PENDING, ERR_INVALID_TRADE_STATUS);

        trade.status = TRADE_STATUS_COMPLETED;
        trade.last_update_timestamp = timestamp::now_seconds();

        event::emit(CompleteTradeEvent {
            trade_obj_addr: object::object_address(&trade_obj),
            trade: *trade,
        });
    }

    /// Cancel a trade
    public entry fun cancel_trade(
        sender: &signer,
        trade_obj: Object<Trade>,
    ) acquires Trade {
        let trade = borrow_global_mut<Trade>(object::object_address(&trade_obj));
        assert!(trade.trader == signer::address_of(sender), ERR_ONLY_TRADE_CREATOR_CAN_UPDATE);
        assert!(trade.status == TRADE_STATUS_PENDING, ERR_INVALID_TRADE_STATUS);

        trade.status = TRADE_STATUS_CANCELLED;
        trade.last_update_timestamp = timestamp::now_seconds();

        event::emit(CancelTradeEvent {
            trade_obj_addr: object::object_address(&trade_obj),
            trade: *trade,
        });
    }

    // ======================== Read Functions ========================

    #[view]
    /// Get trade details
    public fun get_trade(trade_obj: Object<Trade>): (
        address,    // trader
        u8,         // trade_type
        String,     // token_from
        String,     // token_to
        u64,        // amount_from
        u64,        // amount_to
        u64,        // price
        u8,         // status
        u64,        // creation_timestamp
        u64,        // last_update_timestamp
        String,     // notes
    ) acquires Trade {
        let trade = borrow_global<Trade>(object::object_address(&trade_obj));
        (
            trade.trader,
            trade.trade_type,
            trade.token_from,
            trade.token_to,
            trade.amount_from,
            trade.amount_to,
            trade.price,
            trade.status,
            trade.creation_timestamp,
            trade.last_update_timestamp,
            trade.notes,
        )
    }

    #[view]
    /// Get trade status
    public fun get_trade_status(trade_obj: Object<Trade>): u8 acquires Trade {
        let trade = borrow_global<Trade>(object::object_address(&trade_obj));
        trade.status
    }

    // ================================= Unit Tests Helper ================================== //

    #[test_only]
    public fun init_module_for_test(aptos_framework: &signer, sender: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        init_module(sender);
    }

    #[test_only]
    public fun get_trade_obj_from_create_event(event: &CreateTradeEvent): Object<Trade> {
        object::address_to_object(event.trade_obj_addr)
    }

    #[test_only]
    public fun get_trade_obj_from_update_event(event: &UpdateTradeEvent): Object<Trade> {
        object::address_to_object(event.trade_obj_addr)
    }

    #[test_only]
    public fun get_trade_obj_from_complete_event(event: &CompleteTradeEvent): Object<Trade> {
        object::address_to_object(event.trade_obj_addr)
    }

    #[test_only]
    public fun get_trade_obj_from_cancel_event(event: &CancelTradeEvent): Object<Trade> {
        object::address_to_object(event.trade_obj_addr)
    }
}
