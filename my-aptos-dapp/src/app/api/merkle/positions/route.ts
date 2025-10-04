import { NextRequest, NextResponse } from 'next/server';
import { getUserPositions } from '@/lib/traderadar/merkleClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('user');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    const positions = await getUserPositions(userAddress);

    const positionsWithMetrics = positions.map((position) => {
      const size = parseFloat(position.size);
      const collateral = parseFloat(position.collateral);
      const entryPrice = parseFloat(position.entryPrice);
      const liquidationPrice = parseFloat(position.liquidationPrice);
      const unrealizedPnl = parseFloat(position.unrealizedPnl);
      const leverage = position.leverage;

      const pnlPercentage =
        collateral > 0 ? (unrealizedPnl / collateral) * 100 : 0;

      const distanceToLiquidation =
        entryPrice > 0
          ? Math.abs((liquidationPrice - entryPrice) / entryPrice) * 100
          : 0;

      const riskLevel =
        distanceToLiquidation < 5
          ? 'high'
          : distanceToLiquidation < 15
          ? 'medium'
          : 'low';

      return {
        user: position.user,
        pair: position.pair,
        size,
        collateral,
        entryPrice,
        liquidationPrice,
        unrealizedPnl,
        pnlPercentage,
        leverage,
        isLong: position.isLong,
        direction: position.isLong ? 'LONG' : 'SHORT',
        distanceToLiquidation,
        riskLevel,
      };
    });

    const totalCollateral = positionsWithMetrics.reduce(
      (sum, pos) => sum + pos.collateral,
      0
    );

    const totalUnrealizedPnl = positionsWithMetrics.reduce(
      (sum, pos) => sum + pos.unrealizedPnl,
      0
    );

    const totalPnlPercentage =
      totalCollateral > 0 ? (totalUnrealizedPnl / totalCollateral) * 100 : 0;

    const longPositions = positionsWithMetrics.filter((pos) => pos.isLong);
    const shortPositions = positionsWithMetrics.filter((pos) => !pos.isLong);

    const highRiskPositions = positionsWithMetrics.filter(
      (pos) => pos.riskLevel === 'high'
    );

    const profitablePositions = positionsWithMetrics.filter(
      (pos) => pos.unrealizedPnl > 0
    );
    const losingPositions = positionsWithMetrics.filter(
      (pos) => pos.unrealizedPnl < 0
    );

    return NextResponse.json({
      positions: positionsWithMetrics,
      count: positionsWithMetrics.length,
      metrics: {
        totalCollateral,
        totalUnrealizedPnl,
        totalPnlPercentage,
        longPositions: longPositions.length,
        shortPositions: shortPositions.length,
        highRiskPositions: highRiskPositions.length,
        profitablePositions: profitablePositions.length,
        losingPositions: losingPositions.length,
        winRate:
          positionsWithMetrics.length > 0
            ? (profitablePositions.length / positionsWithMetrics.length) * 100
            : 0,
      },
      summary: {
        byPair: positionsWithMetrics.reduce((acc, pos) => {
          if (!acc[pos.pair]) {
            acc[pos.pair] = {
              count: 0,
              totalCollateral: 0,
              totalPnl: 0,
              long: 0,
              short: 0,
            };
          }
          acc[pos.pair].count++;
          acc[pos.pair].totalCollateral += pos.collateral;
          acc[pos.pair].totalPnl += pos.unrealizedPnl;
          if (pos.isLong) {
            acc[pos.pair].long++;
          } else {
            acc[pos.pair].short++;
          }
          return acc;
        }, {} as Record<string, { count: number; totalCollateral: number; totalPnl: number; long: number; short: number }>),
        byRisk: {
          high: highRiskPositions.length,
          medium: positionsWithMetrics.filter((pos) => pos.riskLevel === 'medium')
            .length,
          low: positionsWithMetrics.filter((pos) => pos.riskLevel === 'low')
            .length,
        },
      },
    });
  } catch (error) {
    console.error('Error in Merkle positions API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user positions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
