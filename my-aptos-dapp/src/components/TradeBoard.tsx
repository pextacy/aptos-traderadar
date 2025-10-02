import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/trade-board/data-table";
import { columns } from "@/components/trade-board/columns";

export const TradeBoard = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Radar - Live Trades</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable columns={columns} />
      </CardContent>
    </Card>
  );
};
