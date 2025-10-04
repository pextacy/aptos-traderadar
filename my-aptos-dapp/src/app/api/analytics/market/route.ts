import { NextRequest, NextResponse } from 'next/server';
import {
  getAllHyperionPools,
  getPoolPerformanceMetrics,
} from '@/lib/traderadar/hyperionUtils';
import {
  analyzePairTrend,
  detectArbitrageOpportunities,
  analyzeLiquidityDepth,
  calculateImpermanentLoss,
  predictPriceMovement,
  identifyMarketRegime,
  detectMarketManipulation,
} from '@/lib/traderadar/marketAnalysis';
import { getPoolVolumeTimeSeries } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const analysis = searchParams.get('analysis') || 'overview';
    const poolAddress = searchParams.get('pool');

    switch (analysis) {
      case 'overview': {
        const pools = await getAllHyperionPools();

        const totalTvl = pools.reduce((sum, pool) => sum + pool.tvl, 0);
        const totalVolume = pools.reduce((sum, pool) => sum + pool.volume24h, 0);
        const avgAPR = pools.length > 0
          ? pools.reduce((sum, pool) => sum + pool.apr, 0) / pools.length
          : 0;

        const bullishPools = pools.filter(
          (p) => (p.priceChange24h || 0) > 2
        ).length;

        const bearishPools = pools.filter(
          (p) => (p.priceChange24h || 0) < -2
        ).length;

        const neutralPools = pools.length - bullishPools - bearishPools;

        return NextResponse.json({
          marketOverview: {
            totalTVL: totalTvl,
            totalVolume24h: totalVolume,
            averageAPR: avgAPR,
            totalPools: pools.length,
            sentiment: {
              bullish: bullishPools,
              bearish: bearishPools,
              neutral: neutralPools,
            },
          },
        });
      }

      case 'arbitrage': {
        const pools = await getAllHyperionPools();
        const minProfitPercent = parseFloat(
          searchParams.get('minProfit') || '1.0'
        );

        const opportunities = detectArbitrageOpportunities(
          pools,
          minProfitPercent
        );

        return NextResponse.json({
          opportunities: opportunities.map((opp) => ({
            pool1: opp.pool1,
            pool2: opp.pool2,
            tokenPair: opp.tokenPair,
            priceDiscrepancy: opp.priceDiscrepancy,
            potentialProfit: opp.potentialProfit,
            volume: opp.volume,
          })),
          count: opportunities.length,
          minProfitThreshold: minProfitPercent,
        });
      }

      case 'liquidity-depth': {
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required for liquidity depth analysis' },
            { status: 400 }
          );
        }

        const pools = await getAllHyperionPools();
        const pool = pools.find((p) => p.poolAddress === poolAddress);

        if (!pool) {
          return NextResponse.json(
            { error: 'Pool not found' },
            { status: 404 }
          );
        }

        const liquidityAnalysis = analyzeLiquidityDepth(pool);

        return NextResponse.json({
          poolAddress,
          liquidityDepth: {
            depth: liquidityAnalysis.depth,
            concentration: liquidityAnalysis.concentration,
            stability: liquidityAnalysis.stability,
            riskScore: liquidityAnalysis.riskScore,
            riskLevel:
              liquidityAnalysis.riskScore > 70
                ? 'high'
                : liquidityAnalysis.riskScore > 40
                ? 'medium'
                : 'low',
          },
        });
      }

      case 'trend': {
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required for trend analysis' },
            { status: 400 }
          );
        }

        const timeSeries = await getPoolVolumeTimeSeries(poolAddress, 60, 168);

        const prices = timeSeries.map(
          (bucket) =>
            parseFloat(String(bucket.volume_out)) /
            Math.max(parseFloat(String(bucket.volume_in)), 1)
        );

        const volumes = timeSeries.map((bucket) =>
          parseFloat(String(bucket.volume_in)) +
          parseFloat(String(bucket.volume_out))
        );

        const currentPrice = prices[prices.length - 1] || 0;

        const trend = await analyzePairTrend(currentPrice, prices, volumes);

        const marketRegime = identifyMarketRegime(prices, volumes);

        const prediction = await predictPriceMovement(prices, volumes);

        return NextResponse.json({
          poolAddress,
          trend: {
            direction: trend.direction,
            strength: trend.strength,
            indicators: trend.indicators,
          },
          marketRegime,
          prediction: {
            expectedChange: prediction.predictedChange,
            confidence: prediction.confidence,
            timeframe: prediction.timeframe,
          },
        });
      }

      case 'impermanent-loss': {
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required for IL calculation' },
            { status: 400 }
          );
        }

        const initialRatio = parseFloat(
          searchParams.get('initialRatio') || '1.0'
        );

        const pools = await getAllHyperionPools();
        const pool = pools.find((p) => p.poolAddress === poolAddress);

        if (!pool) {
          return NextResponse.json(
            { error: 'Pool not found' },
            { status: 404 }
          );
        }

        const currentRatio =
          Number(pool.reserve1) / Math.max(Number(pool.reserve0), 1);

        const impermanentLoss = calculateImpermanentLoss(
          currentRatio,
          initialRatio
        );

        const feesEarned = pool.apr > 0 ? pool.tvl * (pool.apr / 100) / 365 : 0;

        const netReturn = feesEarned - (pool.tvl * impermanentLoss) / 100;

        return NextResponse.json({
          poolAddress,
          impermanentLoss: {
            percentage: impermanentLoss,
            initialRatio,
            currentRatio,
            estimatedDailyFeesEarned: feesEarned,
            netDailyReturn: netReturn,
            breakEvenDays:
              impermanentLoss > 0 && feesEarned > 0
                ? (pool.tvl * impermanentLoss / 100) / feesEarned
                : 0,
          },
        });
      }

      case 'manipulation': {
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required for manipulation detection' },
            { status: 400 }
          );
        }

        const timeSeries = await getPoolVolumeTimeSeries(poolAddress, 60, 72);

        const volumes = timeSeries.map((bucket) =>
          parseFloat(String(bucket.volume_in)) +
          parseFloat(String(bucket.volume_out))
        );

        const prices = timeSeries.map(
          (bucket) =>
            parseFloat(String(bucket.volume_out)) /
            Math.max(parseFloat(String(bucket.volume_in)), 1)
        );

        const manipulationAnalysis = await detectMarketManipulation(
          volumes,
          prices
        );

        return NextResponse.json({
          poolAddress,
          manipulation: {
            suspicious: manipulationAnalysis.suspicious,
            riskLevel: manipulationAnalysis.riskLevel,
            indicators: manipulationAnalysis.indicators,
          },
          timestamp: Date.now(),
        });
      }

      case 'performance': {
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required for performance metrics' },
            { status: 400 }
          );
        }

        const metrics = await getPoolPerformanceMetrics(poolAddress);

        if (!metrics) {
          return NextResponse.json(
            { error: 'Failed to fetch pool metrics' },
            { status: 500 }
          );
        }

        const pools = await getAllHyperionPools();
        const pool = pools.find((p) => p.poolAddress === poolAddress);

        const volumeToTvlRatio = pool
          ? pool.tvl > 0
            ? pool.volume24h / pool.tvl
            : 0
          : 0;

        return NextResponse.json({
          poolAddress,
          performance: {
            currentPrice: metrics.currentPrice,
            liquidity: metrics.liquidity
              ? {
                  token0: metrics.liquidity.token0.toString(),
                  token1: metrics.liquidity.token1.toString(),
                }
              : null,
            fee: metrics.fee,
            estimatedAPR: metrics.estimatedAPR,
            volumeToTVLRatio: volumeToTvlRatio,
            efficiency:
              volumeToTvlRatio > 1
                ? 'high'
                : volumeToTvlRatio > 0.5
                ? 'medium'
                : 'low',
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in market analysis API:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform market analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
