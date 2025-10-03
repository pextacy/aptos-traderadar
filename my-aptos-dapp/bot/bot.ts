#!/usr/bin/env tsx

/**
 * TradeRadar Telegram Bot
 * Provides real-time market data and trading capabilities via Telegram
 * For CTRL+MOVE Hackathon - Mobile-first trading experience
 */

import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { getMerklePairs, getMerkleMarketData, buildTradePayload } from '../src/lib/traderadar/merkleClient';
import { getAllHyperionPools, getHyperionPoolData } from '../src/lib/traderadar/hyperionUtils';
import { getAptosClient } from '../src/lib/traderadar/hyperionUtils';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  console.log('Please create a .env file with: TELEGRAM_BOT_TOKEN=your_token_here');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// User session storage (in production, use a database)
const userSessions: Map<number, { watchlist: string[] }> = new Map();

function getUserSession(userId: number) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, { watchlist: [] });
  }
  return userSessions.get(userId)!;
}

// Start command
bot.command('start', (ctx: Context) => {
  ctx.reply(
    `🚀 *Welcome to TradeRadar Bot!*\n\n` +
    `Your mobile gateway to Aptos DeFi powered by Merkle Trade & Hyperion.\n\n` +
    `*Available Commands:*\n` +
    `/price <symbol> - Get current price (e.g., /price BTC_USD)\n` +
    `/markets - View all available markets\n` +
    `/pools - Check Hyperion liquidity pools\n` +
    `/watch <symbol> - Add to watchlist\n` +
    `/watchlist - View your watchlist\n` +
    `/alerts - Get liquidity alerts\n` +
    `/help - Show this message\n\n` +
    `_Built for CTRL+MOVE Hackathon 🏆_`,
    { parse_mode: 'Markdown' }
  );
});

// Help command
bot.command('help', (ctx: Context) => {
  ctx.reply(
    `📚 *TradeRadar Bot Commands*\n\n` +
    `*Market Data:*\n` +
    `/price <symbol> - Get live price data\n` +
    `/markets - Browse all markets\n` +
    `/pools - View liquidity pools\n\n` +
    `*Watchlist:*\n` +
    `/watch <symbol> - Add to watchlist\n` +
    `/watchlist - View watchlist\n` +
    `/unwatch <symbol> - Remove from watchlist\n\n` +
    `*Alerts:*\n` +
    `/alerts - Get liquidity & APR alerts\n\n` +
    `*Examples:*\n` +
    `\`/price BTC_USD\`\n` +
    `\`/watch ETH_USD\`\n` +
    `\`/pools\``,
    { parse_mode: 'Markdown' }
  );
});

// Price command
bot.command('price', async (ctx: Context) => {
  const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1) : [];

  if (args.length === 0) {
    return ctx.reply('❌ Please specify a symbol. Example: /price BTC_USD');
  }

  const symbol = args[0].toUpperCase();

  try {
    await ctx.reply('🔍 Fetching price data...');

    const marketData = await getMerkleMarketData(symbol);

    if (!marketData) {
      return ctx.reply(`❌ Market not found: ${symbol}\nTry /markets to see available markets.`);
    }

    const price = parseFloat(marketData.markPrice || marketData.indexPrice || '0');
    const change24h = parseFloat(marketData.priceChange24h || '0');
    const volume24h = parseFloat(marketData.volume24h || '0');
    const fundingRate = parseFloat(marketData.fundingRate || '0');

    const changeEmoji = change24h >= 0 ? '📈' : '📉';
    const changeSign = change24h >= 0 ? '+' : '';

    ctx.reply(
      `💰 *${symbol}*\n\n` +
      `Price: *$${price.toFixed(2)}*\n` +
      `24h Change: ${changeEmoji} ${changeSign}${change24h.toFixed(2)}%\n` +
      `24h Volume: $${(volume24h / 1e6).toFixed(2)}M\n` +
      `Funding Rate: ${(fundingRate * 100).toFixed(3)}%\n\n` +
      `_Source: Merkle Trade on Aptos_`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Price command error:', error);
    ctx.reply(`❌ Error fetching price for ${symbol}. Please try again.`);
  }
});

// Markets command
bot.command('markets', async (ctx: Context) => {
  try {
    await ctx.reply('📊 Loading markets...');

    const pairs = await getMerklePairs();

    if (!pairs || pairs.length === 0) {
      return ctx.reply('❌ No markets available at the moment.');
    }

    const topPairs = pairs.slice(0, 10);
    let message = '📊 *Top Markets on Merkle Trade*\n\n';

    topPairs.forEach((pair: any, idx: number) => {
      const symbol = pair.symbol || pair.name;
      const price = parseFloat(pair.markPrice || pair.indexPrice || '0');
      const change24h = parseFloat(pair.priceChange24h || '0');
      const changeEmoji = change24h >= 0 ? '📈' : '📉';

      message += `${idx + 1}. *${symbol}*\n`;
      message += `   $${price.toFixed(2)} ${changeEmoji} ${change24h.toFixed(2)}%\n\n`;
    });

    message += `_Use /price <symbol> for details_`;

    ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Markets command error:', error);
    ctx.reply('❌ Error loading markets. Please try again.');
  }
});

// Pools command
bot.command('pools', async (ctx: Context) => {
  try {
    await ctx.reply('💧 Loading liquidity pools...');

    const pools = await getAllHyperionPools();

    if (!pools || pools.length === 0) {
      return ctx.reply('❌ No pools available at the moment.');
    }

    let message = '💧 *Hyperion Liquidity Pools*\n\n';

    pools.forEach((pool, idx) => {
      const symbol = `${pool.token0}/${pool.token1}`;
      message += `${idx + 1}. *${symbol}*\n`;
      message += `   TVL: $${(pool.tvl / 1e6).toFixed(2)}M\n`;
      message += `   APR: ${pool.apr.toFixed(2)}%\n`;
      message += `   24h Vol: $${(pool.volume24h / 1e6).toFixed(2)}M\n\n`;
    });

    message += `_Data from Hyperion CLMM on Aptos_`;

    ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Pools command error:', error);
    ctx.reply('❌ Error loading pools. Please try again.');
  }
});

// Watch command
bot.command('watch', (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1) : [];

  if (args.length === 0) {
    return ctx.reply('❌ Please specify a symbol. Example: /watch BTC_USD');
  }

  const symbol = args[0].toUpperCase();
  const session = getUserSession(userId);

  if (session.watchlist.includes(symbol)) {
    return ctx.reply(`👀 ${symbol} is already in your watchlist.`);
  }

  session.watchlist.push(symbol);
  ctx.reply(`✅ Added ${symbol} to your watchlist!\nUse /watchlist to view all.`);
});

// Watchlist command
bot.command('watchlist', (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const session = getUserSession(userId);

  if (session.watchlist.length === 0) {
    return ctx.reply('📝 Your watchlist is empty.\nAdd symbols with /watch <symbol>');
  }

  let message = '👀 *Your Watchlist*\n\n';
  session.watchlist.forEach((symbol, idx) => {
    message += `${idx + 1}. ${symbol}\n`;
  });
  message += `\n_Use /price <symbol> to check prices_`;

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// Unwatch command
bot.command('unwatch', (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1) : [];

  if (args.length === 0) {
    return ctx.reply('❌ Please specify a symbol. Example: /unwatch BTC_USD');
  }

  const symbol = args[0].toUpperCase();
  const session = getUserSession(userId);

  const index = session.watchlist.indexOf(symbol);
  if (index === -1) {
    return ctx.reply(`❌ ${symbol} is not in your watchlist.`);
  }

  session.watchlist.splice(index, 1);
  ctx.reply(`✅ Removed ${symbol} from your watchlist.`);
});

// Alerts command
bot.command('alerts', async (ctx: Context) => {
  try {
    await ctx.reply('🔔 Checking for alerts...');

    const pools = await getAllHyperionPools();

    const alerts: string[] = [];

    pools.forEach(pool => {
      const symbol = `${pool.token0}/${pool.token1}`;

      // High APR alert
      if (pool.apr > 100) {
        alerts.push(`🔥 ${symbol}: High APR ${pool.apr.toFixed(2)}%`);
      }

      // Low liquidity alert
      if (pool.tvl < 100000) {
        alerts.push(`⚠️ ${symbol}: Low TVL $${(pool.tvl / 1e3).toFixed(0)}K`);
      }
    });

    if (alerts.length === 0) {
      return ctx.reply('✅ No alerts at the moment. Markets look stable!');
    }

    let message = '🔔 *Liquidity Alerts*\n\n';
    alerts.forEach(alert => {
      message += `${alert}\n`;
    });

    ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Alerts command error:', error);
    ctx.reply('❌ Error checking alerts. Please try again.');
  }
});

// Error handling
bot.catch((err: any, ctx: Context) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An unexpected error occurred. Please try again later.');
});

// Start bot
console.log('🤖 Starting TradeRadar Telegram Bot...');
bot.launch()
  .then(() => {
    console.log('✅ Bot is running! Press Ctrl+C to stop.');
    console.log('💡 Send /start to your bot to begin.');
  })
  .catch((error) => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stop('SIGTERM');
});
