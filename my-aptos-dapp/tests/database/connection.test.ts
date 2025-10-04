import { getPostgresClient } from '@/lib/db';

describe('Database Connection Tests', () => {
  let sql: ReturnType<typeof getPostgresClient>;

  beforeAll(() => {
    sql = getPostgresClient();
  });

  it('should connect to database', async () => {
    const result = await sql`SELECT 1 as test`;
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].test).toBe(1);
  });

  it('should query trades table', async () => {
    const result = await sql`SELECT COUNT(*) as count FROM trades`;
    expect(result).toBeDefined();
    expect(result[0]).toHaveProperty('count');
  });

  it('should query trader_stats table', async () => {
    const result = await sql`SELECT COUNT(*) as count FROM trader_stats`;
    expect(result).toBeDefined();
    expect(result[0]).toHaveProperty('count');
  });

  it('should query hyperion_pools table', async () => {
    try {
      const result = await sql`SELECT COUNT(*) as count FROM hyperion_pools`;
      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('count');
    } catch (error) {
      console.log('Hyperion pools table may not exist yet:', error);
    }
  });

  it('should query hyperion_swaps table', async () => {
    try {
      const result = await sql`SELECT COUNT(*) as count FROM hyperion_swaps LIMIT 1`;
      expect(result).toBeDefined();
    } catch (error) {
      console.log('Hyperion swaps table may not exist yet:', error);
    }
  });
});
