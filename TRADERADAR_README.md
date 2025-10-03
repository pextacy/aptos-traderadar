# 🎯 Aptos TradeRadar - CTRL+MOVE Hackathon Submission

> **Real-time DEX Analytics & Trading Platform powered by Merkle Trade & Hyperion on Aptos**

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Aptos](https://img.shields.io/badge/Aptos-Testnet-green.svg)
![Hackathon](https://img.shields.io/badge/CTRL+MOVE-Hackathon-orange.svg)

## 🚀 Overview

TradeRadar is a comprehensive DeFi analytics and trading platform built on Aptos, integrating **Merkle Trade's** perpetual futures protocol and **Hyperion's** CLMM liquidity pools. It provides traders with real-time market insights, liquidity analytics, and one-click trading capabilities—accessible via web dashboard and Telegram bot.

### 🏆 Hackathon Track
**Trading & Market Infrastructure** - Composability Focus

### ✨ Key Features

- **📊 Real-time Market Screener**: Live price feeds from Merkle Trade with sub-second updates
- **💧 Liquidity Pool Analytics**: Hyperion CLMM pool metrics (TVL, APR, volume)
- **📈 Live Price Charts**: Interactive Chart.js visualizations with real-time data
- **⚡ One-Click Trading**: Execute leveraged trades on Merkle Trade directly from the UI
- **🤖 Telegram Bot**: Mobile-first trading experience with market alerts
- **🔔 Smart Alerts**: Automated liquidity and APR opportunity notifications
- **🎨 Modern UI**: Built with Next.js 14, TailwindCSS, and shadcn/ui components

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Chart.js + react-chartjs-2
- **State Management**: React Hooks + TanStack Query

### Blockchain Integration
- **Aptos SDK**: `@aptos-labs/ts-sdk` v5.0.0
- **Merkle Trade SDK**: `@merkletrade/aptos-sdk` v1.1.4
- **Wallet**: Aptos Wallet Adapter

### Bot
- **Telegram**: Telegraf v4.16.3
- **Runtime**: Node.js with tsx

### Data Sources
- **Perpetuals**: Merkle Trade API & WebSocket
- **Liquidity**: Hyperion on-chain view functions
- **Network**: Aptos Testnet

## 📁 Project Structure

```
my-aptos-dapp/
├── src/
│   ├── app/
│   │   └── traderadar/
│   │       └── page.tsx              # Main TradeRadar dashboard
│   ├── components/
│   │   ├── traderadar/
│   │   │   ├── TokenScreener.tsx     # Market screener table
│   │   │   ├── PriceChart.tsx        # Live price chart
│   │   │   └── TradeModal.tsx        # Trading interface
│   │   └── ui/                       # shadcn/ui components
│   └── lib/
│       └── traderadar/
│           ├── types.ts               # TypeScript interfaces
│           ├── merkleClient.ts        # Merkle Trade integration
│           ├── hyperionUtils.ts       # Hyperion pool analytics
│           └── hooks/
│               ├── useMerkleData.ts   # Merkle data hook
│               ├── useHyperionPools.ts # Hyperion pools hook
│               └── useLivePrices.ts   # Live price WebSocket hook
├── bot/
│   └── bot.ts                         # Telegram bot
├── package.json
└── .env.example
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ recommended
- **npm** or **yarn**
- **Aptos Wallet**: Petra or Martian for trading
- **Telegram Bot Token**: (Optional) From [@BotFather](https://t.me/botfather)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aptos-traderadar.git
cd aptos-traderadar/my-aptos-dapp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Running the Web App

```bash
# Development mode
npm run dev

# Access at http://localhost:3000/traderadar
```

### Running the Telegram Bot

```bash
# Add your Telegram bot token to .env
# TELEGRAM_BOT_TOKEN=your_token_here

# Start the bot
npm run bot
```

## 📱 Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Initialize bot and see welcome message |
| `/price <symbol>` | Get current price (e.g., `/price BTC_USD`) |
| `/markets` | View top 10 markets by volume |
| `/pools` | Check Hyperion liquidity pools |
| `/watch <symbol>` | Add symbol to watchlist |
| `/watchlist` | View your watchlist |
| `/alerts` | Get liquidity & APR alerts |
| `/help` | Show all commands |

## 🎯 Core Integrations

### 1️⃣ Merkle Trade Integration

```typescript
// Fetch perpetual pairs
const pairs = await getMerklePairs();

// Get market data for a symbol
const market = await getMerkleMarketData('BTC_USD');

// Build trade transaction
const payload = await buildTradePayload(
  userAddress,
  'BTC_USD',
  0.1,      // size
  true,     // isLong
  5         // leverage
);
```

**Features:**
- Real-time price feeds via API
- WebSocket for live updates (simulated)
- Order execution with leverage (1x-20x)
- Position tracking

### 2️⃣ Hyperion CLMM Integration

```typescript
// Get all liquidity pools
const pools = await getAllHyperionPools();

// Get specific pool data
const poolData = await getHyperionPoolData('APT/USDC');

// Calculate metrics
const tvl = calculateTVL(reserve0, reserve1, price0, price1);
const apr = calculateAPR(volume24h, tvl, fee);
```

**Features:**
- On-chain pool reserves via view functions
- TVL and APR calculations
- Volume estimation
- Liquidity alerts (high APR, low TVL)

## 🎨 UI Components

### TokenScreener
- Sortable table (by price, volume, TVL, 24h change)
- Combined data from Merkle + Hyperion
- Source badges (Merkle/Hyperion)
- Click to select token for chart

### PriceChart
- Real-time line chart with Chart.js
- Auto-updating price feed
- 24h price change indicator
- Responsive design

### TradeModal
- Long/Short selection
- Leverage slider (1x-20x)
- Position size calculator
- Collateral estimation
- One-click execution

## 🔐 Security & Best Practices

- **Testnet Only**: All transactions on Aptos Testnet
- **Wallet Integration**: Secure signing with Aptos Wallet Adapter
- **Input Validation**: Client-side validation for trade parameters
- **Error Handling**: Comprehensive try-catch blocks
- **Environment Variables**: Secrets stored in `.env` (gitignored)

## 📊 Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Merkle    │ ──API──>│  TradeRadar  │<──View──│  Hyperion   │
│   Trade     │ <─WS───>│   Frontend   │         │    CLMM     │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               │ Commands
                               ▼
                        ┌──────────────┐
                        │  Telegram    │
                        │     Bot      │
                        └──────────────┘
```

## 🎯 Hackathon Goals Achieved

✅ **Composability**: Combines Merkle (perps) + Hyperion (liquidity) in one platform
✅ **Real-time Data**: Sub-second price updates via hooks
✅ **User Experience**: Clean UI with one-click trading
✅ **Mobile-First**: Telegram bot for on-the-go access
✅ **Innovation**: Liquidity alerts inform trading decisions
✅ **Aptos-Native**: Built with Aptos SDK, testnet deployment ready

## 🚀 Future Enhancements

- [ ] **WebSocket Integration**: Replace simulated prices with Merkle WS client
- [ ] **Historical Data**: Fetch and display historical price charts
- [ ] **Advanced Alerts**: Push notifications via Telegram for price targets
- [ ] **Portfolio Tracking**: Display user positions and P&L
- [ ] **Multi-DEX Support**: Add more Aptos DEXs (PancakeSwap, Thala)
- [ ] **Mainnet Deployment**: Launch on Aptos mainnet with real funds
- [ ] **Mobile App**: React Native companion app

## 🤝 Contributing

This project was built for the CTRL+MOVE Hackathon. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Merkle Trade** - For the excellent Aptos SDK and perpetuals protocol
- **Hyperion** - For CLMM liquidity infrastructure
- **Aptos Foundation** - For the robust blockchain and developer tools
- **DoraHacks** - For organizing the CTRL+MOVE Hackathon
- **shadcn/ui** - For beautiful, accessible UI components

## 📞 Contact

- **Project Lead**: [Your Name]
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- **Discord**: YourDiscord#1234

---

**Built with ❤️ for the Aptos Ecosystem | CTRL+MOVE Hackathon 2024**

🔗 [Live Demo](https://traderadar.vercel.app) | 📹 [Demo Video](https://youtu.be/demo) | 🏆 [DoraHacks Submission](https://dorahacks.io/buidl/xxxx)
