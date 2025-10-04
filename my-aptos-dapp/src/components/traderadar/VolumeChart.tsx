'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface VolumeDataPoint {
  timestamp: number;
  swapCount: number;
  volumeIn: number;
  volumeOut: number;
  totalVolume: number;
}

interface VolumeChartProps {
  poolAddress?: string;
  refreshInterval?: number;
}

export function VolumeChart({ poolAddress, refreshInterval = 60000 }: VolumeChartProps) {
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24');
  const [interval, setInterval] = useState<string>('60');
  const chartRef = useRef<ChartJS<'bar'>>(null);

  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        setError(null);

        const params = new URLSearchParams({
          view: 'timeseries',
          hours: timeRange,
          interval,
        });

        if (poolAddress) {
          params.append('pool', poolAddress);
        }

        const response = await fetch(`/api/hyperion/volume?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch volume data');
        }

        const result = await response.json();
        setVolumeData(result.data || []);
      } catch (err) {
        console.error('Error fetching volume data:', err);
        setError('Failed to load volume data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolumeData();
    const intervalId = window.setInterval(() => {
      fetchVolumeData();
    }, refreshInterval);

    return () => window.clearInterval(intervalId);
  }, [poolAddress, timeRange, interval, refreshInterval]);

  useEffect(() => {
    if (chartRef.current && volumeData.length > 0) {
      chartRef.current.update('none');
    }
  }, [volumeData]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const hours = parseInt(timeRange, 10);

    if (hours <= 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const labels = volumeData.map(d => formatTimestamp(d.timestamp));
  const volumes = volumeData.map(d => d.totalVolume);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Trading Volume',
        data: volumes,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
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
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const dataPoint = volumeData[context.dataIndex];
            return [
              `Volume: ${formatVolume(dataPoint.totalVolume)}`,
              `Swaps: ${dataPoint.swapCount}`,
            ];
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
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          callback: (value: string | number) => formatVolume(Number(value)),
        },
      },
    },
  };

  const totalVolume = volumeData.reduce((sum, d) => sum + d.totalVolume, 0);
  const totalSwaps = volumeData.reduce((sum, d) => sum + d.swapCount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 animate-pulse" />
            Volume Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Volume Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trading Volume
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24h</SelectItem>
                <SelectItem value="72">3d</SelectItem>
                <SelectItem value="168">7d</SelectItem>
                <SelectItem value="720">30d</SelectItem>
              </SelectContent>
            </Select>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15m</SelectItem>
                <SelectItem value="60">1h</SelectItem>
                <SelectItem value="240">4h</SelectItem>
                <SelectItem value="1440">1d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-xl font-bold">{formatVolume(totalVolume)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Swaps</p>
            <p className="text-xl font-bold">{totalSwaps.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg per Interval</p>
            <p className="text-xl font-bold">
              {volumeData.length > 0 ? formatVolume(totalVolume / volumeData.length) : '$0'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {volumeData.length > 0 ? (
            <Bar ref={chartRef} data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No volume data available for this time range
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
