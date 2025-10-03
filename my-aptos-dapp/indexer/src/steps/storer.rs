use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::{
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;

use super::{
    extractor::{ContractEvent, ContractUpgradeChange, TransactionContextData},
    storers::{
        create_message_event_storer::process_create_message_events,
        update_message_event_storer::process_update_message_events,
        upgrade_module_change_storer::process_upgrade_module_changes,
        upgrade_package_change_storer::process_upgrade_package_changes,
        create_trade_event_storer::process_create_trade_events,
        update_trade_event_storer::process_update_trade_events,
        complete_trade_event_storer::process_complete_trade_events,
        cancel_trade_event_storer::process_cancel_trade_events,
        hyperion_pool_storer::process_hyperion_pool_events,
        hyperion_swap_storer::process_hyperion_swap_events,
    },
};
use crate::utils::database_utils::ArcDbPool;

/// Storer is a step that inserts events in the database.
pub struct Storer
where
    Self: Sized + Send + 'static,
{
    pool: ArcDbPool,
}

impl AsyncStep for Storer {}

impl NamedStep for Storer {
    fn name(&self) -> String {
        "Storer".to_string()
    }
}

impl Storer {
    pub fn new(pool: ArcDbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl Processable for Storer {
    type Input = TransactionContextData;
    type Output = TransactionContextData;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        transaction_context_data: TransactionContext<TransactionContextData>,
    ) -> Result<Option<TransactionContext<TransactionContextData>>, ProcessorError> {
        let per_table_chunk_sizes: AHashMap<String, usize> = AHashMap::new();
        let data = transaction_context_data.data.clone();
        let (create_msg_events, update_msg_events, create_trade_events, update_trade_events, complete_trade_events, cancel_trade_events, hyperion_pools, hyperion_swaps) = data.events.into_iter().fold(
            (vec![], vec![], vec![], vec![], vec![], vec![], vec![], vec![]),
            |(mut create_msg, mut update_msg, mut create_trade, mut update_trade, mut complete_trade, mut cancel_trade, mut h_pools, mut h_swaps), event| {
                match event {
                    ContractEvent::CreateMessageEvent(message) => {
                        create_msg.push(message);
                    }
                    ContractEvent::UpdateMessageEvent(message) => {
                        update_msg.push(message);
                    }
                    ContractEvent::CreateTradeEvent(trade, seq) => {
                        create_trade.push((trade, seq));
                    }
                    ContractEvent::UpdateTradeEvent(trade, seq) => {
                        update_trade.push((trade, seq));
                    }
                    ContractEvent::CompleteTradeEvent(trade, seq) => {
                        complete_trade.push((trade, seq));
                    }
                    ContractEvent::CancelTradeEvent(trade, seq) => {
                        cancel_trade.push((trade, seq));
                    }
                    ContractEvent::HyperionPoolCreated(pool) | ContractEvent::HyperionPoolStateUpdate(pool) => {
                        h_pools.push(pool);
                    }
                    ContractEvent::HyperionSwap(swap) => {
                        h_swaps.push(swap);
                    }
                }
                (create_msg, update_msg, create_trade, update_trade, complete_trade, cancel_trade, h_pools, h_swaps)
            },
        );

        process_create_message_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            create_msg_events,
        )
        .await?;

        process_update_message_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            update_msg_events,
        )
        .await?;

        process_create_trade_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            create_trade_events,
        )
        .await?;

        process_update_trade_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            update_trade_events,
        )
        .await?;

        process_complete_trade_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            complete_trade_events,
        )
        .await?;

        process_cancel_trade_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            cancel_trade_events,
        )
        .await?;

        process_hyperion_pool_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            hyperion_pools,
        )
        .await?;

        process_hyperion_swap_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            hyperion_swaps,
        )
        .await?;

        let (module_upgrades, package_upgrades) = data.changes.into_iter().fold(
            (vec![], vec![]),
            |(mut module_upgrades, mut package_upgrades), upgrade_change| {
                match upgrade_change {
                    ContractUpgradeChange::ModuleUpgradeChange(module_upgrade) => {
                        module_upgrades.push(module_upgrade);
                    }
                    ContractUpgradeChange::PackageUpgradeChange(package_upgrade) => {
                        package_upgrades.push(package_upgrade);
                    }
                }
                (module_upgrades, package_upgrades)
            },
        );

        process_upgrade_module_changes(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            module_upgrades,
        )
        .await?;

        process_upgrade_package_changes(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            package_upgrades,
        )
        .await?;

        Ok(Some(transaction_context_data))
    }
}
