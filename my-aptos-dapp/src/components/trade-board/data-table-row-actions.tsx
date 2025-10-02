"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trade } from "@/lib/type/trade";
import { ExplorerLink } from "@/components/ExplorerLink";

interface DataTableRowActionsProps {
  row: Row<Trade>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const trade = row.original;
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
