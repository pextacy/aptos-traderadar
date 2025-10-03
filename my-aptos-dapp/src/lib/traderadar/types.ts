// TradeRadar Type Definitions for Merkle Trade & Hyperion Integration

export interface MerklePair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  markPrice: string;
  indexPrice: string;
  volume24h: string;
  priceChange24h: string;
  fundingRate: string;
}

export interface MerklePosition {
  user: string;
  pair: string;
  size: string;
  collateral: string;
  entryPrice: string;
  liquidationPrice: string;
  unrealizedPnl: string;
  leverage: number;
  isLong: boolean;
}

export interface HyperionPool {
  poolAddress: string;
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  tvl: number;
  volume24h: number;
  apr: number;
  fee: number;
  priceChange24h?: number;
}

export interface TokenData {
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  tvl?: number;
  apr?: number;
  fundingRate?: number;
  source: 'merkle' | 'hyperion' | 'combined';
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface TradeParams {
  pair: string;
  size: number;
  collateral: number;
  isLong: boolean;
  slippage: number;
}

export interface MarketMetrics {
  totalTVL: number;
  total24hVolume: number;
  totalPositions: number;
  avgFundingRate: number;
}

export interface LiquidityAlert {
  poolAddress: string;
  symbol: string;
  type: 'high_apr' | 'low_liquidity' | 'volume_spike';
  message: string;
  timestamp: number;
  value: number;
}
