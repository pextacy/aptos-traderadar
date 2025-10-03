#!/usr/bin/env tsx
/**
 * Comprehensive Integration Test Script
 * Tests all backend-to-frontend connections
 */

import { getMerklePairs, getMerkleMarketData } from './src/lib/traderadar/merkleClient';
import { getAllHyperionPools } from './src/lib/traderadar/hyperionUtils';

console.log('🧪 Starting Comprehensive Integration Tests\n');
console.log('='.repeat(60));

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(test: string) {
  log(`✓ ${test}`, 'green');
}

function logError(test: string, error: any) {
  log(`✗ ${test}`, 'red');
  log(`  Error: ${error.message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message: string) {
  log(`ℹ ${message}`, 'cyan');
}

async function testDatabaseConnection() {
  log('\n📦 Testing Database Connection', 'blue');
  log('-'.repeat(60));

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL || DATABASE_URL === '') {
    logWarning('DATABASE_URL not configured in .env file');
    logInfo('To test database connections, set DATABASE_URL in .env');
    return false;
  }

  try {
    const { getPostgresClient } = await import('./src/lib/db');
    const sql = getPostgresClient();

    // Test basic connection
    const result = await sql('SELECT NOW() as current_time');
    logSuccess(`Database connection established`);
    logInfo(`  Current time: ${result[0].current_time}`);

    // Test trades table
    try {
      const tradesCount = await sql('SELECT COUNT(*) FROM trades');
      logSuccess(`Trades table accessible (${tradesCount[0].count} records)`);
    } catch (err: any) {
      logError('Trades table access', err);
    }

    // Test trader_stats table
    try {
      const statsCount = await sql('SELECT COUNT(*) FROM trader_stats');
      logSuccess(`Trader stats table accessible (${statsCount[0].count} records)`);
    } catch (err: any) {
      logError('Trader stats table access', err);
    }

    // Test messages table
    try {
      const messagesCount = await sql('SELECT COUNT(*) FROM messages');
      logSuccess(`Messages table accessible (${messagesCount[0].count} records)`);
    } catch (err: any) {
      logError('Messages table access', err);
    }

    // Test user_stats table
    try {
      const userStatsCount = await sql('SELECT COUNT(*) FROM user_stats');
      logSuccess(`User stats table accessible (${userStatsCount[0].count} records)`);
    } catch (err: any) {
      logError('User stats table access', err);
    }

    return true;
  } catch (error: any) {
    logError('Database connection', error);
    return false;
  }
}

async function testMerkleIntegration() {
  log('\n🔷 Testing Merkle Trade Integration', 'blue');
  log('-'.repeat(60));

  try {
    logInfo('Fetching Merkle pairs...');
    const pairs = await getMerklePairs();

    if (pairs.length === 0) {
      logWarning('No Merkle pairs returned (SDK may not be available)');
      logInfo('This is expected if @merkletrade/aptos-sdk is not installed');
    } else {
      logSuccess(`Fetched ${pairs.length} Merkle pairs`);
      logInfo(`  Sample pair: ${pairs[0].symbol}`);
    }

    // Test market data for a specific symbol
    if (pairs.length > 0) {
      const testSymbol = pairs[0].symbol;
      logInfo(`Testing market data for ${testSymbol}...`);
      const marketData = await getMerkleMarketData(testSymbol);

      if (marketData) {
        logSuccess(`Market data retrieved for ${testSymbol}`);
        logInfo(`  Mark Price: ${marketData.markPrice}`);
        logInfo(`  Volume 24h: ${marketData.volume24h}`);
      } else {
        logWarning(`No market data for ${testSymbol}`);
      }
    }

    return true;
  } catch (error: any) {
    logError('Merkle integration', error);
    return false;
  }
}

async function testHyperionIntegration() {
  log('\n🔶 Testing Hyperion CLMM Integration', 'blue');
  log('-'.repeat(60));

  try {
    logInfo('Fetching Hyperion pools...');
    const pools = await getAllHyperionPools();

    if (pools.length === 0) {
      logWarning('No Hyperion pools returned');
      logInfo('Check if pool addresses in hyperionUtils.ts are correct');
    } else {
      logSuccess(`Fetched ${pools.length} Hyperion pools`);

      pools.forEach((pool, idx) => {
        logInfo(`  Pool ${idx + 1}: ${pool.token0}/${pool.token1}`);
        logInfo(`    TVL: $${pool.tvl.toFixed(2)}`);
        logInfo(`    APR: ${pool.apr.toFixed(2)}%`);
        logInfo(`    Volume 24h: $${pool.volume24h.toFixed(2)}`);
      });
    }

    return true;
  } catch (error: any) {
    logError('Hyperion integration', error);
    return false;
  }
}

async function testServerActions() {
  log('\n⚡ Testing Server Actions', 'blue');
  log('-'.repeat(60));

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL || DATABASE_URL === '') {
    logWarning('Skipping server actions test (DATABASE_URL not configured)');
    return false;
  }

  try {
    // Dynamically import server actions
    const {
      getTradesOnServer,
      getTraderStatsOnServer,
      getMessagesOnServer,
      getUserStatsOnServer,
    } = await import('./src/app/actions');

    // Test getTrades
    try {
      logInfo('Testing getTradesOnServer...');
      const { trades, total } = await getTradesOnServer({
        page: 1,
        limit: 5,
        sortedBy: 'creation_timestamp',
        order: 'DESC',
      });
      logSuccess(`getTradesOnServer: ${trades.length} trades (total: ${total})`);
    } catch (err: any) {
      logError('getTradesOnServer', err);
    }

    // Test getTraderStats
    try {
      logInfo('Testing getTraderStatsOnServer...');
      const { traderStats, total } = await getTraderStatsOnServer({
        page: 1,
        limit: 5,
        sortedBy: 'points',
        order: 'DESC',
      });
      logSuccess(`getTraderStatsOnServer: ${traderStats.length} stats (total: ${total})`);
    } catch (err: any) {
      logError('getTraderStatsOnServer', err);
    }

    // Test getMessages
    try {
      logInfo('Testing getMessagesOnServer...');
      const { messages, total } = await getMessagesOnServer({
        page: 1,
        limit: 5,
        sortedBy: 'creation_timestamp',
        order: 'DESC',
      });
      logSuccess(`getMessagesOnServer: ${messages.length} messages (total: ${total})`);
    } catch (err: any) {
      logError('getMessagesOnServer', err);
    }

    // Test getUserStats
    try {
      logInfo('Testing getUserStatsOnServer...');
      const { userStats, total } = await getUserStatsOnServer({
        page: 1,
        limit: 5,
        sortedBy: 'total_points',
        order: 'DESC',
      });
      logSuccess(`getUserStatsOnServer: ${userStats.length} user stats (total: ${total})`);
    } catch (err: any) {
      logError('getUserStatsOnServer', err);
    }

    return true;
  } catch (error: any) {
    logError('Server actions', error);
    return false;
  }
}

async function runAllTests() {
  const startTime = Date.now();

  log('\n🚀 Running all integration tests...\n', 'cyan');

  const results = {
    database: await testDatabaseConnection(),
    merkle: await testMerkleIntegration(),
    hyperion: await testHyperionIntegration(),
    serverActions: await testServerActions(),
  };

  const duration = Date.now() - startTime;

  // Summary
  log('\n' + '='.repeat(60));
  log('\n📊 Test Summary', 'blue');
  log('-'.repeat(60));

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✓ PASS' : '✗ FAIL';
    const color = result ? 'green' : 'red';
    log(`${status}: ${test}`, color);
  });

  log('-'.repeat(60));
  log(`\nTotal: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  log(`Duration: ${duration}ms\n`, 'cyan');

  if (!results.database) {
    log('\n💡 Tip: Configure DATABASE_URL in .env to enable database tests', 'yellow');
  }

  if (!results.merkle) {
    log('💡 Note: Merkle integration may require the @merkletrade/aptos-sdk package', 'yellow');
  }

  log('\n' + '='.repeat(60) + '\n');

  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
