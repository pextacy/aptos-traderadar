import { fetchTokenPrice, fetchMultipleTokenPrices } from './priceOracle';

interface PriceSnapshot {
  symbol: string;
  price: number;
  timestamp: number;
}

interface PriceAlert {
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  triggered: boolean;
}

class PriceTracker {
  private priceHistory: Map<string, PriceSnapshot[]> = new Map();
  private alerts: PriceAlert[] = [];
  private readonly maxHistorySize = 1000;
  private readonly cleanupInterval = 3600000;

  constructor() {
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  async trackPrice(symbol: string): Promise<PriceSnapshot> {
    const price = await fetchTokenPrice(symbol);
    const snapshot: PriceSnapshot = {
      symbol,
      price,
      timestamp: Date.now(),
    };

    const history = this.priceHistory.get(symbol) || [];
    history.push(snapshot);

    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    this.priceHistory.set(symbol, history);

    this.checkAlerts(symbol, price);

    return snapshot;
  }

  async trackMultiplePrices(symbols: string[]): Promise<PriceSnapshot[]> {
    const prices = await fetchMultipleTokenPrices(symbols);
    const snapshots: PriceSnapshot[] = [];
    const timestamp = Date.now();

    for (const symbol of symbols) {
      if (prices[symbol]) {
        const snapshot: PriceSnapshot = {
          symbol,
          price: prices[symbol],
          timestamp,
        };

        const history = this.priceHistory.get(symbol) || [];
        history.push(snapshot);

        if (history.length > this.maxHistorySize) {
          history.shift();
        }

        this.priceHistory.set(symbol, history);
        snapshots.push(snapshot);

        this.checkAlerts(symbol, prices[symbol]);
      }
    }

    return snapshots;
  }

  getPriceHistory(symbol: string, limit?: number): PriceSnapshot[] {
    const history = this.priceHistory.get(symbol) || [];

    if (limit && limit > 0) {
      return history.slice(-limit);
    }

    return history;
  }

  getPriceChange(symbol: string, timeframeMs: number): number {
    const history = this.priceHistory.get(symbol) || [];
    if (history.length < 2) return 0;

    const now = Date.now();
    const cutoff = now - timeframeMs;

    const oldPrice = history.find((snapshot) => snapshot.timestamp >= cutoff);
    const currentPrice = history[history.length - 1];

    if (!oldPrice || oldPrice.price === 0) return 0;

    return ((currentPrice.price - oldPrice.price) / oldPrice.price) * 100;
  }

  getMovingAverage(symbol: string, periods: number): number {
    const history = this.priceHistory.get(symbol) || [];
    if (history.length === 0) return 0;

    const recentPrices = history.slice(-periods);
    const sum = recentPrices.reduce((acc, snapshot) => acc + snapshot.price, 0);

    return sum / recentPrices.length;
  }

  getExponentialMovingAverage(symbol: string, periods: number): number {
    const history = this.priceHistory.get(symbol) || [];
    if (history.length === 0) return 0;

    const recentPrices = history.slice(-periods).map((s) => s.price);
    const multiplier = 2 / (periods + 1);

    let ema = recentPrices[0];
    for (let i = 1; i < recentPrices.length; i++) {
      ema = (recentPrices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  getVolatility(symbol: string, periods: number): number {
    const history = this.priceHistory.get(symbol) || [];
    if (history.length < 2) return 0;

    const recentPrices = history.slice(-periods).map((s) => s.price);

    const returns = recentPrices.slice(1).map((price, i) =>
      Math.log(price / recentPrices[i])
    );

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

    const variance = returns.reduce(
      (sum, ret) => sum + Math.pow(ret - avgReturn, 2),
      0
    ) / returns.length;

    return Math.sqrt(variance) * Math.sqrt(252) * 100;
  }

  detectCrossover(
    symbol: string,
    shortPeriod: number,
    longPeriod: number
  ): 'bullish' | 'bearish' | 'none' {
    const shortMA = this.getMovingAverage(symbol, shortPeriod);
    const longMA = this.getMovingAverage(symbol, longPeriod);

    const history = this.priceHistory.get(symbol) || [];
    if (history.length < longPeriod + 1) return 'none';

    const prevShortMA = this.getMovingAverageAt(symbol, shortPeriod, 1);
    const prevLongMA = this.getMovingAverageAt(symbol, longPeriod, 1);

    if (prevShortMA <= prevLongMA && shortMA > longMA) {
      return 'bullish';
    }

    if (prevShortMA >= prevLongMA && shortMA < longMA) {
      return 'bearish';
    }

    return 'none';
  }

  private getMovingAverageAt(
    symbol: string,
    periods: number,
    offset: number
  ): number {
    const history = this.priceHistory.get(symbol) || [];
    if (history.length < periods + offset) return 0;

    const recentPrices = history.slice(-(periods + offset), -offset || undefined);
    const sum = recentPrices.reduce((acc, snapshot) => acc + snapshot.price, 0);

    return sum / recentPrices.length;
  }

  addAlert(symbol: string, targetPrice: number, condition: 'above' | 'below'): void {
    this.alerts.push({
      symbol,
      targetPrice,
      condition,
      triggered: false,
    });
  }

  private checkAlerts(symbol: string, currentPrice: number): void {
    for (const alert of this.alerts) {
      if (alert.symbol === symbol && !alert.triggered) {
        if (
          (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice)
        ) {
          alert.triggered = true;
          this.onAlertTriggered(alert, currentPrice);
        }
      }
    }
  }

  private onAlertTriggered(alert: PriceAlert, currentPrice: number): void {
    console.log(
      `Price alert triggered for ${alert.symbol}: ${currentPrice} is ${alert.condition} ${alert.targetPrice}`
    );
  }

  getTriggeredAlerts(): PriceAlert[] {
    return this.alerts.filter((alert) => alert.triggered);
  }

  clearAlert(symbol: string, targetPrice: number): void {
    this.alerts = this.alerts.filter(
      (alert) => !(alert.symbol === symbol && alert.targetPrice === targetPrice)
    );
  }

  private cleanup(): void {
    const cutoffTime = Date.now() - 86400000;

    Array.from(this.priceHistory.entries()).forEach(([symbol, history]) => {
      const filtered = history.filter(
        (snapshot) => snapshot.timestamp > cutoffTime
      );
      this.priceHistory.set(symbol, filtered);
    });

    this.alerts = this.alerts.filter((alert) => !alert.triggered);
  }

  getLatestPrice(symbol: string): number {
    const history = this.priceHistory.get(symbol) || [];
    if (history.length === 0) return 0;

    return history[history.length - 1].price;
  }

  getHighLow(symbol: string, timeframeMs: number): { high: number; low: number } {
    const history = this.priceHistory.get(symbol) || [];
    const cutoff = Date.now() - timeframeMs;

    const recentPrices = history
      .filter((s) => s.timestamp >= cutoff)
      .map((s) => s.price);

    if (recentPrices.length === 0) {
      return { high: 0, low: 0 };
    }

    return {
      high: Math.max(...recentPrices),
      low: Math.min(...recentPrices),
    };
  }

  calculateRSI(symbol: string, periods = 14): number {
    const history = this.priceHistory.get(symbol) || [];
    if (history.length < periods + 1) return 50;

    const recentPrices = history.slice(-(periods + 1)).map((s) => s.price);

    const changes = recentPrices.slice(1).map((price, i) => price - recentPrices[i]);

    const gains = changes.map((change) => (change > 0 ? change : 0));
    const losses = changes.map((change) => (change < 0 ? Math.abs(change) : 0));

    const avgGain = gains.reduce((a, b) => a + b, 0) / periods;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / periods;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return rsi;
  }

  calculateBollingerBands(
    symbol: string,
    periods = 20,
    stdDevMultiplier = 2
  ): { upper: number; middle: number; lower: number } {
    const ma = this.getMovingAverage(symbol, periods);
    const history = this.priceHistory.get(symbol) || [];

    if (history.length < periods) {
      return { upper: ma, middle: ma, lower: ma };
    }

    const recentPrices = history.slice(-periods).map((s) => s.price);

    const variance =
      recentPrices.reduce((sum, price) => sum + Math.pow(price - ma, 2), 0) /
      periods;

    const stdDev = Math.sqrt(variance);

    return {
      upper: ma + stdDevMultiplier * stdDev,
      middle: ma,
      lower: ma - stdDevMultiplier * stdDev,
    };
  }
}

export const priceTracker = new PriceTracker();

export default priceTracker;
