# Integration Tests - Real Data Only

This directory contains comprehensive integration tests that use **REAL data** - no mocks, no placeholders, only actual database queries and API calls.

## 🧪 Test Suites

### 1. Database Integration Tests (`integration/database.test.ts`)
Tests all database queries with real data from your Neon Postgres database:
- Schema validation
- Trades table queries (pagination, sorting, filtering)
- Trader stats table queries
- Messages table queries
- User stats table queries

### 2. Server Actions Tests (`integration/server-actions.test.ts`)
Tests all server actions that power the frontend:
- `getTradesOnServer` with various filters and sorting
- `getTraderStatsOnServer` with leaderboard queries
- `getMessagesOnServer` with pagination
- `getUserStatsOnServer` with stats aggregation

### 3. Comprehensive Test Suite (`integration/all.test.ts`)
Runs all test suites in sequence and provides a complete summary.

## 🚀 Running Tests

### Prerequisites
1. Configure DATABASE_URL in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

2. Ensure tables exist in your database:
   - `trades`
   - `trader_stats`
   - `messages`
   - `user_stats`

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Database tests only
npx tsx __tests__/integration/database.test.ts

# Server actions tests only
npx tsx __tests__/integration/server-actions.test.ts

# All integration tests
npm run test:integration
```

## ✅ What Gets Tested

### Database Layer
- ✅ Real PostgreSQL connections
- ✅ Table schema validation
- ✅ SELECT queries with pagination
- ✅ Sorting (ASC/DESC) on multiple columns
- ✅ Filtering (status, type, trader address)
- ✅ COUNT aggregations
- ✅ Data type conversions (bigint to number)

### Server Actions Layer
- ✅ `"use server"` functions work correctly
- ✅ Data flows from database → server action → response
- ✅ Pagination parameters work
- ✅ Sorting parameters work
- ✅ Filtering parameters work
- ✅ Multiple concurrent queries

### Data Validation
- ✅ Trade data structure matches schema
- ✅ Trader stats calculations are correct
- ✅ Messages are properly formatted
- ✅ User stats aggregations work
- ✅ Timestamps are properly converted
- ✅ BigInt amounts are handled correctly

## 📊 Test Output

Tests provide detailed output showing:
- ✓ **Green** for passing tests
- ✗ **Red** for failing tests
- ⚠ **Yellow** for warnings
- ℹ **Cyan** for informational messages

Example output:
```
✓ Database connected
  Time: 2025-10-03 11:30:45
  Total trades: 150
  Fetched: 10 trades

✓ Sorting by price works
  Highest price: 125.5000 APT

✓ Filtering by status works
  Pending trades: 45
```

## 🔧 Troubleshooting

### DATABASE_URL not configured
Add your Neon Postgres connection string to `.env`:
```
DATABASE_URL="your-connection-string"
```

### Tables don't exist
Run the indexer to create and populate tables:
```bash
cd indexer
npm install
npm start
```

### No data in tables
The indexer needs to sync blockchain events. Wait for it to process transactions.

## 🎯 Test Philosophy

These tests follow a **zero-mock philosophy**:
- ✅ Real database connections
- ✅ Real SQL queries
- ✅ Real data transformations
- ✅ Real server actions
- ❌ No mocked functions
- ❌ No placeholder data
- ❌ No fake responses

This ensures the tests validate actual production code paths.

## 📝 Adding New Tests

To add new tests:

1. Create a new test file in `__tests__/integration/`
2. Follow the pattern:
   ```typescript
   #!/usr/bin/env tsx
   import { realFunction } from '../../src/path/to/function';

   async function testYourFeature() {
     const result = await realFunction(realParams);
     // Validate result
     return success;
   }
   ```

3. Add to `all.test.ts` to include in comprehensive suite
4. Update this README

## 🔗 Related Files

- Main test runner: `test-connections.ts` (root)
- Package scripts: `package.json`
- Database queries: `src/db/*.ts`
- Server actions: `src/app/actions.ts`
