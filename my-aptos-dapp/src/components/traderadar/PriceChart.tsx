'use client';

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PricePoint } from '@/lib/traderadar/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PriceChartProps {
  symbol: string;
  prices: PricePoint[];
  currentPrice: number;
}

export function PriceChart({ symbol, prices, currentPrice }: PriceChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update('none'); // Update without animation for real-time feel
    }
  }, [prices]);

  const labels = prices.map(p =>
    new Date(p.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  );

  const priceValues = prices.map(p => p.price);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${symbol} Price`,
        data: priceValues,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          callback: (value: any) => `$${value.toFixed(2)}`,
        },
      },
    },
    animation: {
      duration: 0,
    },
  };

  const priceChange = prices.length >= 2 ? prices[prices.length - 1].price - prices[0].price : 0;
  const priceChangePercent = prices.length >= 2 ? (priceChange / prices[0].price) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {symbol} Live Chart
          </span>
          <div className="text-right">
            <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
            <div className={`text-sm ${priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChangePercent >= 0 ? '+' : ''}
              {priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {prices.length > 0 ? (
            <Line ref={chartRef} data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading price data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
