import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/analytics-board-trades/data-table";
import { columns } from "@/components/analytics-board-trades/columns";

export const TraderAnalytics = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trader Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable columns={columns} />
      </CardContent>
    </Card>
  );
};
