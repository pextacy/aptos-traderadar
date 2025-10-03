#!/usr/bin/env tsx
/**
 * Comprehensive Integration Test Suite
 * Runs ALL integration tests with REAL data - NO MOCKS
 */

import { runDatabaseTests } from './database.test';
import { runServerActionsTests } from './server-actions.test';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runAllIntegrationTests() {
  const startTime = Date.now();

  log('\n' + '='.repeat(70), 'magenta');
  log('🧪 COMPREHENSIVE INTEGRATION TEST SUITE', 'magenta');
  log('='.repeat(70), 'magenta');
  log('Testing ALL backend-frontend connections with REAL data', 'cyan');
  log('NO MOCKS - Only real database queries and API calls\n', 'yellow');

  // Pre-flight checks
  log('📋 Pre-flight Checks', 'blue');
  log('-'.repeat(70));

  const DATABASE_URL = process.env.DATABASE_URL;
  const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;

  if (!DATABASE_URL || DATABASE_URL === '') {
    log('❌ DATABASE_URL not configured in .env', 'red');
    log('   Please add your Neon Postgres connection string\n', 'yellow');
    process.exit(1);
  } else {
    log('✓ DATABASE_URL configured', 'green');
  }

  if (!MODULE_ADDRESS) {
    log('⚠ NEXT_PUBLIC_MODULE_ADDRESS not set (required for blockchain interactions)', 'yellow');
  } else {
    log(`✓ MODULE_ADDRESS set: ${MODULE_ADDRESS}`, 'green');
  }

  log('');

  // Run all test suites
  const results: Record<string, boolean> = {};

  try {
    // 1. Database Tests
    log('═'.repeat(70), 'cyan');
    log('TEST SUITE 1: DATABASE INTEGRATION', 'cyan');
    log('═'.repeat(70), 'cyan');
    results.database = await runDatabaseTests();
  } catch (error: any) {
    log(`❌ Database tests crashed: ${error.message}`, 'red');
    results.database = false;
  }

  try {
    // 2. Server Actions Tests
    log('\n═'.repeat(70), 'cyan');
    log('TEST SUITE 2: SERVER ACTIONS', 'cyan');
    log('═'.repeat(70), 'cyan');
    results.serverActions = await runServerActionsTests();
  } catch (error: any) {
    log(`❌ Server actions tests crashed: ${error.message}`, 'red');
    results.serverActions = false;
  }

  const duration = Date.now() - startTime;

  // Final Summary
  log('\n' + '='.repeat(70), 'magenta');
  log('📊 FINAL TEST SUMMARY', 'magenta');
  log('='.repeat(70), 'magenta');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  log('\nTest Suites:', 'cyan');
  Object.entries(results).forEach(([suite, result]) => {
    const status = result ? '✓ PASS' : '✗ FAIL';
    const color = result ? 'green' : 'red';
    log(`  ${status}: ${suite}`, color);
  });

  log('\n' + '-'.repeat(70));

  if (passed === total) {
    log(`🎉 SUCCESS! All ${total} test suites passed`, 'green');
  } else {
    log(`⚠ ${passed}/${total} test suites passed`, 'yellow');
  }

  log(`⏱ Duration: ${(duration / 1000).toFixed(2)}s`, 'cyan');
  log('='.repeat(70) + '\n', 'magenta');

  // Exit with appropriate code
  return passed === total;
}

// Run all tests
runAllIntegrationTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
