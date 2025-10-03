import { TradeBoard } from "@/components/TradeBoard";
import { CreateTrade } from "@/components/CreateTrade";
import { Dashboard } from "@/components/Dashboard";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Dashboard />
      <TradeBoard />
      <CreateTrade />
    </div>
  );
}
