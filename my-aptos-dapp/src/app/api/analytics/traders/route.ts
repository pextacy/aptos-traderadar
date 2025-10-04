import { NextRequest, NextResponse } from 'next/server';
import { getTopTraders, getRecentLargeTrades } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'top';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const hours = parseInt(searchParams.get('hours') || '24', 10);

    switch (action) {
      case 'top': {
        const topTraders = await getTopTraders(limit, hours);

        const tradersWithMetrics = topTraders.map((trader) => ({
          address: trader.sender,
          swapCount: parseInt(String(trader.swap_count)),
          totalVolume: parseFloat(String(trader.total_volume)),
          poolsTraded: parseInt(String(trader.pools_traded)),
          avgVolumePerSwap:
            parseInt(String(trader.swap_count)) > 0
              ? parseFloat(String(trader.total_volume)) /
                parseInt(String(trader.swap_count))
              : 0,
        }));

        const totalVolume = tradersWithMetrics.reduce(
          (sum, trader) => sum + trader.totalVolume,
          0
        );

        const totalSwaps = tradersWithMetrics.reduce(
          (sum, trader) => sum + trader.swapCount,
          0
        );

        return NextResponse.json({
          traders: tradersWithMetrics,
          count: tradersWithMetrics.length,
          timeframe: `${hours}h`,
          metrics: {
            totalVolume,
            totalSwaps,
            avgVolumePerTrader:
              tradersWithMetrics.length > 0
                ? totalVolume / tradersWithMetrics.length
                : 0,
            avgSwapsPerTrader:
              tradersWithMetrics.length > 0
                ? totalSwaps / tradersWithMetrics.length
                : 0,
          },
        });
      }

      case 'large-trades': {
        const minVolume = parseFloat(
          searchParams.get('minVolume') || '1000'
        );
        const largeTrades = await getRecentLargeTrades(minVolume, limit);

        const tradesWithMetrics = largeTrades.map((trade) => ({
          transactionHash: trade.transaction_hash,
          trader: trade.sender,
          poolAddress: trade.pool_address,
          pair: `${trade.token0_symbol}/${trade.token1_symbol}`,
          amountIn: parseFloat(String(trade.amount_in)),
          amountOut: parseFloat(String(trade.amount_out)),
          timestamp: parseInt(String(trade.timestamp)),
          date: new Date(parseInt(String(trade.timestamp)) * 1000).toISOString(),
        }));

        const totalVolumeIn = tradesWithMetrics.reduce(
          (sum, trade) => sum + trade.amountIn,
          0
        );

        const totalVolumeOut = tradesWithMetrics.reduce(
          (sum, trade) => sum + trade.amountOut,
          0
        );

        const uniqueTraders = new Set(
          tradesWithMetrics.map((t) => t.trader)
        ).size;

        const uniquePools = new Set(
          tradesWithMetrics.map((t) => t.poolAddress)
        ).size;

        return NextResponse.json({
          trades: tradesWithMetrics,
          count: tradesWithMetrics.length,
          minVolume,
          metrics: {
            totalVolumeIn,
            totalVolumeOut,
            uniqueTraders,
            uniquePools,
            avgTradeSize:
              tradesWithMetrics.length > 0
                ? totalVolumeIn / tradesWithMetrics.length
                : 0,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in traders analytics API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch trader analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
