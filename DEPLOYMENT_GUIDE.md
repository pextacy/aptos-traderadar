# 🚀 TradeRadar Deployment Guide

Complete guide for deploying TradeRadar to production and preparing for the CTRL+MOVE Hackathon submission.

## 📋 Pre-Deployment Checklist

- [ ] Install all dependencies: `npm install`
- [ ] Test locally: `npm run dev`
- [ ] Create Telegram bot (if using bot features)
- [ ] Configure environment variables
- [ ] Test wallet connection on testnet
- [ ] Verify Merkle Trade SDK connectivity
- [ ] Test Hyperion pool queries

## 🌐 Web App Deployment (Vercel)

### Step 1: Prepare for Vercel

```bash
cd my-aptos-dapp

# Build locally to test
npm run build

# Verify build succeeded
npm run start
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
npm run deploy

# Follow prompts:
# - Link to existing project or create new
# - Set project name: aptos-traderadar
# - Framework: Next.js
# - Build command: next build
# - Output directory: .next
```

### Step 3: Configure Environment Variables on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings → Environment Variables**
4. Add variables:
   - `NEXT_PUBLIC_APTOS_NETWORK=testnet`
   - `TELEGRAM_BOT_TOKEN=your_bot_token` (if using bot)

### Step 4: Custom Domain (Optional)

1. In Vercel Dashboard → **Settings → Domains**
2. Add custom domain: `traderadar.yourname.com`
3. Update DNS records as instructed

## 🤖 Telegram Bot Deployment

### Option 1: Run on VPS (Recommended for 24/7 uptime)

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Clone repository
git clone https://github.com/yourusername/aptos-traderadar.git
cd aptos-traderadar/my-aptos-dapp

# Install dependencies
npm install

# Create .env file
nano .env
# Add: TELEGRAM_BOT_TOKEN=your_token_here

# Install PM2 for process management
npm install -g pm2

# Start bot with PM2
pm2 start npm --name "traderadar-bot" -- run bot

# Save PM2 config
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Option 2: Run Locally (for testing)

```bash
# In my-aptos-dapp directory
npm run bot

# Keep terminal open
# Bot will run until you press Ctrl+C
```

### Option 3: Railway.app (Free tier available)

1. Create account at [Railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Set start command: `npm run bot`
5. Add environment variable: `TELEGRAM_BOT_TOKEN`
6. Deploy

## 📹 Creating Demo Video

### Recording Checklist

- [ ] **Introduction** (15 seconds)
  - Project name and tagline
  - Your name/team
  - Hackathon track

- [ ] **Problem Statement** (20 seconds)
  - Why TradeRadar is needed
  - Gap in current Aptos DeFi tools

- [ ] **Web Dashboard Demo** (60 seconds)
  - Navigate to TradeRadar page
  - Show market screener updating in real-time
  - Click on a token to view details
  - Display live price chart
  - Open trade modal and show trade flow
  - Demonstrate wallet connection

- [ ] **Telegram Bot Demo** (45 seconds)
  - Show bot commands: `/start`, `/help`
  - Use `/price BTC_USD` to get price
  - Show `/markets` for market overview
  - Demonstrate `/pools` for liquidity data
  - Show `/alerts` functionality

- [ ] **Technical Highlights** (30 seconds)
  - Merkle Trade integration
  - Hyperion CLMM analytics
  - Real-time data updates
  - Code snippets (optional)

- [ ] **Closing** (10 seconds)
  - Call to action
  - Links to GitHub and live demo
  - Thank you message

### Recording Tools

- **Screen Recording**: OBS Studio, QuickTime, Loom
- **Video Editing**: DaVinci Resolve (free), iMovie, Camtasia
- **Max Length**: 3 minutes recommended
- **Resolution**: 1080p (1920x1080)
- **Format**: MP4

### Upload Locations

- YouTube (unlisted or public)
- Loom
- DoraHacks platform directly

## 📝 DoraHacks Submission

### Required Materials

1. **Project Name**: Aptos TradeRadar
2. **Tagline**: Real-time DEX analytics & trading powered by Merkle Trade & Hyperion
3. **Track**: Trading & Market Infrastructure
4. **Description**: Use the README overview section
5. **Links**:
   - GitHub: https://github.com/yourusername/aptos-traderadar
   - Live Demo: https://traderadar.vercel.app/traderadar
   - Video: Your YouTube/Loom link
6. **Tech Stack**: Next.js, Aptos SDK, Merkle Trade SDK, Hyperion, Telegram
7. **Team Members**: List all contributors

### Submission Form Fields

```
Project Name: Aptos TradeRadar

One-liner: Real-time DeFi analytics combining Merkle Trade perps & Hyperion liquidity

Detailed Description:
TradeRadar is a comprehensive DeFi analytics and trading platform built on Aptos,
integrating Merkle Trade's perpetual futures protocol and Hyperion's CLMM liquidity
pools. It provides traders with real-time market insights, liquidity analytics, and
one-click trading capabilities—accessible via web dashboard and Telegram bot.

Key features:
- Real-time market screener with live price feeds
- Hyperion CLMM pool analytics (TVL, APR, volume)
- Interactive price charts with Chart.js
- One-click leveraged trading on Merkle Trade
- Telegram bot for mobile access
- Smart liquidity alerts

The platform showcases composability by combining two major Aptos protocols,
demonstrating how different primitives can work together to create a superior
user experience.

GitHub Repository: https://github.com/yourusername/aptos-traderadar
Live Demo: https://traderadar.vercel.app/traderadar
Demo Video: https://youtu.be/your-video-id
```

## 🧪 Testing Before Submission

### Functional Testing

```bash
# Test web app locally
cd my-aptos-dapp
npm run dev
# Visit http://localhost:3000/traderadar
# Test all features:
# - Market screener loads
# - Clicking token shows chart
# - Trade modal opens
# - Wallet connection works

# Test bot locally
npm run bot
# In Telegram, send commands:
# /start
# /price BTC_USD
# /markets
# /pools
# /alerts
```

### Cross-Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Performance Testing

```bash
# Build and analyze bundle
npm run build

# Check bundle size
# Should be under 1MB for optimal loading
```

## 🔧 Troubleshooting

### Common Issues

**Issue**: "Module not found: @merkletrade/aptos-sdk"
```bash
# Solution: Install dependencies
npm install @merkletrade/aptos-sdk
```

**Issue**: Telegram bot not responding
```bash
# Check bot token in .env
# Verify bot is running: pm2 status
# Check logs: pm2 logs traderadar-bot
```

**Issue**: Wallet connection fails
```bash
# Ensure Petra/Martian wallet is installed
# Switch to Aptos Testnet in wallet settings
# Refresh page
```

**Issue**: Merkle API errors
```bash
# Merkle SDK may require testnet setup
# Verify network configuration in merkleClient.ts
# Check Aptos testnet status
```

## 📊 Post-Deployment Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in dashboard
2. Monitor:
   - Page load times
   - Error rates
   - User traffic

### Bot Monitoring (if using PM2)

```bash
# Check bot status
pm2 status

# View logs
pm2 logs traderadar-bot

# Restart bot
pm2 restart traderadar-bot
```

## 🎯 Hackathon Judging Criteria Alignment

### Technical Excellence
- ✅ Clean, modular code structure
- ✅ Proper TypeScript typing
- ✅ Error handling throughout
- ✅ Responsive UI design

### Innovation
- ✅ First platform combining Merkle + Hyperion
- ✅ Telegram bot for mobile accessibility
- ✅ Smart liquidity alerts

### Composability
- ✅ Demonstrates protocol integration
- ✅ Unified data from multiple sources
- ✅ Cross-platform (web + Telegram)

### User Experience
- ✅ Intuitive interface
- ✅ Real-time updates
- ✅ One-click trading

### Impact
- ✅ Addresses real trader needs
- ✅ Potential for mainnet deployment
- ✅ Scalable architecture

## 🚀 Next Steps After Hackathon

1. Gather user feedback
2. Implement WebSocket for real prices
3. Add more DEX integrations
4. Deploy to mainnet
5. Launch marketing campaign
6. Apply for Aptos grants
7. Build community

---

**Good luck with your submission! 🏆**

For questions or support, refer to the main README or contact the team.
