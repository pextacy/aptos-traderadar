// Price Oracle for fetching real-time cryptocurrency prices
// Uses CoinGecko API (free tier) for price data

const PRICE_CACHE: Map<string, { price: number; timestamp: number }> = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
  };
}

const COINGECKO_IDS: Record<string, string> = {
  'APT': 'aptos',
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'USD': 'usd-coin', // Fallback to USDC for USD
};

/**
 * Fetch real-time price from CoinGecko API
 */
export async function fetchTokenPrice(symbol: string): Promise<number> {
  // Check cache first
  const cached = PRICE_CACHE.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  // Map symbol to CoinGecko ID
  const coinId = COINGECKO_IDS[symbol.toUpperCase()];
  if (!coinId) {
    console.warn(`No CoinGecko ID found for symbol: ${symbol}`);
    return 0;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 60 seconds in Next.js
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoPriceResponse = await response.json();
    const price = data[coinId]?.usd || 0;

    // Update cache
    PRICE_CACHE.set(symbol, { price, timestamp: Date.now() });

    return price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);

    // Return fallback prices if API fails
    const fallbackPrices: Record<string, number> = {
      'APT': 8.5,
      'BTC': 65000,
      'ETH': 3200,
      'USDC': 1.0,
      'USDT': 1.0,
      'USD': 1.0,
    };

    return fallbackPrices[symbol.toUpperCase()] || 1.0;
  }
}

/**
 * Fetch multiple token prices at once
 */
export async function fetchMultipleTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  // Filter out symbols we don't have IDs for
  const validSymbols = symbols.filter(s => COINGECKO_IDS[s.toUpperCase()]);

  if (validSymbols.length === 0) {
    return prices;
  }

  // Get CoinGecko IDs
  const coinIds = validSymbols
    .map(s => COINGECKO_IDS[s.toUpperCase()])
    .filter(Boolean)
    .join(',');

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoPriceResponse = await response.json();

    // Map back to symbols
    validSymbols.forEach(symbol => {
      const coinId = COINGECKO_IDS[symbol.toUpperCase()];
      if (coinId && data[coinId]) {
        prices[symbol] = data[coinId].usd;
        // Update cache
        PRICE_CACHE.set(symbol, { price: data[coinId].usd, timestamp: Date.now() });
      }
    });

    return prices;
  } catch (error) {
    console.error('Error fetching multiple prices:', error);

    // Return fallback prices
    const fallbackPrices: Record<string, number> = {
      'APT': 8.5,
      'BTC': 65000,
      'ETH': 3200,
      'USDC': 1.0,
      'USDT': 1.0,
      'USD': 1.0,
    };

    validSymbols.forEach(symbol => {
      prices[symbol] = fallbackPrices[symbol.toUpperCase()] || 1.0;
    });

    return prices;
  }
}

/**
 * Get price for a trading pair (e.g., "APT/USDC")
 * Returns [token0Price, token1Price]
 */
export async function getPairPrices(pairSymbol: string): Promise<[number, number]> {
  const [token0, token1] = pairSymbol.split('/');

  if (!token0 || !token1) {
    console.warn(`Invalid pair symbol: ${pairSymbol}`);
    return [1, 1];
  }

  const prices = await fetchMultipleTokenPrices([token0, token1]);

  return [
    prices[token0] || 1,
    prices[token1] || 1,
  ];
}
