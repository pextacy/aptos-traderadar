# 📊 Aptos TradeRadar

> **Real-time on-chain trading analytics and mobile-first DeFi access on Aptos**

<div align="center">

[![Built for CTRL+MOVE Hackathon](https://img.shields.io/badge/CTRL%2BMOVE-Hackathon-brightgreen)](https://dorahacks.io)
[![Aptos](https://img.shields.io/badge/Aptos-Testnet-blue)](https://aptoslabs.com)
[![License](https://img.shields.io/badge/License-Apache%202.0-orange)](LICENSE)

**Submission Deadline:** October 3, 2025, 11:59 PM UTC+3

[Demo Video](#) | [Live App](#) | [DoraHacks Submission](#)

</div>

---

## 🎯 What is Aptos TradeRadar?

**Aptos TradeRadar** is a comprehensive on-chain trading platform that combines **real-time analytics**, **on-chain trade execution**, and **mobile-first Telegram access** to revolutionize DeFi trading on Aptos. Built for the **Trading & Market Infrastructure** track, TradeRadar showcases Aptos' parallel execution, sub-second finality, and composability.

### 🏆 Why TradeRadar?

- **On-Chain First**: Every trade is recorded on-chain via Move smart contracts, ensuring transparency and composability
- **Real-Time Analytics**: Live dashboard with trading metrics, volume tracking, and trader statistics
- **Mobile Accessibility**: Full-featured Telegram bot for trading on-the-go
- **Liquidity Intelligence**: Integration with Hyperion CLMM pools for deep liquidity insights
- **Production-Ready**: Database indexer, REST APIs, and scalable architecture

---

## ✨ Core Features

### 📈 Live Trading Dashboard
- **Real-time metrics**: Total trades, active trades, 24h volume, active traders
- **Volume trends**: Live 24h change tracking with visual indicators
- **Market activity**: Real-time trading activity monitor
- **Auto-refresh**: Dashboard updates every 10 seconds

### 🔥 On-Chain Trade Execution
- **Create Trades**: Buy/Sell/Swap orders with full on-chain execution
- **Trade Management**: Update, complete, or cancel trades via smart contracts
- **Multi-Token Support**: APT, USDC, BTC, ETH and more
- **Status Tracking**: Pending/Completed/Cancelled states with timestamps

### 📱 Telegram Trading Bot
Complete mobile trading experience with commands:
- `/price <symbol>` - Get live token prices with 24h stats
- `/markets` - View top trading pairs
- `/pools` - Check Hyperion liquidity pools (TVL, APR, volume)
- `/watch <symbol>` - Add tokens to watchlist
- `/alerts` - Get high APR and low liquidity notifications

### 💧 Hyperion Liquidity Analytics
- **Pool Tracking**: APT/USDC, BTC/USD, ETH/USD pools
- **TVL Calculation**: Real-time total value locked
- **APR Estimation**: Yield calculations based on 24h volume
- **Liquidity Alerts**: Low liquidity warnings and high APR opportunities

### 🔗 Smart Contract Integration
**Move Module**: `trade_radar.move`
- `create_trade()` - Create new trade with token pairs, amounts, price
- `update_trade()` - Modify pending trades
- `complete_trade()` - Mark trades as executed
- `cancel_trade()` - Cancel pending trades
- Event emission for all operations (indexer-friendly)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, shadcn/ui, React Query |
| **Smart Contracts** | Move language (trade_radar.move) |
| **Blockchain SDK** | @aptos-labs/ts-sdk v5.0, Aptos Wallet Adapter |
| **Database** | Neon Postgres (serverless) |
| **Telegram Bot** | Telegraf framework |
| **Charts** | Chart.js, react-chartjs-2 |
| **Deployment** | Vercel (frontend), Railway (indexer) |

### 🏗️ Architecture

```
┌─────────────────┐
│  Next.js App    │ ← User Dashboard (Real-time UI)
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Aptos   │ ← trade_radar.move (On-chain trades)
    │Blockchain│
    └────┬─────┘
         │
    ┌────▼────────┐
    │   Indexer   │ ← Neon Postgres (Event tracking)
    └─────────────┘
         │
    ┌────▼─────────┐
    │ Telegram Bot │ ← Mobile access (Telegraf)
    └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Aptos wallet (Petra, Martian, or Pontem)
- Telegram account (for bot access)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/aptos-traderadar.git
cd aptos-traderadar/my-aptos-dapp

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with:
# - TELEGRAM_BOT_TOKEN (get from @BotFather)
# - DATABASE_URL (Neon Postgres connection string)
# - APTOS_NETWORK=testnet
```

### Run the Application

```bash
# Start Next.js app
npm run dev
# Open http://localhost:3000

# Run Telegram bot (in separate terminal)
npm run bot

# Compile Move contracts
npm run move:compile

# Deploy contracts
npm run move:publish

# Run tests
npm test
```

### Fund Testnet Wallet
1. Create wallet at [Petra Wallet](https://petra.app)
2. Get testnet APT: https://aptoslabs.com/testnet-faucet
3. Connect wallet to TradeRadar dashboard

---

## 📁 Project Structure

```
aptos-traderadar/
├── my-aptos-dapp/
│   ├── src/
│   │   ├── app/                    # Next.js pages & routing
│   │   ├── components/             # React components
│   │   │   ├── Dashboard.tsx       # Live metrics dashboard
│   │   │   ├── TradeBoard.tsx      # Trade listing table
│   │   │   ├── CreateTrade.tsx     # Trade creation form
│   │   │   └── Analytics.tsx       # User analytics
│   │   ├── lib/
│   │   │   ├── aptos.ts           # Aptos SDK client
│   │   │   ├── db.ts              # Database client
│   │   │   └── traderadar/        # Trading logic
│   │   │       ├── merkleClient.ts     # Merkle integration
│   │   │       ├── hyperionUtils.ts    # Hyperion pools
│   │   │       └── priceOracle.ts      # CoinGecko prices
│   │   └── entry-functions/       # Transaction builders
│   ├── contract/
│   │   └── sources/
│   │       └── trade_radar.move   # Core smart contract
│   ├── bot/
│   │   └── bot.ts                 # Telegram bot implementation
│   └── package.json
└── README.md
```

---

## 🎮 Usage Examples

### Creating a Trade (Web UI)
1. Connect Aptos wallet
2. Navigate to "Create New Trade"
3. Select trade type (Buy/Sell/Swap)
4. Enter token pair (e.g., APT → USDC)
5. Set amounts and price
6. Click "Create Trade"
7. Approve transaction in wallet
8. Trade appears in dashboard within seconds

### Trading via Telegram
```
/start                    # Get started
/price APT_USDC          # Check APT price
/markets                 # View top pairs
/pools                   # See liquidity pools
/watch BTC_USD           # Add to watchlist
/alerts                  # Check opportunities
```

### Smart Contract Interaction
```typescript
import { createTrade } from '@/entry-functions/createTrade';

await signAndSubmitTransaction(
  createTrade({
    tradeType: 1,           // 1=BUY, 2=SELL, 3=SWAP
    tokenFrom: "APT",
    tokenTo: "USDC",
    amountFrom: 100000000,  // 1 APT (in octas)
    amountTo: 1000000000,   // 10 USDC
    price: 1000000000,      // 10 APT per token
    notes: "Market buy order"
  })
);
```

---

## 🏆 Hackathon Fit: Trading & Market Infrastructure

### ✅ Composability
- **On-chain trades** via Move objects (can be queried by any dApp)
- **Event emission** for indexer integration
- **Hyperion liquidity** integration for price discovery
- **Open APIs** for third-party access

### ✅ Technical Innovation
- **Sub-second finality**: Trades confirm in <1s on Aptos testnet
- **Parallel execution**: Multiple trades processed simultaneously
- **Real-time indexer**: Postgres + event streaming
- **Mobile-first**: Telegram bot with full feature parity

### ✅ Impact & Accessibility
- **Retail-friendly**: No complex DeFi jargon
- **Zero barriers**: Start trading via Telegram (no browser needed)
- **Transparent**: All trades on-chain and verifiable
- **Educational**: Dashboard teaches market dynamics

### ✅ Production Quality
- TypeScript throughout (type-safe)
- Comprehensive error handling
- Database indexer for historical data
- Responsive UI with dark mode
- Automated testing setup

---

## 🎯 Prizes Targeted

| Prize Category | Amount | Why We Win |
|---------------|--------|-----------|
| **Main Track 1st Place** | $30,000 | Full-stack trading platform with on-chain settlement, mobile access, and liquidity analytics |
| **Best Tech Implementation** | $15,000 | Advanced Move contracts, real-time indexer, REST APIs, Telegram bot integration |

---

## 🔮 Future Roadmap

### Phase 1: Enhanced Trading (Q1 2026)
- [ ] Order matching engine
- [ ] Limit orders and stop-loss
- [ ] Trade history charts
- [ ] Portfolio tracking

### Phase 2: Liquidity Integration (Q2 2026)
- [ ] Direct Merkle Trade perp execution
- [ ] Aggregated DEX routing
- [ ] Liquidity pool creation
- [ ] Yield farming strategies

### Phase 3: Social & Payments (Q3 2026)
- [ ] Social trading (copy trades)
- [ ] P2P payments via Telegram
- [ ] Fiat on/off-ramps (Circle CCTP)
- [ ] Multi-chain support

---

## 👥 Team

**[Your Team Name]**
- Built with passion for CTRL+MOVE Hackathon
- Contact: [Discord/Email]
- GitHub: [Repository Link]

---

## 📚 Resources

- [Aptos Developer Docs](https://aptos.dev)
- [Move Language Book](https://move-language.github.io/move/)
- [Aptos Wallet Adapter](https://github.com/aptos-labs/aptos-wallet-adapter)
- [CTRL+MOVE Hackathon](https://dorahacks.io/hackathon/aptos-ctrlmove-hackathon)
- [Hyperion DEX](https://hyperion.finance)

---

## 📝 License

Apache 2.0 - See [LICENSE](LICENSE) for details

---

<div align="center">

**Built for CTRL+MOVE Hackathon 2025** 🚀

*Redefining DeFi trading on Aptos with speed, transparency, and accessibility*

</div>
