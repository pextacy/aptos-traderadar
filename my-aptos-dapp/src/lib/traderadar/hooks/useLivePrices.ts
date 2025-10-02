'use client';

import { useEffect, useState, useRef } from 'react';
import { PricePoint } from '../types';

export function useLivePrices(symbol: string, maxPoints: number = 50) {
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;

    let mounted = true;

    // Simulated WebSocket connection for live prices
    // In production, use: new MerkleWebsocketClient() from SDK
    function simulateLivePrices() {
      const basePrice = symbol.includes('BTC') ? 65000 :
                       symbol.includes('ETH') ? 3200 :
                       symbol.includes('APT') ? 8.5 : 1;

      const interval = setInterval(() => {
        if (!mounted) return;

        const variation = (Math.random() - 0.5) * (basePrice * 0.001); // 0.1% variation
        const newPrice = basePrice + variation;

        const pricePoint: PricePoint = {
          timestamp: Date.now(),
          price: newPrice,
          volume: Math.random() * 1000000,
        };

        setPrices(prev => {
          const updated = [...prev, pricePoint];
          if (updated.length > maxPoints) {
            return updated.slice(-maxPoints);
          }
          return updated;
        });

        setCurrentPrice(newPrice);
        setLoading(false);
      }, 1000); // Update every second

      return interval;
    }

    const interval = simulateLivePrices();

    return () => {
      mounted = false;
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol, maxPoints]);

  return { prices, currentPrice, loading };
}

// Hook for multiple symbols
export function useMultipleLivePrices(symbols: string[]) {
  const [pricesMap, setPricesMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    function simulateMultiplePrices() {
      const basePrices: Record<string, number> = {
        'BTC_USD': 65000,
        'ETH_USD': 3200,
        'APT_USD': 8.5,
        'SOL_USD': 145,
      };

      const interval = setInterval(() => {
        if (!mounted) return;

        const updated: Record<string, number> = {};

        symbols.forEach(symbol => {
          const basePrice = basePrices[symbol] || 1;
          const variation = (Math.random() - 0.5) * (basePrice * 0.001);
          updated[symbol] = basePrice + variation;
        });

        setPricesMap(updated);
        setLoading(false);
      }, 1000);

      return interval;
    }

    const interval = simulateMultiplePrices();

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbols]);

  return { pricesMap, loading };
}
