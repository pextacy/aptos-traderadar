import { HyperionPool } from './types';

export interface MarketTrend {
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  indicators: {
    priceChange: number;
    volumeChange: number;
    liquidityChange: number;
  };
}

export interface ArbitrageOpportunity {
  pool1: string;
  pool2: string;
  tokenPair: string;
  priceDiscrepancy: number;
  potentialProfit: number;
  volume: number;
}

export interface LiquidityAnalysis {
  depth: number;
  concentration: number;
  stability: number;
  riskScore: number;
}

export async function analyzePairTrend(
  currentPrice: number,
  priceHistory: number[],
  volumeHistory: number[]
): Promise<MarketTrend> {
  if (priceHistory.length < 2 || volumeHistory.length < 2) {
    return {
      direction: 'neutral',
      strength: 0,
      indicators: { priceChange: 0, volumeChange: 0, liquidityChange: 0 },
    };
  }

  const priceChange =
    ((currentPrice - priceHistory[0]) / priceHistory[0]) * 100;

  const avgOldVolume = volumeHistory.slice(0, Math.floor(volumeHistory.length / 2))
    .reduce((a, b) => a + b, 0) / Math.floor(volumeHistory.length / 2);

  const avgNewVolume = volumeHistory.slice(Math.floor(volumeHistory.length / 2))
    .reduce((a, b) => a + b, 0) / Math.ceil(volumeHistory.length / 2);

  const volumeChange = avgOldVolume > 0
    ? ((avgNewVolume - avgOldVolume) / avgOldVolume) * 100
    : 0;

  let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  let strength = 0;

  if (priceChange > 2 && volumeChange > 20) {
    direction = 'bullish';
    strength = Math.min(Math.abs(priceChange) + Math.abs(volumeChange) / 2, 100);
  } else if (priceChange < -2 && volumeChange > 20) {
    direction = 'bearish';
    strength = Math.min(Math.abs(priceChange) + Math.abs(volumeChange) / 2, 100);
  } else if (Math.abs(priceChange) > 5) {
    direction = priceChange > 0 ? 'bullish' : 'bearish';
    strength = Math.min(Math.abs(priceChange), 100);
  }

  return {
    direction,
    strength,
    indicators: {
      priceChange,
      volumeChange,
      liquidityChange: 0,
    },
  };
}

export function detectArbitrageOpportunities(
  pools: HyperionPool[],
  minProfitPercent = 1.0
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  for (let i = 0; i < pools.length; i++) {
    for (let j = i + 1; j < pools.length; j++) {
      const pool1 = pools[i];
      const pool2 = pools[j];

      if (
        (pool1.token0 === pool2.token0 && pool1.token1 === pool2.token1) ||
        (pool1.token0 === pool2.token1 && pool1.token1 === pool2.token0)
      ) {
        const price1 = Number(pool1.reserve1) / Number(pool1.reserve0);
        const price2 = Number(pool2.reserve1) / Number(pool2.reserve0);

        const priceDiscrepancy = Math.abs(price1 - price2) / Math.min(price1, price2) * 100;

        if (priceDiscrepancy >= minProfitPercent) {
          const volume = Math.min(pool1.volume24h, pool2.volume24h);
          const potentialProfit = (priceDiscrepancy / 100) * volume * 0.8;

          opportunities.push({
            pool1: pool1.poolAddress,
            pool2: pool2.poolAddress,
            tokenPair: `${pool1.token0}/${pool1.token1}`,
            priceDiscrepancy,
            potentialProfit,
            volume,
          });
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.potentialProfit - a.potentialProfit);
}

export function analyzeLiquidityDepth(pool: HyperionPool): LiquidityAnalysis {
  const reserve0Value = Number(pool.reserve0);
  const reserve1Value = Number(pool.reserve1);

  const depth = (reserve0Value + reserve1Value) / 2;

  const totalReserve = reserve0Value + reserve1Value;
  const concentration = totalReserve > 0
    ? Math.abs(reserve0Value - reserve1Value) / totalReserve
    : 0;

  const volumeToTvlRatio = pool.tvl > 0 ? pool.volume24h / pool.tvl : 0;
  const stability = Math.max(0, 100 - volumeToTvlRatio * 50);

  let riskScore = 0;
  if (pool.tvl < 100000) riskScore += 30;
  if (concentration > 0.7) riskScore += 25;
  if (volumeToTvlRatio > 3) riskScore += 20;
  if (pool.apr > 200) riskScore += 15;
  if (Math.abs(pool.priceChange24h || 0) > 15) riskScore += 10;

  return {
    depth,
    concentration,
    stability,
    riskScore: Math.min(riskScore, 100),
  };
}

export function calculateImpermanentLoss(
  priceRatio: number,
  initialPriceRatio: number
): number {
  if (initialPriceRatio === 0) return 0;

  const priceChange = priceRatio / initialPriceRatio;
  const impermanentLoss =
    (2 * Math.sqrt(priceChange)) / (1 + priceChange) - 1;

  return Math.abs(impermanentLoss) * 100;
}

export async function predictPriceMovement(
  historicalPrices: number[],
  volumes: number[]
): Promise<{
  predictedChange: number;
  confidence: number;
  timeframe: string;
}> {
  if (historicalPrices.length < 3) {
    return { predictedChange: 0, confidence: 0, timeframe: '24h' };
  }

  const recentPrices = historicalPrices.slice(-5);
  const priceChanges = recentPrices.slice(1).map((price, i) =>
    ((price - recentPrices[i]) / recentPrices[i]) * 100
  );

  const avgChange = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;

  const variance = priceChanges.reduce((sum, change) =>
    sum + Math.pow(change - avgChange, 2), 0
  ) / priceChanges.length;

  const volatility = Math.sqrt(variance);

  const recentVolumes = volumes.slice(-5);
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const volumeTrend = recentVolumes[recentVolumes.length - 1] / avgVolume;

  let predictedChange = avgChange;

  if (volumeTrend > 1.5) {
    predictedChange *= 1.3;
  } else if (volumeTrend < 0.7) {
    predictedChange *= 0.7;
  }

  const confidence = Math.max(0, Math.min(100, 100 - volatility * 10));

  return {
    predictedChange,
    confidence,
    timeframe: '24h',
  };
}

export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate = 0.02
): number {
  if (returns.length === 0) return 0;

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

  const variance = returns.reduce((sum, ret) =>
    sum + Math.pow(ret - avgReturn, 2), 0
  ) / returns.length;

  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  const excessReturn = avgReturn - riskFreeRate;
  return excessReturn / stdDev;
}

export function identifyMarketRegime(
  priceHistory: number[],
  volumeHistory: number[]
): 'ranging' | 'trending' | 'volatile' | 'stable' {
  if (priceHistory.length < 10 || volumeHistory.length < 10) {
    return 'stable';
  }

  const priceChanges = priceHistory.slice(1).map((price, i) =>
    ((price - priceHistory[i]) / priceHistory[i]) * 100
  );

  const avgChange = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;

  const variance = priceChanges.reduce((sum, change) =>
    sum + Math.pow(change - avgChange, 2), 0
  ) / priceChanges.length;

  const volatility = Math.sqrt(variance);

  const avgVolume = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
  const volumeVariance = volumeHistory.reduce((sum, vol) =>
    sum + Math.pow(vol - avgVolume, 2), 0
  ) / volumeHistory.length;

  const volumeStdDev = Math.sqrt(volumeVariance);

  if (volatility > 10) return 'volatile';

  if (Math.abs(avgChange) > 3 && volatility < 5) return 'trending';

  if (volatility < 2 && volumeStdDev / avgVolume < 0.5) return 'stable';

  return 'ranging';
}

export function calculateOptimalRebalanceTime(
  pool: HyperionPool,
  targetRatio: number
): number {
  const currentRatio = Number(pool.reserve1) / Number(pool.reserve0);
  const deviation = Math.abs(currentRatio - targetRatio) / targetRatio;

  if (deviation < 0.05) return 0;

  if (deviation < 0.1) return 24;

  if (deviation < 0.2) return 12;

  return 6;
}

export async function detectMarketManipulation(
  volumeHistory: number[],
  priceHistory: number[]
): Promise<{
  suspicious: boolean;
  indicators: string[];
  riskLevel: 'low' | 'medium' | 'high';
}> {
  const indicators: string[] = [];

  if (volumeHistory.length < 10 || priceHistory.length < 10) {
    return { suspicious: false, indicators: [], riskLevel: 'low' };
  }

  const avgVolume = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
  const recentVolume = volumeHistory[volumeHistory.length - 1];

  if (recentVolume > avgVolume * 10) {
    indicators.push('Abnormal volume spike detected');
  }

  const priceChanges = priceHistory.slice(1).map((price, i) =>
    ((price - priceHistory[i]) / priceHistory[i]) * 100
  );

  const recentChange = priceChanges[priceChanges.length - 1];
  const avgChange = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;

  if (Math.abs(recentChange) > Math.abs(avgChange) * 5) {
    indicators.push('Sudden price movement detected');
  }

  const consecutiveDirection = priceChanges.slice(-5).every(c => c > 0) ||
                                priceChanges.slice(-5).every(c => c < 0);

  if (consecutiveDirection) {
    indicators.push('Unidirectional price movement');
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  if (indicators.length >= 3) riskLevel = 'high';
  else if (indicators.length >= 2) riskLevel = 'medium';

  return {
    suspicious: indicators.length > 0,
    indicators,
    riskLevel,
  };
}
