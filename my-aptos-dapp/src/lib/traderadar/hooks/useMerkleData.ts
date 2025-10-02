'use client';

import { useEffect, useState } from 'react';
import { getMerklePairs, getMerkleMarketData } from '../merkleClient';
import { MerklePair, TokenData } from '../types';

export function useMerkleData() {
  const [pairs, setPairs] = useState<MerklePair[]>([]);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMerkleData() {
      try {
        setLoading(true);
        const pairsData = await getMerklePairs();

        if (!mounted) return;

        // Convert Merkle pairs to TokenData format
        const formattedData: TokenData[] = pairsData.map((pair: any) => ({
          symbol: pair.symbol || pair.name,
          price: parseFloat(pair.markPrice || pair.indexPrice || '0'),
          priceChange24h: parseFloat(pair.priceChange24h || '0'),
          volume24h: parseFloat(pair.volume24h || '0'),
          fundingRate: parseFloat(pair.fundingRate || '0'),
          source: 'merkle' as const,
        }));

        setPairs(pairsData);
        setTokenData(formattedData);
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch Merkle data');
          console.error('Error in useMerkleData:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMerkleData();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchMerkleData, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { pairs, tokenData, loading, error };
}

export function useMerkleMarket(symbol: string) {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMarketData() {
      if (!symbol) return;

      try {
        setLoading(true);
        const data = await getMerkleMarketData(symbol);

        if (mounted) {
          setMarketData(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMarketData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchMarketData, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return { marketData, loading, error };
}
