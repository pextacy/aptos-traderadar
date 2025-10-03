#!/bin/bash

# TradeRadar Setup Script
# Automates installation and verification for CTRL+MOVE Hackathon

set -e

echo "🚀 TradeRadar Setup Script"
echo "=========================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    echo "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
echo "  Node.js $(node -v) ✓"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "  Dependencies installed ✓"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "  .env file created ✓"
    echo "  ⚠️  Remember to add your TELEGRAM_BOT_TOKEN to .env"
else
    echo "✓ .env file already exists"
fi
echo ""

# Verify key dependencies
echo "🔍 Verifying key packages..."

check_package() {
    if npm list "$1" &>/dev/null; then
        echo "  ✓ $1"
    else
        echo "  ❌ $1 not found"
        exit 1
    fi
}

check_package "@merkletrade/aptos-sdk"
check_package "@aptos-labs/ts-sdk"
check_package "chart.js"
check_package "react-chartjs-2"
check_package "telegraf"
check_package "next"

echo ""

# Check directory structure
echo "📁 Verifying project structure..."
REQUIRED_DIRS=(
    "src/lib/traderadar"
    "src/lib/traderadar/hooks"
    "src/components/traderadar"
    "src/app/traderadar"
    "bot"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir"
    else
        echo "  ❌ $dir not found"
        exit 1
    fi
done

echo ""

# Check key files
echo "📄 Verifying key files..."
REQUIRED_FILES=(
    "src/lib/traderadar/types.ts"
    "src/lib/traderadar/merkleClient.ts"
    "src/lib/traderadar/hyperionUtils.ts"
    "src/lib/traderadar/hooks/useMerkleData.ts"
    "src/lib/traderadar/hooks/useHyperionPools.ts"
    "src/lib/traderadar/hooks/useLivePrices.ts"
    "src/components/traderadar/TokenScreener.tsx"
    "src/components/traderadar/PriceChart.tsx"
    "src/components/traderadar/TradeModal.tsx"
    "src/app/traderadar/page.tsx"
    "bot/bot.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file not found"
        exit 1
    fi
done

echo ""

# Success message
echo "✅ Setup Complete!"
echo ""
echo "🎯 Next Steps:"
echo "   1. Start the dev server:  npm run dev"
echo "   2. Open browser:          http://localhost:3000/traderadar"
echo "   3. (Optional) Run bot:    npm run bot"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start:     ../QUICK_START.md"
echo "   - Full README:     ../TRADERADAR_README.md"
echo "   - Deployment:      ../DEPLOYMENT_GUIDE.md"
echo ""
echo "🏆 Ready for CTRL+MOVE Hackathon!"
echo ""
