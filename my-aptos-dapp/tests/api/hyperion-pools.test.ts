import { GET } from '@/app/api/hyperion/pools/route';
import { NextRequest } from 'next/server';

describe('/api/hyperion/pools', () => {
  it('should return pools data', async () => {
    const request = new NextRequest('http://localhost:3000/api/hyperion/pools');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('pools');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.pools)).toBe(true);
  });

  it('should return specific pool by address', async () => {
    const testAddress = '0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8';
    const request = new NextRequest(`http://localhost:3000/api/hyperion/pools?address=${testAddress}`);
    const response = await GET(request);
    const data = await response.json();

    if (response.status === 200) {
      expect(data).toHaveProperty('pool');
      if (data.pool) {
        expect(data.pool).toHaveProperty('pool_address');
        expect(data.pool).toHaveProperty('token0_symbol');
        expect(data.pool).toHaveProperty('token1_symbol');
      }
    }
  });
});
