"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { TraderStat } from "@/lib/type/trader_stats";
import { ExplorerLink } from "@/components/ExplorerLink";

export const columns: ColumnDef<TraderStat>[] = [
  {
    accessorKey: "trader_addr",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trader Address" />
    ),
    cell: ({ row }) => {
      const addr = row.getValue("trader_addr") as string;
      return (
        <div className="w-[120px]">
          <ExplorerLink address={addr} type="account">
            {addr.slice(0, 6)}...{addr.slice(-4)}
          </ExplorerLink>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "total_trades",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Trades" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">{row.getValue("total_trades")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "completed_trades",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Completed" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">{row.getValue("completed_trades")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "total_buy_trades",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Buys" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("total_buy_trades")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "total_sell_trades",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sells" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("total_sell_trades")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "total_swap_trades",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Swaps" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("total_swap_trades")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "total_volume",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Volume" />
    ),
    cell: ({ row }) => {
      const volume = row.getValue("total_volume") as number;
      return <div className="w-[120px]">{(volume / 100000000).toFixed(4)} APT</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "points",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Points" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] font-bold">{row.getValue("points")}</div>
    ),
    enableSorting: true,
  },
];
