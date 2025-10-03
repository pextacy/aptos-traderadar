#!/usr/bin/env tsx
/**
 * Hyperion Pool Discovery Script
 * Queries Aptos blockchain to discover Hyperion CLMM pools and contract addresses
 */

import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));

// Known Hyperion pool address from GeckoTerminal
const KNOWN_POOL = '0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8';

async function discoverHyperionModules() {
  console.log('🔍 Discovering Hyperion CLMM contract addresses...\n');

  try {
    // Get account resources for the known pool
    console.log(`Querying pool: ${KNOWN_POOL}`);
    const resources = await aptos.getAccountResources({ accountAddress: KNOWN_POOL });

    console.log(`\n📦 Found ${resources.length} resources:\n`);

    for (const resource of resources) {
      console.log(`Type: ${resource.type}`);

      // Extract module address from resource type
      // Format: 0xADDRESS::module_name::Resource
      const match = resource.type.match(/^(0x[a-fA-F0-9]+)::/);
      if (match) {
        const moduleAddress = match[1];
        console.log(`  → Module Address: ${moduleAddress}`);
      }

      // Log resource data structure
      console.log(`  Data keys: ${Object.keys(resource.data).join(', ')}`);
      console.log('');
    }

    // Get account modules
    console.log('\n📜 Checking for deployed modules...');
    try {
      const modules = await aptos.getAccountModules({ accountAddress: KNOWN_POOL });
      console.log(`Found ${modules.length} modules:\n`);

      for (const module of modules) {
        console.log(`Module: ${module.abi?.name || 'unnamed'}`);
        console.log(`  Address: ${module.abi?.address}`);
        if (module.abi?.exposed_functions) {
          console.log(`  Functions: ${module.abi.exposed_functions.length}`);
          module.abi.exposed_functions.slice(0, 5).forEach(fn => {
            console.log(`    - ${fn.name}`);
          });
        }
        console.log('');
      }
    } catch (e: any) {
      console.log('No modules deployed at this address (this might be a resource account)');
    }

    // Try to identify Hyperion factory/router by checking related modules
    console.log('\n🏭 Identifying Hyperion factory/router addresses...');

    const uniqueModules = new Set<string>();
    for (const resource of resources) {
      const match = resource.type.match(/^(0x[a-fA-F0-9]+)::/);
      if (match && match[1] !== '0x1') { // Exclude framework modules
        uniqueModules.add(match[1]);
      }
    }

    console.log('\nUnique module addresses (potential Hyperion contracts):');
    uniqueModules.forEach(addr => console.log(`  ${addr}`));

    return Array.from(uniqueModules);

  } catch (error) {
    console.error('Error discovering Hyperion modules:', error);
    throw error;
  }
}

async function queryPoolInfo(poolAddress: string) {
  console.log(`\n\n📊 Querying pool information for ${poolAddress}...\n`);

  try {
    const resources = await aptos.getAccountResources({ accountAddress: poolAddress });

    // Look for pool-related resources
    const poolResources = resources.filter(r =>
      r.type.toLowerCase().includes('pool') ||
      r.type.toLowerCase().includes('liquidity') ||
      r.type.toLowerCase().includes('clmm')
    );

    console.log(`Found ${poolResources.length} pool-related resources:\n`);

    for (const resource of poolResources) {
      console.log(`Resource: ${resource.type}`);
      console.log('Data:', JSON.stringify(resource.data, null, 2));
      console.log('');
    }

  } catch (error) {
    console.error('Error querying pool info:', error);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Hyperion CLMM Pool Discovery Tool');
  console.log('   Aptos Mainnet');
  console.log('═══════════════════════════════════════════════════════════\n');

  const moduleAddresses = await discoverHyperionModules();
  await queryPoolInfo(KNOWN_POOL);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\nKnown pool: ${KNOWN_POOL}`);
  console.log(`Discovered ${moduleAddresses.length} potential Hyperion module address(es):`);
  moduleAddresses.forEach((addr, i) => {
    console.log(`  ${i + 1}. ${addr}`);
  });

  console.log('\n💡 Next steps:');
  console.log('   1. Update indexer config.yaml with discovered module address');
  console.log('   2. Verify module emits Swap/PoolCreated events');
  console.log('   3. Run indexer to track real Hyperion data');
  console.log('\n');
}

main().catch(console.error);
