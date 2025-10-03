#!/usr/bin/env tsx
/**
 * Discover All Hyperion Pools on Aptos Mainnet
 * Queries the blockchain to find all deployed pool_v3 resources
 */

import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import fs from 'fs';

const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));

// Real Hyperion CLMM module address discovered from blockchain
const HYPERION_MODULE = '0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c';

interface PoolInfo {
  address: string;
  token_a: string;
  token_b: string;
  fee_rate: string;
  tick_spacing: number;
  liquidity: string;
  sqrt_price: string;
  tick: number;
}

async function discoverAllPools(): Promise<PoolInfo[]> {
  console.log('🔍 Discovering all Hyperion CLMM pools on Aptos mainnet...\n');
  console.log(`Module: ${HYPERION_MODULE}\n`);

  const pools: PoolInfo[] = [];

  try {
    // Query for all resources of type LiquidityPoolV3
    // Note: This requires iterating through known pool addresses
    // In production, you'd query events or use an indexer

    const knownPools = [
      '0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8',
    ];

    for (const poolAddr of knownPools) {
      console.log(`Querying pool: ${poolAddr}`);

      const resources = await aptos.getAccountResources({ accountAddress: poolAddr });

      const poolResource = resources.find(r =>
        r.type === `${HYPERION_MODULE}::pool_v3::LiquidityPoolV3`
      );

      if (poolResource) {
        const data = poolResource.data as any;

        // Extract token addresses from fungible asset stores
        const tokenA = data.token_a_liquidity?.inner || 'unknown';
        const tokenB = data.token_b_liquidity?.inner || 'unknown';

        pools.push({
          address: poolAddr,
          token_a: tokenA,
          token_b: tokenB,
          fee_rate: data.fee_rate || '0',
          tick_spacing: data.tick_spacing || 0,
          liquidity: data.liquidity || '0',
          sqrt_price: data.sqrt_price || '0',
          tick: data.tick?.bits || 0,
        });

        console.log(`  ✓ Found pool: fee=${data.fee_rate}, liquidity=${data.liquidity}\n`);
      }
    }

    return pools;

  } catch (error) {
    console.error('Error discovering pools:', error);
    throw error;
  }
}

async function getTokenMetadata(storeAddress: string): Promise<{symbol: string, decimals: number} | null> {
  try {
    const resources = await aptos.getAccountResources({ accountAddress: storeAddress });

    const metadataResource = resources.find(r =>
      r.type === '0x1::fungible_asset::Metadata'
    );

    if (metadataResource) {
      const data = metadataResource.data as any;
      return {
        symbol: data.symbol || 'UNKNOWN',
        decimals: data.decimals || 8,
      };
    }
  } catch (error) {
    console.error(`Error fetching metadata for ${storeAddress}:`, error);
  }

  return null;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Hyperion Pool Discovery - Aptos Mainnet');
  console.log('═══════════════════════════════════════════════════════════\n');

  const pools = await discoverAllPools();

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Found ${pools.length} Pool(s)`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Enrich with token metadata
  for (const pool of pools) {
    console.log(`Pool: ${pool.address}`);
    console.log(`  Fee Rate: ${pool.fee_rate} (${parseInt(pool.fee_rate) / 10000}%)`);
    console.log(`  Tick Spacing: ${pool.tick_spacing}`);
    console.log(`  Liquidity: ${pool.liquidity}`);
    console.log(`  Current Tick: ${pool.tick}`);

    const tokenAMeta = await getTokenMetadata(pool.token_a);
    const tokenBMeta = await getTokenMetadata(pool.token_b);

    if (tokenAMeta && tokenBMeta) {
      console.log(`  Pair: ${tokenAMeta.symbol}/${tokenBMeta.symbol}`);
    }

    console.log('');
  }

  // Save to file for reference
  const output = {
    module_address: HYPERION_MODULE,
    pools: pools.map(p => ({
      pool_address: p.address,
      fee_rate: p.fee_rate,
      tick_spacing: p.tick_spacing,
    })),
  };

  fs.writeFileSync(
    'hyperion-pools-mainnet.json',
    JSON.stringify(output, null, 2)
  );

  console.log('💾 Pool data saved to hyperion-pools-mainnet.json\n');
}

main().catch(console.error);
