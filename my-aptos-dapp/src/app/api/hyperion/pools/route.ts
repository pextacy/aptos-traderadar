import { NextRequest, NextResponse } from 'next/server';
import { queryHyperionPools, queryHyperionPoolByAddress } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const poolAddress = searchParams.get('address');

    if (poolAddress) {
      // Query specific pool
      const pool = await queryHyperionPoolByAddress(poolAddress);

      if (!pool) {
        return NextResponse.json(
          { error: 'Pool not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ pool });
    }

    // Query all pools
    const pools = await queryHyperionPools();

    return NextResponse.json({
      pools,
      count: pools.length,
    });
  } catch (error) {
    console.error('Error querying Hyperion pools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pool data' },
      { status: 500 }
    );
  }
}
