import { HyperionPool } from './types';

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeHeaders?: boolean;
  dateFormat?: string;
}

export function exportPoolsToCSV(pools: HyperionPool[]): string {
  const headers = [
    'Pool Address',
    'Token0',
    'Token1',
    'Reserve0',
    'Reserve1',
    'TVL (USD)',
    'Volume 24h',
    'APR (%)',
    'Fee (%)',
    'Price Change 24h (%)',
  ];

  const rows = pools.map((pool) => [
    pool.poolAddress,
    pool.token0,
    pool.token1,
    pool.reserve0.toString(),
    pool.reserve1.toString(),
    pool.tvl.toString(),
    pool.volume24h.toString(),
    pool.apr.toString(),
    (pool.fee * 100).toString(),
    (pool.priceChange24h || 0).toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function exportPoolsToJSON(
  pools: HyperionPool[],
  pretty = true
): string {
  const exportData = pools.map((pool) => ({
    poolAddress: pool.poolAddress,
    token0: pool.token0,
    token1: pool.token1,
    reserve0: pool.reserve0.toString(),
    reserve1: pool.reserve1.toString(),
    tvl: pool.tvl,
    volume24h: pool.volume24h,
    apr: pool.apr,
    fee: pool.fee,
    priceChange24h: pool.priceChange24h || 0,
  }));

  return pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);
}

export function exportSwapHistoryToCSV(
  swaps: Array<{
    transactionHash: string;
    sender: string;
    poolAddress: string;
    amountIn: number;
    amountOut: number;
    tokenIn: string;
    tokenOut: string;
    timestamp: number;
  }>
): string {
  const headers = [
    'Transaction Hash',
    'Sender',
    'Pool Address',
    'Amount In',
    'Amount Out',
    'Token In',
    'Token Out',
    'Timestamp',
    'Date',
  ];

  const rows = swaps.map((swap) => [
    swap.transactionHash,
    swap.sender,
    swap.poolAddress,
    swap.amountIn.toString(),
    swap.amountOut.toString(),
    swap.tokenIn,
    swap.tokenOut,
    swap.timestamp.toString(),
    new Date(swap.timestamp * 1000).toISOString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function exportMetricsToJSON(metrics: {
  totalTvl: number;
  totalVolume24h: number;
  totalPools: number;
  avgAPR: number;
  topPoolByTVL?: { address: string; pair: string; tvl: number } | null;
  topPoolByVolume?: { address: string; pair: string; volume24h: number } | null;
}): string {
  return JSON.stringify(
    {
      metrics: {
        totalTVL: metrics.totalTvl,
        totalVolume24h: metrics.totalVolume24h,
        totalPools: metrics.totalPools,
        averageAPR: metrics.avgAPR,
      },
      topPools: {
        byTVL: metrics.topPoolByTVL,
        byVolume: metrics.topPoolByVolume,
      },
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );
}

export function exportTradersToCSV(
  traders: Array<{
    address: string;
    swapCount: number;
    totalVolume: number;
    poolsTraded: number;
  }>
): string {
  const headers = [
    'Trader Address',
    'Total Swaps',
    'Total Volume',
    'Pools Traded',
    'Avg Volume per Swap',
  ];

  const rows = traders.map((trader) => [
    trader.address,
    trader.swapCount.toString(),
    trader.totalVolume.toString(),
    trader.poolsTraded.toString(),
    (trader.totalVolume / trader.swapCount).toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function exportTimeSeriesDataToCSV(
  data: Array<{
    timestamp: number;
    swapCount: number;
    volumeIn: number;
    volumeOut: number;
  }>,
  poolAddress?: string
): string {
  const headers = [
    'Timestamp',
    'Date',
    'Swap Count',
    'Volume In',
    'Volume Out',
    'Total Volume',
  ];

  if (poolAddress) {
    headers.unshift('Pool Address');
  }

  const rows = data.map((point) => {
    const row = [
      point.timestamp.toString(),
      new Date(point.timestamp * 1000).toISOString(),
      point.swapCount.toString(),
      point.volumeIn.toString(),
      point.volumeOut.toString(),
      (point.volumeIn + point.volumeOut).toString(),
    ];

    if (poolAddress) {
      row.unshift(poolAddress);
    }

    return row;
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function exportAlertsToJSON(
  alerts: Array<{
    poolAddress: string;
    symbol: string;
    type: 'high_apr' | 'low_liquidity' | 'volume_spike';
    message: string;
    timestamp: number;
    value: number;
  }>
): string {
  return JSON.stringify(
    {
      alerts: alerts.map((alert) => ({
        poolAddress: alert.poolAddress,
        symbol: alert.symbol,
        type: alert.type,
        message: alert.message,
        value: alert.value,
        date: new Date(alert.timestamp).toISOString(),
      })),
      count: alerts.length,
      generatedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function generatePoolReport(pool: HyperionPool): string {
  const report = `
Pool Report
===========

Pool Address: ${pool.poolAddress}
Token Pair: ${pool.token0}/${pool.token1}

Liquidity Metrics:
- Reserve ${pool.token0}: ${pool.reserve0.toString()}
- Reserve ${pool.token1}: ${pool.reserve1.toString()}
- Total Value Locked: $${pool.tvl.toLocaleString()}

Performance Metrics:
- 24h Volume: $${pool.volume24h.toLocaleString()}
- APR: ${pool.apr.toFixed(2)}%
- Fee Tier: ${(pool.fee * 100).toFixed(2)}%
- 24h Price Change: ${(pool.priceChange24h || 0).toFixed(2)}%

Calculated Metrics:
- Volume/TVL Ratio: ${(pool.volume24h / pool.tvl).toFixed(4)}
- Current Price: ${(Number(pool.reserve1) / Number(pool.reserve0)).toFixed(6)}

Report Generated: ${new Date().toISOString()}
  `.trim();

  return report;
}

export function exportToFile(data: string, filename: string, mimeType: string): void {
  if (typeof window !== 'undefined') {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function downloadPoolsCSV(pools: HyperionPool[], filename = 'pools.csv'): void {
  const csv = exportPoolsToCSV(pools);
  exportToFile(csv, filename, 'text/csv');
}

export function downloadPoolsJSON(pools: HyperionPool[], filename = 'pools.json'): void {
  const json = exportPoolsToJSON(pools);
  exportToFile(json, filename, 'application/json');
}

export function downloadSwapsCSV(
  swaps: Array<{
    transactionHash: string;
    sender: string;
    poolAddress: string;
    amountIn: number;
    amountOut: number;
    tokenIn: string;
    tokenOut: string;
    timestamp: number;
  }>,
  filename = 'swaps.csv'
): void {
  const csv = exportSwapHistoryToCSV(swaps);
  exportToFile(csv, filename, 'text/csv');
}

export function downloadTradersCSV(
  traders: Array<{
    address: string;
    swapCount: number;
    totalVolume: number;
    poolsTraded: number;
  }>,
  filename = 'traders.csv'
): void {
  const csv = exportTradersToCSV(traders);
  exportToFile(csv, filename, 'text/csv');
}

export function downloadPoolReport(pool: HyperionPool, filename?: string): void {
  const report = generatePoolReport(pool);
  const fname = filename || `pool_report_${pool.poolAddress.slice(0, 8)}.txt`;
  exportToFile(report, fname, 'text/plain');
}
