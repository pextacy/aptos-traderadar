import { NextRequest, NextResponse } from 'next/server';
import { getMerklePairs, getMerkleMarketData } from '@/lib/traderadar/merkleClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (symbol) {
      const marketData = await getMerkleMarketData(symbol);

      if (!marketData) {
        return NextResponse.json(
          { error: 'Market data not found for symbol' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        pair: marketData,
      });
    }

    const pairs = await getMerklePairs();

    const pairsWithMetrics = pairs.map((pair) => ({
      symbol: pair.symbol,
      baseAsset: pair.baseAsset,
      quoteAsset: pair.quoteAsset,
      markPrice: parseFloat(pair.markPrice),
      indexPrice: parseFloat(pair.indexPrice),
      volume24h: parseFloat(pair.volume24h),
      priceChange24h: parseFloat(pair.priceChange24h),
      fundingRate: parseFloat(pair.fundingRate),
      fundingRatePercentage: (parseFloat(pair.fundingRate) * 100).toFixed(4),
      isLongFavorable: parseFloat(pair.fundingRate) < 0,
    }));

    const totalVolume24h = pairsWithMetrics.reduce(
      (sum, pair) => sum + pair.volume24h,
      0
    );

    const avgFundingRate =
      pairsWithMetrics.length > 0
        ? pairsWithMetrics.reduce((sum, pair) => sum + pair.fundingRate, 0) /
          pairsWithMetrics.length
        : 0;

    const topPairsByVolume = [...pairsWithMetrics]
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 5);

    const mostVolatilePairs = [...pairsWithMetrics]
      .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))
      .slice(0, 5);

    return NextResponse.json({
      pairs: pairsWithMetrics,
      count: pairsWithMetrics.length,
      metrics: {
        totalVolume24h,
        avgFundingRate,
        topPairsByVolume: topPairsByVolume.map((p) => ({
          symbol: p.symbol,
          volume24h: p.volume24h,
        })),
        mostVolatilePairs: mostVolatilePairs.map((p) => ({
          symbol: p.symbol,
          priceChange24h: p.priceChange24h,
        })),
      },
    });
  } catch (error) {
    console.error('Error in Merkle pairs API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Merkle pairs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
