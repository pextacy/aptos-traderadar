#!/usr/bin/env tsx

import { getPostgresClient, queryHyperionPools, queryHyperionSwaps } from '../src/lib/db';
import { getAllHyperionPools, getAptosClient } from '../src/lib/traderadar/hyperionUtils';
import { fetchTokenPrice } from '../src/lib/traderadar/priceOracle';
import { getDashboardStatsOnServer, getHyperionPoolsOnServer } from '../src/app/actions';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<void>,
  skipIfNoDb = false
): Promise<void> {
  const start = Date.now();
  console.log(`\n🧪 Testing: ${name}`);

  try {
    await testFn();
    const duration = Date.now() - start;
    results.push({ name, status: 'PASS', message: 'Success', duration });
    console.log(`✅ PASS (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);

    if (skipIfNoDb && message.includes('DATABASE_URL')) {
      results.push({ name, status: 'SKIP', message: 'Database not configured', duration });
      console.log(`⏭️  SKIP - Database not configured`);
    } else {
      results.push({ name, status: 'FAIL', message, duration });
      console.log(`❌ FAIL - ${message} (${duration}ms)`);
    }
  }
}

async function main() {
  console.log('🚀 Starting End-to-End Connectivity Tests\n');
  console.log('='.repeat(60));

  await runTest(
    'Database Connection',
    async () => {
      const sql = getPostgresClient();
      const result = await sql`SELECT 1 as test`;
      if (!result || result.length === 0) {
        throw new Error('Database query returned no results');
      }
      console.log('   Database connection successful');
    },
    true
  );

  await runTest(
    'Query Hyperion Pools from Database',
    async () => {
      const pools = await queryHyperionPools();
      console.log(`   Found ${pools.length} pools in database`);
      if (pools.length > 0) {
        console.log(`   Sample pool: ${pools[0].token0_symbol}/${pools[0].token1_symbol}`);
      }
    },
    true
  );

  await runTest(
    'Query Hyperion Swaps from Database',
    async () => {
      const swaps = await queryHyperionSwaps(undefined, 10);
      console.log(`   Found ${swaps.length} recent swaps in database`);
      if (swaps.length > 0) {
        console.log(`   Latest swap: ${swaps[0].transaction_hash?.substring(0, 10)}...`);
      }
    },
    true
  );

  await runTest(
    'Aptos Client Initialization',
    async () => {
      const aptos = getAptosClient();
      const ledgerInfo = await aptos.getLedgerInfo();
      console.log(`   Connected to Aptos network`);
      console.log(`   Chain ID: ${ledgerInfo.chain_id}`);
      console.log(`   Ledger version: ${ledgerInfo.ledger_version}`);
    }
  );

  await runTest(
    'Fetch Pool Data via Utility Function',
    async () => {
      const pools = await getAllHyperionPools();
      console.log(`   Retrieved ${pools.length} pools via utility`);
      if (pools.length > 0) {
        const pool = pools[0];
        console.log(`   Sample: ${pool.token0}/${pool.token1}`);
        console.log(`   TVL: $${pool.tvl.toFixed(2)}`);
        console.log(`   24h Volume: $${pool.volume24h.toFixed(2)}`);
      }
    },
    true
  );

  await runTest(
    'CoinGecko Price Oracle',
    async () => {
      const aptPrice = await fetchTokenPrice('APT');
      console.log(`   APT Price: $${aptPrice.toFixed(2)}`);
      if (aptPrice === 0) {
        throw new Error('Price oracle returned 0 - API may be rate limited');
      }
    }
  );

  await runTest(
    'Server Action: Dashboard Stats',
    async () => {
      const stats = await getDashboardStatsOnServer();
      console.log(`   Total Trades: ${stats.totalTrades}`);
      console.log(`   Active Trades: ${stats.activeTrades}`);
      console.log(`   Total Volume: $${stats.totalVolume.toFixed(2)}`);
      console.log(`   Total Traders: ${stats.totalTraders}`);
    },
    true
  );

  await runTest(
    'Server Action: Hyperion Pools',
    async () => {
      const { pools, total } = await getHyperionPoolsOnServer();
      console.log(`   Retrieved ${total} pools via server action`);
      if (pools.length > 0) {
        console.log(`   First pool: ${pools[0].token0Symbol}/${pools[0].token1Symbol}`);
      }
    },
    true
  );

  await runTest(
    'API Route Simulation: /api/hyperion/pools',
    async () => {
      const poolsData = await queryHyperionPools();
      if (!Array.isArray(poolsData)) {
        throw new Error('Expected array of pools');
      }
      console.log(`   API would return ${poolsData.length} pools`);
    },
    true
  );

  await runTest(
    'API Route Simulation: /api/hyperion/swaps',
    async () => {
      const swapsData = await queryHyperionSwaps(undefined, 20);
      if (!Array.isArray(swapsData)) {
        throw new Error('Expected array of swaps');
      }
      console.log(`   API would return ${swapsData.length} swaps`);
    },
    true
  );

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  console.log(`✅ Passed:  ${passed}/${results.length}`);
  console.log(`❌ Failed:  ${failed}/${results.length}`);
  console.log(`⏭️  Skipped: ${skipped}/${results.length}`);

  console.log('\nDetailed Results:');
  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`  ${icon} ${result.name} (${result.duration}ms)`);
    if (result.status === 'FAIL') {
      console.log(`     Error: ${result.message}`);
    }
  });

  console.log('\n' + '='.repeat(60));

  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please check the errors above.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed successfully!\n');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('\n💥 Fatal error running tests:', error);
  process.exit(1);
});
