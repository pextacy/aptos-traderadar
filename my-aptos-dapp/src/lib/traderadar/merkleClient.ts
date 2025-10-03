// Merkle Trade Client Setup for Aptos TradeRadar
// Note: Merkle SDK integration is currently disabled as the package is not available
// This is a placeholder implementation that returns mock data

/* eslint-disable @typescript-eslint/no-unused-vars */

import { MerklePair } from './types';

export async function getMerklePairs(): Promise<MerklePair[]> {
  // Return empty array - Merkle integration disabled
  console.warn('Merkle Trade SDK not available - returning empty pairs');
  return [];
}

export async function getMerkleMarketData(_symbol: string): Promise<MerklePair | null> {
  // Return null - Merkle integration disabled
  console.warn('Merkle Trade SDK not available - no market data available');
  return null;
}

export async function getUserPositions(_userAddress: string) {
  console.warn('Merkle Trade SDK not available - no positions available');
  return [];
}

export async function getOrderbook(_symbol: string) {
  console.warn('Merkle Trade SDK not available - no orderbook available');
  return null;
}

// Build trade transaction payload
export async function buildTradePayload(
  _userAddress: string,
  _pair: string,
  _size: number,
  _isLong: boolean,
  _leverage: number
) {
  console.warn('Merkle Trade SDK not available - cannot build trade payload');
  throw new Error('Merkle Trade SDK not available');
}
