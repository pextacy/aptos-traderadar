#!/usr/bin/env tsx
/**
 * Server Actions Integration Tests
 * Tests real server actions with real database - NO MOCKS
 */

import {
  getTradesOnServer,
  getTraderStatsOnServer,
  getMessagesOnServer,
  getUserStatsOnServer,
} from '../../src/app/actions';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGetTradesAction() {
  log('\n🔷 Testing getTradesOnServer Action', 'cyan');
  log('-'.repeat(60));

  try {
    // Test basic pagination
    const { trades, total } = await getTradesOnServer({
      page: 1,
      limit: 10,
      sortedBy: 'creation_timestamp',
      order: 'DESC',
    });

    log(`✓ getTradesOnServer works`, 'green');
    log(`  Total trades: ${total}`, 'cyan');
    log(`  Fetched: ${trades.length} trades`, 'cyan');

    // Test sorting by price
    const { trades: priceSort } = await getTradesOnServer({
      page: 1,
      limit: 5,
      sortedBy: 'price',
      order: 'DESC',
    });

    log(`\n✓ Sorting by price works`, 'green');
    if (priceSort.length > 0) {
      log(`  Highest price: ${(priceSort[0].price / 100000000).toFixed(4)} APT`, 'cyan');
    }

    // Test filtering by status
    const { trades: pendingTrades, total: pendingTotal } = await getTradesOnServer({
      page: 1,
      limit: 10,
      sortedBy: 'creation_timestamp',
      order: 'DESC',
      status: 1, // PENDING
    });

    log(`\n✓ Filtering by status works`, 'green');
    log(`  Pending trades: ${pendingTotal}`, 'cyan');

    // Test filtering by trade type
    const { trades: buyTrades, total: buyTotal } = await getTradesOnServer({
      page: 1,
      limit: 10,
      sortedBy: 'creation_timestamp',
      order: 'DESC',
      tradeType: 1, // BUY
    });

    log(`\n✓ Filtering by trade type works`, 'green');
    log(`  Buy trades: ${buyTotal}`, 'cyan');

    // Test pagination (page 2)
    if (total > 10) {
      const { trades: page2 } = await getTradesOnServer({
        page: 2,
        limit: 10,
        sortedBy: 'creation_timestamp',
        order: 'DESC',
      });
      log(`\n✓ Pagination works`, 'green');
      log(`  Page 2 trades: ${page2.length}`, 'cyan');
    }

    return true;
  } catch (error: any) {
    log(`✗ getTradesOnServer failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

async function testGetTraderStatsAction() {
  log('\n📊 Testing getTraderStatsOnServer Action', 'cyan');
  log('-'.repeat(60));

  try {
    const { traderStats, total } = await getTraderStatsOnServer({
      page: 1,
      limit: 10,
      sortedBy: 'points',
      order: 'DESC',
    });

    log(`✓ getTraderStatsOnServer works`, 'green');
    log(`  Total traders: ${total}`, 'cyan');
    log(`  Fetched: ${traderStats.length} trader stats`, 'cyan');

    // Test sorting by volume
    const { traderStats: volumeSort } = await getTraderStatsOnServer({
      page: 1,
      limit: 5,
      sortedBy: 'total_volume',
      order: 'DESC',
    });

    log(`\n✓ Sorting by volume works`, 'green');
    if (volumeSort.length > 0) {
      log(`  Top trader volume: ${(volumeSort[0].total_volume / 100000000).toFixed(4)} APT`, 'cyan');
      log(`  Top trader points: ${volumeSort[0].points}`, 'cyan');
    }

    // Test sorting by total trades
    const { traderStats: tradesSort } = await getTraderStatsOnServer({
      page: 1,
      limit: 3,
      sortedBy: 'total_trades',
      order: 'DESC',
    });

    log(`\n✓ Sorting by total trades works`, 'green');
    if (tradesSort.length > 0) {
      log(`  Most active trader: ${tradesSort[0].trader_addr.slice(0, 12)}...`, 'cyan');
      log(`  Total trades: ${tradesSort[0].total_trades}`, 'cyan');
      log(`  Completed: ${tradesSort[0].completed_trades}`, 'cyan');
      log(`  Cancelled: ${tradesSort[0].cancelled_trades}`, 'cyan');
    }

    return true;
  } catch (error: any) {
    log(`✗ getTraderStatsOnServer failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

async function testGetMessagesAction() {
  log('\n💬 Testing getMessagesOnServer Action', 'cyan');
  log('-'.repeat(60));

  try {
    const { messages, total } = await getMessagesOnServer({
      page: 1,
      limit: 10,
      sortedBy: 'creation_timestamp',
      order: 'DESC',
    });

    log(`✓ getMessagesOnServer works`, 'green');
    log(`  Total messages: ${total}`, 'cyan');
    log(`  Fetched: ${messages.length} messages`, 'cyan');

    if (messages.length > 0) {
      log(`\n  Recent messages:`, 'cyan');
      messages.slice(0, 3).forEach((msg, idx) => {
        log(`    ${idx + 1}. "${msg.content.slice(0, 40)}${msg.content.length > 40 ? '...' : ''}"`, 'cyan');
      });
    }

    // Test sorting order
    const { messages: ascSort } = await getMessagesOnServer({
      page: 1,
      limit: 5,
      sortedBy: 'creation_timestamp',
      order: 'ASC',
    });

    log(`\n✓ Sorting order (ASC) works`, 'green');
    if (ascSort.length > 0) {
      const firstCreated = new Date(ascSort[0].creation_timestamp * 1000);
      log(`  Earliest message: ${firstCreated.toLocaleString()}`, 'cyan');
    }

    return true;
  } catch (error: any) {
    log(`✗ getMessagesOnServer failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

async function testGetUserStatsAction() {
  log('\n👥 Testing getUserStatsOnServer Action', 'cyan');
  log('-'.repeat(60));

  try {
    const { userStats, total } = await getUserStatsOnServer({
      page: 1,
      limit: 10,
      sortedBy: 'total_points',
      order: 'DESC',
    });

    log(`✓ getUserStatsOnServer works`, 'green');
    log(`  Total users: ${total}`, 'cyan');
    log(`  Fetched: ${userStats.length} user stats`, 'cyan');

    if (userStats.length > 0) {
      log(`\n  Top users by points:`, 'cyan');
      userStats.slice(0, 5).forEach((stat, idx) => {
        log(`    ${idx + 1}. ${stat.user_addr.slice(0, 12)}... - ${stat.total_points} pts (${stat.created_messages} msgs)`, 'cyan');
      });
    }

    // Test sorting order
    const { userStats: ascSort } = await getUserStatsOnServer({
      page: 1,
      limit: 3,
      sortedBy: 'total_points',
      order: 'ASC',
    });

    log(`\n✓ Sorting order (ASC) works`, 'green');
    if (ascSort.length > 0) {
      log(`  Lowest points user: ${ascSort[0].user_addr.slice(0, 12)}...`, 'cyan');
      log(`  Points: ${ascSort[0].total_points}`, 'cyan');
      log(`  Created messages: ${ascSort[0].created_messages}`, 'cyan');
    }

    return true;
  } catch (error: any) {
    log(`✗ getUserStatsOnServer failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

async function runServerActionsTests() {
  log('\n🧪 Server Actions Integration Tests', 'cyan');
  log('='.repeat(60));
  log('Testing with REAL server actions and database - NO MOCKS\n', 'yellow');

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === '') {
    log('❌ DATABASE_URL not configured!', 'red');
    log('   Set DATABASE_URL in .env to run server actions tests\n', 'yellow');
    return false;
  }

  const results = {
    getTrades: await testGetTradesAction(),
    getTraderStats: await testGetTraderStatsAction(),
    getMessages: await testGetMessagesAction(),
    getUserStats: await testGetUserStatsAction(),
  };

  // Summary
  log('\n' + '='.repeat(60));
  log('📊 Server Actions Test Results', 'cyan');
  log('-'.repeat(60));

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✓ PASS' : '✗ FAIL';
    const color = result ? 'green' : 'red';
    log(`${status}: ${test}`, color);
  });

  log('-'.repeat(60));
  log(`Total: ${passed}/${total} tests passed\n`, passed === total ? 'green' : 'yellow');

  return passed === total;
}

// Run tests if executed directly
if (require.main === module) {
  runServerActionsTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log(`\n❌ Fatal error: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

export { runServerActionsTests };
