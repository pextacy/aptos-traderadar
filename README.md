# 🚀 Aptos TradeRadar - CTRL+MOVE Hackathon

**The Ultimate DeFi Analytics & Trading Bot for Aptos**

Real-time analytics dashboard + Telegram bot aggregating **Merkle Trade** ($26B+ volume) and **Hyperion** ($130M+ TVL) data. One-click trading with sub-second finality on Aptos.

## 🏆 Key Features

### 💹 **Advanced Trading Infrastructure**
- **Real-Time Dashboard**: Displays token data (symbol, price, 24h volume, TVL) from Merkle Trade perps (e.g., BTC/USD) and Hyperion pools (e.g., USDC/APT)
- **Live Price Charts**: Chart.js-powered graphs with Merkle WebSocket updates for sub-second price feeds
- **One-Click Trading**: Execute market orders on Merkle Trade (e.g., long BTC with $5 collateral) via modal interface
- **Advanced Analytics**: Real-time liquidity monitoring, APR calculations, and volume spike detection

### 📱 **Mobile-First DeFi Access**
- **Telegram Bot**: Commands like `/price BTC_USD` and `/trade BTC 100` for mobile-first access
- **Zero-Gas Transactions**: Leveraging Aptos' efficient transaction processing
- **Push Notifications**: Real-time price alerts and liquidity notifications
- **Mass Adoption Ready**: Intuitive UX making DeFi accessible to retail users

### 🔗 **Aptos-Native Composability**
- **Cross-Protocol Analytics**: Merges Merkle perp data with Hyperion liquidity (e.g., $10.47M TVL in USDC/APT)
- **Parallel Execution**: Utilizes Aptos' parallel transaction processing for real-time data updates
- **Move Smart Contracts**: On-chain trade tracking and analytics aggregation
- **Sub-Second Finality**: Leveraging Aptos' speed for responsive trading UX

### 🌍 **Payments & Money Movement**
- **Fiat On/Off-Ramps**: Integration with Circle CCTP for seamless fiat transitions
- **Global Remittance**: P2P payment infrastructure using stablecoins on Aptos
- **Cross-Border Trading**: Leveraging Aptos' speed for international DeFi access
- **High-Remittance Market Focus**: Targeting adoption in India and Africa

---

## 🛠️ Tech Stack - Showcasing Aptos Innovation

### **Frontend & UI**
- **React (Vite)**: Modern, fast development with HMR
- **TypeScript**: Type-safe development for production reliability
- **TailwindCSS + shadcn/ui**: Professional, responsive design system
- **Chart.js**: Real-time price charting with WebSocket integration

### **Blockchain & Infrastructure**
- **Aptos SDK** (`@aptos-labs/ts-sdk`): Native Aptos integration for wallet connectivity and transactions
- **Merkle Trade Integration**: Direct SDK integration for perpetual futures
- **Move Smart Contracts**: Custom on-chain analytics and trade tracking
- **Indexer**: Rust-based event indexer for trade history and analytics

### **Backend & Integrations**
- **Node.js**: Scalable backend architecture
- **Telegraf**: Advanced Telegram bot framework
- **Diesel ORM**: Database management for trade tracking
- **WebSocket**: Real-time price feeds and notifications

### **Testing & Deployment**
- **Jest**: Comprehensive unit testing for SDK integrations
- **Docker**: Containerized deployment ready
- **Aptos Testnet**: Safe environment for hackathon demos

---

## 🔌 Advanced Aptos Integrations

### **Merkle Trade - Perpetual Futures Infrastructure**
- **SDK Integration**: Direct `@merkletrade/ts-sdk` implementation for perp data (pairs, positions)
- **Real-Time WebSocket**: Live price feeds with sub-second updates
- **Zero-Gas Trading**: Market orders leveraging Aptos' efficient transaction processing
- **Position Tracking**: Real-time PnL and liquidation monitoring

### **Hyperion - CLMM Liquidity Pools**
- **Pool Analytics**: Queries USDC/APT pool via `@aptos-labs/ts-sdk` for reserves/TVL calculation
- **Liquidity Intelligence**: APR calculations, volume tracking, and liquidity alerts
- **Cross-Protocol Data**: Unified analytics combining perp and spot market data

### **Aptos Core Infrastructure**
- **Parallel Execution**: Utilizes Aptos' unique parallel transaction processing for real-time updates
- **Move Language**: Custom smart contracts for on-chain trade aggregation and analytics
- **Sub-Second Finality**: Leveraging Aptos' speed for responsive trading UX
- **Testnet Integration**: Safe environment for hackathon demonstrations

---

## 📦 Setup Instructions

### **Prerequisites**
- Node.js 18+
- Aptos CLI (`npm install -g @aptos-labs/aptos-cli`)
- Telegram account for bot token
- Git

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pextacy/aptos-traderadar.git
   cd aptos-traderadar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root:
   ```env
   VITE_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
   TELEGRAM_TOKEN=your-telegram-bot-token
   ```
   Get a Telegram bot token from [BotFather](https://t.me/botfather).

4. **Fund a testnet account:**
   - Run `aptos account create --network testnet` to generate an address
   - Fund it at [Aptos Testnet Faucet](https://aptoslabs.com/testnet-faucet)

### **Running the App**

1. **Start the web app:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

2. **Run the Telegram bot:**
   ```bash
   node bot/bot.ts
   ```
   Interact via Telegram with `/start`, `/price BTC_USD`, or `/trade BTC 100`.

### **Testing**
```bash
npm test
```
Runs Jest tests for Merkle and Hyperion integrations.

---

## 📂 Project Structure

```
aptos-traderadar/
├── /public/                   # Static assets (index.html, logos)
├── /src/                      # React app
│   ├── /components/           # UI: Dashboard, TokenScreener, PriceChart, TradeModal
│   ├── /hooks/                # Data: useMerkle, useHyperion, useLivePrices
│   ├── /utils/                # Clients: aptosClient, merkleClient, hyperionUtils
├── /bot/                      # Telegram bot (bot.ts, botConfig.ts)
├── /contracts/                # Move smart contracts (oracle.move)
├── /tests/                    # Jest tests for SDKs
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables
├── vite.config.ts             # Vite config
└── README.md                  # This file
```

---

## 🚀 Future Roadmap

- **Circle CCTP Integration**: Add fiat on/off-ramps for seamless fiat transitions
- **RWA Integration**: Track tokenized real-world assets (e.g., Libre's tokenized bonds)
- **On-Chain Oracle**: Deploy persistent data aggregation using Move contracts
- **Social Trading Features**: Integrate X (Twitter) sentiment analysis for trading signals
- **AI-Powered Analytics**: Predictive trading signals and market insights
- **Cross-Chain Bridges**: Multi-chain DeFi ecosystem integration
- **Copy Trading Mechanics**: Enable users to follow top traders

---

## 📚 Resources

- [Merkle Trade Documentation](https://docs.merkletrade.com)
- [Aptos SDK Documentation](https://aptos.dev/sdks/ts-sdk/)
- [Hyperion Protocol](https://hyperion.money)
- [CTRL+MOVE Hackathon](https://dorahacks.io/hackathon/ctrl-move)


---

## 👥 Team

Building the future of DeFi infrastructure on Aptos - One trade at a time!


**Built with ❤️ for the CTRL+MOVE Hackathon | Powered by Aptos**
