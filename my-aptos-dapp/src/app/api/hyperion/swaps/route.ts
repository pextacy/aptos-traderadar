import { NextRequest, NextResponse } from 'next/server';
import { queryHyperionSwaps } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const poolAddress = searchParams.get('pool');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    const swaps = await queryHyperionSwaps(poolAddress || undefined, limit);

    return NextResponse.json({
      swaps,
      count: swaps.length,
      pool: poolAddress || 'all',
    });
  } catch (error) {
    console.error('Error querying Hyperion swaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swap data' },
      { status: 500 }
    );
  }
}
