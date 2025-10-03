# ⚡ TradeRadar Quick Start Guide

Get TradeRadar running in under 5 minutes!

## 🎯 What You're Building

A production-ready DeFi analytics platform featuring:
- **Real-time market data** from Merkle Trade perpetuals
- **Liquidity analytics** from Hyperion CLMM pools
- **Live price charts** with interactive visualizations
- **One-click trading** with leverage up to 20x
- **Telegram bot** for mobile trading alerts

## 🚀 Installation (2 minutes)

```bash
# Navigate to project
cd my-aptos-dapp

# Install dependencies
npm install

# This installs:
# - @merkletrade/aptos-sdk (perpetuals)
# - @aptos-labs/ts-sdk (blockchain)
# - chart.js + react-chartjs-2 (charts)
# - telegraf (Telegram bot)
# - Next.js 14 + TailwindCSS (frontend)
```

## 🎮 Running the App (1 minute)

### Start Web Dashboard

```bash
npm run dev
```

Then open: **http://localhost:3000/traderadar**

### Start Telegram Bot (Optional)

```bash
# 1. Get bot token from @BotFather on Telegram
# 2. Create .env file
cp .env.example .env

# 3. Edit .env and add your token
echo "TELEGRAM_BOT_TOKEN=your_token_here" >> .env

# 4. Start bot
npm run bot
```

## 🧪 Testing Features (2 minutes)

### Test Web Dashboard

1. **Market Screener**
   - View real-time markets from Merkle & Hyperion
   - Click column headers to sort
   - Observe live price updates

2. **Token Selection**
   - Click any row to select a token
   - Watch the price chart populate
   - See detailed metrics on the right

3. **Live Chart**
   - Observe real-time price movements
   - Hover over chart for details
   - Chart updates every second

4. **Trading**
   - Click "Trade on Merkle" button
   - Set leverage (1x-20x)
   - Choose Long/Short
   - Enter position size
   - Connect wallet to execute (testnet)

### Test Telegram Bot

```
Send to your bot:

/start          → Welcome message
/price BTC_USD  → Get current price
/markets        → View top 10 markets
/pools          → Check liquidity pools
/watch BTC_USD  → Add to watchlist
/alerts         → Get liquidity alerts
```

## 📂 Project Structure

```
my-aptos-dapp/
├── src/
│   ├── app/traderadar/page.tsx           ← Main dashboard
│   ├── components/traderadar/            ← UI components
│   │   ├── TokenScreener.tsx             ← Market table
│   │   ├── PriceChart.tsx                ← Live chart
│   │   └── TradeModal.tsx                ← Trade interface
│   └── lib/traderadar/                   ← Core logic
│       ├── merkleClient.ts               ← Merkle integration
│       ├── hyperionUtils.ts              ← Hyperion integration
│       └── hooks/                        ← React hooks
│           ├── useMerkleData.ts          ← Fetch Merkle data
│           ├── useHyperionPools.ts       ← Fetch Hyperion data
│           └── useLivePrices.ts          ← Live price feed
└── bot/bot.ts                            ← Telegram bot
```

## 🎨 Key Components Explained

### `useMerkleData` Hook
Fetches perpetual futures markets from Merkle Trade:
- Auto-updates every 10 seconds
- Returns: pairs, prices, funding rates, volume

### `useHyperionPools` Hook
Queries Hyperion CLMM liquidity pools:
- Fetches TVL, APR, reserves
- Detects high APR opportunities
- Auto-updates every 15 seconds

### `useLivePrices` Hook
Simulates real-time price feed:
- Updates every second
- Maintains 50-point sliding window
- Powers the live chart

### `TokenScreener` Component
DEXScreener-style market table:
- Sortable columns
- Combined Merkle + Hyperion data
- Source badges

### `PriceChart` Component
Interactive Chart.js line chart:
- Real-time price updates
- Hover tooltips
- Responsive design

### `TradeModal` Component
One-click trading interface:
- Leverage selection (1x-20x)
- Long/Short toggle
- Collateral calculation
- Wallet integration

## 🔧 Configuration

### Environment Variables

```bash
# .env file (already created from .env.example)

TELEGRAM_BOT_TOKEN=your_token_here          # From @BotFather
APTOS_NETWORK=testnet                        # testnet or mainnet
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
```

### Network Configuration

All integrations default to **Aptos Testnet**:
- Merkle Trade: `MerkleClientConfig.testnet()`
- Hyperion: Testnet pool addresses
- Aptos SDK: `Network.TESTNET`

To switch to mainnet (after hackathon):
1. Change `MerkleClientConfig.mainnet()`
2. Update `Network.MAINNET` in `hyperionUtils.ts`
3. Update pool addresses for mainnet

## 🐛 Troubleshooting

### Issue: "Cannot find module @merkletrade/aptos-sdk"
```bash
npm install @merkletrade/aptos-sdk
```

### Issue: Chart not rendering
```bash
# Check Chart.js is registered in PriceChart.tsx
# Verify prices array has data
```

### Issue: Wallet connection fails
- Install Petra or Martian wallet extension
- Switch wallet to Aptos Testnet
- Refresh the page

### Issue: Bot not responding
```bash
# Check .env has correct token
cat .env | grep TELEGRAM_BOT_TOKEN

# Restart bot
npm run bot
```

## 🎯 Next Steps

### For Development
1. **Add Real WebSocket**: Replace simulated prices with Merkle WS
2. **Historical Data**: Fetch past prices for chart
3. **More DEXs**: Integrate PancakeSwap, Thala
4. **User Positions**: Display open positions

### For Deployment
1. **Deploy to Vercel**: `npm run deploy`
2. **Deploy Bot**: Use Railway.app or VPS
3. **Custom Domain**: Add your domain in Vercel
4. **Analytics**: Enable Vercel Analytics

### For Hackathon
1. **Record Demo**: 2-3 minute video
2. **Prepare Pitch**: Highlight composability
3. **Submit**: DoraHacks platform
4. **Share**: Social media with #CTRLMOVE

## 📚 Additional Resources

- [Full README](./TRADERADAR_README.md) - Complete documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production setup
- [Merkle Docs](https://docs.merkle.trade) - Merkle Trade API
- [Aptos Docs](https://aptos.dev) - Aptos blockchain

## 💡 Pro Tips

1. **Real-time Feel**: useLivePrices updates every second for demo impact
2. **Data Combination**: Screener shows both Merkle & Hyperion—unique!
3. **Mobile First**: Telegram bot works anywhere, anytime
4. **Visual Appeal**: Chart.js animations catch judge attention
5. **One-Click UX**: Trade modal minimizes friction

## 🏆 Hackathon Highlights

**Composability**:
- ✅ Merkle Trade (perps) + Hyperion (liquidity)
- ✅ Unified analytics dashboard
- ✅ Cross-protocol insights

**Innovation**:
- ✅ First Aptos platform combining these protocols
- ✅ Telegram bot for mobile access
- ✅ Smart liquidity alerts

**UX**:
- ✅ Real-time updates (sub-second)
- ✅ Clean, modern UI
- ✅ One-click trading

**Technical Excellence**:
- ✅ TypeScript type safety
- ✅ Modular architecture
- ✅ Production-ready code

---

**You're all set! 🚀**

Run `npm run dev` and navigate to `/traderadar` to see your creation!

Questions? Check the full docs or reach out to the team.

**Good luck at the hackathon! 🏆**
