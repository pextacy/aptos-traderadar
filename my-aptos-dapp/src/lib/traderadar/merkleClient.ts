// Merkle Trade Client Setup for Aptos TradeRadar

import { MerkleClient, MerkleClientConfig } from '@merkletrade/aptos-sdk';

let merkleClient: MerkleClient | null = null;

export async function getMerkleClient(): Promise<MerkleClient> {
  if (merkleClient) {
    return merkleClient;
  }

  // Initialize Merkle client with testnet config
  const config = await MerkleClientConfig.testnet();
  merkleClient = new MerkleClient(config);

  return merkleClient;
}

export async function getMerklePairs() {
  const client = await getMerkleClient();
  try {
    const pairs = await client.apis.getPairs();
    return pairs;
  } catch (error) {
    console.error('Error fetching Merkle pairs:', error);
    return [];
  }
}

export async function getMerkleMarketData(symbol: string) {
  const client = await getMerkleClient();
  try {
    const market = await client.apis.getMarket(symbol);
    return market;
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error);
    return null;
  }
}

export async function getUserPositions(userAddress: string) {
  const client = await getMerkleClient();
  try {
    const positions = await client.apis.getPositions(userAddress);
    return positions;
  } catch (error) {
    console.error(`Error fetching positions for ${userAddress}:`, error);
    return [];
  }
}

export async function getOrderbook(symbol: string) {
  const client = await getMerkleClient();
  try {
    const orderbook = await client.apis.getOrderbook(symbol);
    return orderbook;
  } catch (error) {
    console.error(`Error fetching orderbook for ${symbol}:`, error);
    return null;
  }
}

// Build trade transaction payload
export async function buildTradePayload(
  userAddress: string,
  pair: string,
  size: number,
  isLong: boolean,
  leverage: number
) {
  const client = await getMerkleClient();

  try {
    const payload = await client.payloads.placeMarketOrder({
      user: userAddress,
      pair,
      size: size.toString(),
      isLong,
      leverage,
    });

    return payload;
  } catch (error) {
    console.error('Error building trade payload:', error);
    throw error;
  }
}

export { merkleClient };
