import { NextRequest, NextResponse } from 'next/server';
import {
  queryPoolFromBlockchain,
  getTokenMetadata,
  calculateTVLFromBlockchain,
  getPoolLiquidity,
  getCurrentPrice,
  getPoolTokenAddresses,
  getPoolFee,
  getAllPoolAddresses,
  getPoolPerformanceMetrics,
} from '@/lib/traderadar/hyperionUtils';
import { fetchMultipleTokenPrices } from '@/lib/traderadar/priceOracle';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const poolAddress = searchParams.get('pool');
    const action = searchParams.get('action') || 'pool';

    if (action === 'pools') {
      const poolAddresses = await getAllPoolAddresses();

      return NextResponse.json({
        pools: poolAddresses,
        count: poolAddresses.length,
      });
    }

    if (action === 'pool' && poolAddress) {
      const poolData = await queryPoolFromBlockchain(poolAddress);

      if (!poolData) {
        return NextResponse.json(
          { error: 'Pool not found on blockchain' },
          { status: 404 }
        );
      }

      const tokenAddresses = await getPoolTokenAddresses(poolAddress);
      let token0Metadata = null;
      let token1Metadata = null;

      if (tokenAddresses) {
        [token0Metadata, token1Metadata] = await Promise.all([
          getTokenMetadata(tokenAddresses.token0),
          getTokenMetadata(tokenAddresses.token1),
        ]);
      }

      const liquidity = await getPoolLiquidity(poolAddress);
      const currentPrice = await getCurrentPrice(poolAddress);
      const fee = await getPoolFee(poolAddress);

      let tvl = 0;
      if (token0Metadata && token1Metadata && liquidity) {
        const prices = await fetchMultipleTokenPrices([
          token0Metadata.symbol,
          token1Metadata.symbol,
        ]);

        const token0Price = prices[token0Metadata.symbol] || 0;
        const token1Price = prices[token1Metadata.symbol] || 0;

        tvl = await calculateTVLFromBlockchain(poolAddress, token0Price, token1Price);
      }

      return NextResponse.json({
        pool: {
          address: poolAddress,
          poolData,
          token0: token0Metadata,
          token1: token1Metadata,
          liquidity: liquidity
            ? {
                token0: liquidity.token0.toString(),
                token1: liquidity.token1.toString(),
              }
            : null,
          currentPrice,
          fee,
          tvl,
        },
      });
    }

    if (action === 'metrics' && poolAddress) {
      const metrics = await getPoolPerformanceMetrics(poolAddress);

      if (!metrics) {
        return NextResponse.json(
          { error: 'Failed to calculate pool metrics' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        pool: poolAddress,
        metrics: {
          currentPrice: metrics.currentPrice,
          liquidity: metrics.liquidity
            ? {
                token0: metrics.liquidity.token0.toString(),
                token1: metrics.liquidity.token1.toString(),
              }
            : null,
          fee: metrics.fee,
          estimatedAPR: metrics.estimatedAPR,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing pool parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in blockchain API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch blockchain data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
