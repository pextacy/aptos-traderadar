import { TradeBoard } from "@/components/TradeBoard";
import { CreateTrade } from "@/components/CreateTrade";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <TradeBoard />
      <CreateTrade />
    </div>
  );
}
