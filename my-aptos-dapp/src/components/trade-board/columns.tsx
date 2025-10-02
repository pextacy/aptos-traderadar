"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowActions } from "@/components/trade-board/data-table-row-actions";
import { Trade, TradeTypeLabels, TradeStatusLabels } from "@/lib/type/trade";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: "trade_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("trade_type") as number;
      return <Badge variant="outline">{TradeTypeLabels[type]}</Badge>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "token_from",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="From" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("token_from")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "token_to",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="To" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("token_to")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "amount_from",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount_from") as number;
      return <div className="w-[100px]">{(amount / 100000000).toFixed(4)}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <div className="w-[100px]">{(price / 100000000).toFixed(4)} APT</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as number;
      const variant = status === 1 ? "default" : status === 2 ? "secondary" : "destructive";
      return <Badge variant={variant}>{TradeStatusLabels[status]}</Badge>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "creation_timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <div className="w-[140px]">
        {new Date(
          (row.getValue("creation_timestamp") as number) * 1000
        ).toLocaleString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
