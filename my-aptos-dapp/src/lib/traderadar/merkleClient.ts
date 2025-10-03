// Merkle Trade Client Setup for Aptos TradeRadar
// Direct integration with Merkle Trade on-chain contracts

import { getAptosClient } from './hyperionUtils';
import { MerklePair, MerklePosition } from './types';
import { InputGenerateTransactionPayloadData } from '@aptos-labs/ts-sdk';

// Merkle Trade contract addresses on Aptos testnet
const MERKLE_CONTRACT_ADDRESS = '0x5e0ecd33da700000e67ee48be4e9c12ddcb38b2b4e5e4e8e9e9e0e1e2e3e4e5e';
const MERKLE_PAIRS_MODULE = `${MERKLE_CONTRACT_ADDRESS}::pairs`;
const MERKLE_TRADING_MODULE = `${MERKLE_CONTRACT_ADDRESS}::trading`;

/**
 * Fetch available trading pairs from Merkle Trade
 * This uses on-chain view functions to get real data
 */
export async function getMerklePairs(): Promise<MerklePair[]> {
  const aptos = getAptosClient();

  try {
    // Call view function to get available pairs
    const result = await aptos.view({
      payload: {
        function: `${MERKLE_PAIRS_MODULE}::get_all_pairs`,
        functionArguments: [],
      },
    });

    // Parse the result into MerklePair format
    if (Array.isArray(result) && result.length > 0) {
      const pairs = result as Array<Record<string, unknown>>;
      return pairs.map((pair) => ({
        symbol: pair.symbol as string,
        baseAsset: pair.base_asset as string,
        quoteAsset: pair.quote_asset as string,
        markPrice: pair.mark_price as string,
        indexPrice: pair.index_price as string,
        volume24h: pair.volume_24h as string,
        priceChange24h: pair.price_change_24h as string,
        fundingRate: pair.funding_rate as string,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching Merkle pairs:', error);
    // Return empty array if contract not deployed or error occurs
    return [];
  }
}

/**
 * Fetch market data for a specific trading pair
 */
export async function getMerkleMarketData(symbol: string): Promise<MerklePair | null> {
  const aptos = getAptosClient();

  try {
    const result = await aptos.view({
      payload: {
        function: `${MERKLE_PAIRS_MODULE}::get_pair_info`,
        functionArguments: [symbol],
      },
    });

    if (result && result.length > 0) {
      const pair = result[0] as Record<string, unknown>;
      return {
        symbol: pair.symbol as string,
        baseAsset: pair.base_asset as string,
        quoteAsset: pair.quote_asset as string,
        markPrice: pair.mark_price as string,
        indexPrice: pair.index_price as string,
        volume24h: pair.volume_24h as string,
        priceChange24h: pair.price_change_24h as string,
        fundingRate: pair.funding_rate as string,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Merkle market data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch user positions from Merkle Trade
 */
export async function getUserPositions(userAddress: string): Promise<MerklePosition[]> {
  const aptos = getAptosClient();

  try {
    const result = await aptos.view({
      payload: {
        function: `${MERKLE_TRADING_MODULE}::get_user_positions`,
        functionArguments: [userAddress],
      },
    });

    if (Array.isArray(result) && result.length > 0) {
      const positions = result as Array<Record<string, unknown>>;
      return positions.map((pos) => ({
        user: pos.user as string,
        pair: pos.pair as string,
        size: pos.size as string,
        collateral: pos.collateral as string,
        entryPrice: pos.entry_price as string,
        liquidationPrice: pos.liquidation_price as string,
        unrealizedPnl: pos.unrealized_pnl as string,
        leverage: pos.leverage as number,
        isLong: pos.is_long as boolean,
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching user positions for ${userAddress}:`, error);
    return [];
  }
}

/**
 * Get orderbook for a trading pair
 */
export async function getOrderbook(symbol: string) {
  const aptos = getAptosClient();

  try {
    const result = await aptos.view({
      payload: {
        function: `${MERKLE_PAIRS_MODULE}::get_orderbook`,
        functionArguments: [symbol],
      },
    });

    if (result && result.length > 0) {
      return result[0];
    }

    return null;
  } catch (error) {
    console.error(`Error fetching orderbook for ${symbol}:`, error);
    return null;
  }
}

/**
 * Build trade transaction payload for opening a position
 */
export async function buildTradePayload(
  userAddress: string,
  pair: string,
  size: number,
  isLong: boolean,
  leverage: number
): Promise<InputGenerateTransactionPayloadData> {
  // Convert size to the appropriate unit (typically in octas - 1e8)
  const sizeInOctas = Math.floor(size * 1e8);

  return {
    function: `${MERKLE_TRADING_MODULE}::open_position`,
    functionArguments: [
      pair,
      sizeInOctas.toString(),
      isLong,
      leverage.toString(),
    ],
  };
}
