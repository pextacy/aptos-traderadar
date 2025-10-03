"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trade, TradeStatus } from "@/lib/type/trade";
import { ExplorerLink } from "@/components/ExplorerLink";
import { completeTrade } from "@/entry-functions/completeTrade";
import { cancelTrade } from "@/entry-functions/cancelTrade";
import { getAptosClient } from "@/lib/aptos";
import { useToast } from "@/components/ui/use-toast";
import { TransactionOnExplorer } from "@/components/ExplorerLink";
import { UpdateTrade } from "@/components/UpdateTrade";

interface DataTableRowActionsProps {
  row: Row<Trade>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const trade = row.original;
  const { toast } = useToast();
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const handleCompleteTrade = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    signAndSubmitTransaction(
      completeTrade({ tradeObjAddr: trade.trade_obj_addr })
    )
      .then((committedTransaction) => {
        return getAptosClient().waitForTransaction({
          transactionHash: committedTransaction.hash,
        });
      })
      .then((executedTransaction) => {
        toast({
          title: "Trade Completed",
          description: (
            <TransactionOnExplorer hash={executedTransaction.hash} />
          ),
        });
        return new Promise((resolve) => setTimeout(resolve, 3000));
      })
      .then(() => {
        return queryClient.invalidateQueries({ queryKey: ["trades"] });
      })
      .catch((error) => {
        console.error("Error completing trade", error);
        toast({
          title: "Error",
          description: "Failed to complete trade",
          variant: "destructive",
        });
      });
  };

  const handleCancelTrade = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    signAndSubmitTransaction(
      cancelTrade({ tradeObjAddr: trade.trade_obj_addr })
    )
      .then((committedTransaction) => {
        return getAptosClient().waitForTransaction({
          transactionHash: committedTransaction.hash,
        });
      })
      .then((executedTransaction) => {
        toast({
          title: "Trade Cancelled",
          description: (
            <TransactionOnExplorer hash={executedTransaction.hash} />
          ),
        });
        return new Promise((resolve) => setTimeout(resolve, 3000));
      })
      .then(() => {
        return queryClient.invalidateQueries({ queryKey: ["trades"] });
      })
      .catch((error) => {
        console.error("Error cancelling trade", error);
        toast({
          title: "Error",
          description: "Failed to cancel trade",
          variant: "destructive",
        });
      });
  };

  const isOwnTrade = connected && account?.address?.toString() === trade.trader_addr;
  const isPending = trade.status === TradeStatus.PENDING;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem>
          <ExplorerLink address={trade.trade_obj_addr} type="object">
            View on Explorer
          </ExplorerLink>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ExplorerLink address={trade.trader_addr} type="account">
            View Trader
          </ExplorerLink>
        </DropdownMenuItem>
        {isOwnTrade && isPending && (
          <>
            <DropdownMenuSeparator />
            <UpdateTrade trade={trade}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Update Trade
              </DropdownMenuItem>
            </UpdateTrade>
            <DropdownMenuItem onClick={handleCompleteTrade}>
              Mark as Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCancelTrade} className="text-destructive">
              Cancel Trade
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
