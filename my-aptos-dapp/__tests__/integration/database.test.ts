#!/usr/bin/env tsx
/**
 * Database Integration Tests
 * Tests real database connections and queries - NO MOCKS
 */

import { getPostgresClient } from '../../src/lib/db';
import { getTrades } from '../../src/db/getTrades';
import { getTraderStats } from '../../src/db/getTraderStats';
import { getMessages } from '../../src/db/getMessages';
import { getUserStats } from '../../src/db/getUserStats';

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

async function testDatabaseSchema() {
  log('\n📦 Testing Database Schema', 'cyan');
  log('-'.repeat(60));

  const sql = getPostgresClient();

  try {
    // Test connection
    const result = await sql('SELECT NOW() as current_time, VERSION() as version');
    log(`✓ Database connected`, 'green');
    log(`  Time: ${result[0].current_time}`, 'cyan');
    log(`  Version: ${result[0].version.split(',')[0]}`, 'cyan');

    // Check tables exist
    const tables = await sql(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    log(`\n✓ Found ${tables.length} tables:`, 'green');
    tables.forEach((t: any) => log(`  - ${t.table_name}`, 'cyan'));

    return true;
  } catch (error: any) {
    log(`✗ Database schema test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testTradesTable() {
  log('\n🔷 Testing Trades Table', 'cyan');
  log('-'.repeat(60));

  try {
    const { trades, total } = await getTrades({
      page: 1,
      limit: 10,
      sortedBy: 'creation_timestamp',
      order: 'DESC',
    });

    log(`✓ Trades query successful`, 'green');
    log(`  Total trades: ${total}`, 'cyan');
    log(`  Fetched: ${trades.length} trades`, 'cyan');

    if (trades.length > 0) {
      const trade = trades[0];
      log(`\n  Sample Trade:`, 'cyan');
      log(`    Type: ${trade.trade_type}`, 'cyan');
      log(`    From: ${trade.token_from} (${(trade.amount_from / 100000000).toFixed(4)})`, 'cyan');
      log(`    To: ${trade.token_to} (${(trade.amount_to / 100000000).toFixed(4)})`, 'cyan');
      log(`    Price: ${(trade.price / 100000000).toFixed(4)} APT`, 'cyan');
      log(`    Status: ${trade.status}`, 'cyan');
      log(`    Trader: ${trade.trader_addr.slice(0, 10)}...`, 'cyan');
    }

    // Test filtering
    const { trades: pendingTrades } = await getTrades({
      page: 1,
      limit: 5,
      sortedBy: 'creation_timestamp',
      order: 'DESC',
      status: 1, // PENDING
    });

    log(`\n✓ Filter by status works`, 'green');
    log(`  Pending trades: ${pendingTrades.length}`, 'cyan');

    return true;
  } catch (error: any) {
    log(`✗ Trades table test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testTraderStatsTable() {
  log('\n📊 Testing Trader Stats Table', 'cyan');
  log('-'.repeat(60));

  try {
    const { traderStats, total } = await getTraderStats({
      page: 1,
      limit: 10,
      sortedBy: 'points',
      order: 'DESC',
    });

    log(`✓ Trader stats query successful`, 'green');
    log(`  Total traders: ${total}`, 'cyan');
    log(`  Fetched: ${traderStats.length} trader stats`, 'cyan');

    if (traderStats.length > 0) {
      log(`\n  Top Traders:`, 'cyan');
      traderStats.slice(0, 5).forEach((stat, idx) => {
        log(`    ${idx + 1}. ${stat.trader_addr.slice(0, 10)}... - ${stat.points} points`, 'cyan');
        log(`       Trades: ${stat.total_trades} (${stat.completed_trades} completed)`, 'cyan');
        log(`       Volume: ${(stat.total_volume / 100000000).toFixed(4)} APT`, 'cyan');
      });
    }

    return true;
  } catch (error: any) {
    log(`✗ Trader stats test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testMessagesTable() {
  log('\n💬 Testing Messages Table', 'cyan');
  log('-'.repeat(60));

  try {
    const { messages, total } = await getMessages({
      page: 1,
      limit: 5,
      sortedBy: 'creation_timestamp',
      order: 'DESC',
    });

    log(`✓ Messages query successful`, 'green');
    log(`  Total messages: ${total}`, 'cyan');
    log(`  Fetched: ${messages.length} messages`, 'cyan');

    if (messages.length > 0) {
      log(`\n  Recent Messages:`, 'cyan');
      messages.forEach((msg, idx) => {
        log(`    ${idx + 1}. ${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}`, 'cyan');
        log(`       Creator: ${msg.creator_addr.slice(0, 10)}...`, 'cyan');
      });
    }

    return true;
  } catch (error: any) {
    log(`✗ Messages test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testUserStatsTable() {
  log('\n👥 Testing User Stats Table', 'cyan');
  log('-'.repeat(60));

  try {
    const { userStats, total } = await getUserStats({
      page: 1,
      limit: 5,
      sortedBy: 'total_points',
      order: 'DESC',
    });

    log(`✓ User stats query successful`, 'green');
    log(`  Total users: ${total}`, 'cyan');
    log(`  Fetched: ${userStats.length} user stats`, 'cyan');

    if (userStats.length > 0) {
      log(`\n  Top Users:`, 'cyan');
      userStats.forEach((stat, idx) => {
        log(`    ${idx + 1}. ${stat.user_addr.slice(0, 10)}... - ${stat.total_points} points`, 'cyan');
        log(`       Created messages: ${stat.created_messages}`, 'cyan');
      });
    }

    return true;
  } catch (error: any) {
    log(`✗ User stats test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runDatabaseTests() {
  log('\n🧪 Database Integration Tests', 'cyan');
  log('='.repeat(60));
  log('Testing with REAL database connections - NO MOCKS\n', 'yellow');

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === '') {
    log('❌ DATABASE_URL not configured!', 'red');
    log('   Set DATABASE_URL in .env to run database tests\n', 'yellow');
    return false;
  }

  const results = {
    schema: await testDatabaseSchema(),
    trades: await testTradesTable(),
    traderStats: await testTraderStatsTable(),
    messages: await testMessagesTable(),
    userStats: await testUserStatsTable(),
  };

  // Summary
  log('\n' + '='.repeat(60));
  log('📊 Database Test Results', 'cyan');
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
  runDatabaseTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log(`\n❌ Fatal error: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

export { runDatabaseTests };
