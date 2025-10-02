Aptos TradeRadar, tailored for the CTRL+MOVE Hackathon submission on DoraHacks by the October 3, 2025, 11:59 PM UTC+3 deadline. It provides a clear overview of the project, setup instructions, features, and integrations with Merkle Trade and Hyperion, emphasizing the Trading & Market Infrastructure track. The content is structured for clarity, with enough technical detail to impress judges while being concise for quick setup and review. It also aligns with the hackathon’s focus on DeFi innovation on Aptos, showcasing composability and real-time analytics.
The README assumes your team is using AI-assisted coding (e.g., Cursor, Copilot) to implement the project, so it highlights the project’s feasibility and polish for the deadline. Estimated LOC: ~50-60 lines, keeping it digestible.

README.md
Aptos TradeRadar
Aptos TradeRadar is a real-time analytics dashboard and Telegram bot for decentralized trading on the Aptos blockchain, built for the CTRL+MOVE Hackathon. Inspired by DEXScreener, it aggregates data from Merkle Trade (perpetual futures with $26B+ lifetime volume) and Hyperion (CLMM DEX with $130M+ TVL) to provide traders with live token metrics, liquidity insights, and one-click trading. With Aptos’ sub-second finality and parallel execution, TradeRadar delivers a snappy, mobile-first experience, targeting mass adoption in high-remittance markets like India and Africa.
This project aligns with the Trading & Market Infrastructure track, showcasing composability with Aptos-native platforms and leveraging the Merkle Trade SDK and Aptos SDK for Hyperion pool queries. A Telegram bot enhances accessibility with price alerts and trade triggers, making DeFi intuitive for retail users.
Demo Video: demo.mp4 (2-3 min showcasing dashboard, bot, and trade execution)
Features
	•	Real-Time Dashboard: Displays token data (symbol, price, 24h volume, TVL) from Merkle Trade perps (e.g., BTC/USD) and Hyperion pools (e.g., USDC/APT).
	•	Live Price Charts: Chart.js-powered graphs with Merkle WebSocket updates for sub-second price feeds.
	•	One-Click Trading: Execute market orders on Merkle Trade (e.g., long BTC with $5 collateral) via a modal interface.
	•	Telegram Bot: Commands like /price BTC_USD and /trade BTC 100 for mobile-first access, leveraging zero-gas txns.
	•	Composability: Merges Merkle perp data with Hyperion liquidity (e.g., $10.47M TVL in USDC/APT) for unified analytics.
	•	Testnet-Ready: Built on Aptos testnet for safe, scalable demos.
Tech Stack
	•	Frontend: React (Vite), TypeScript, TailwindCSS, Chart.js, shadcn/ui
	•	Backend: Node.js, Telegraf (Telegram bot)
	•	Blockchain: Aptos SDK (@aptos-labs/ts-sdk), Merkle Trade SDK (@merkletrade/ts-sdk)
	•	Contracts: Optional Move module for on-chain data aggregation (stretch goal)
	•	Testing: Jest for unit tests
	•	Deployment: Vite for local dev; deployable to Vercel/Netlify
Setup Instructions
Prerequisites
	•	Node.js 18+
	•	Aptos CLI (npm install -g @aptos-labs/aptos-cli)
	•	Telegram account for bot token
	•	Git
Installation
	1	Clone the repository: git clone https://github.com/your-team/aptos-traderadar.git
	2	cd aptos-traderadar
	3	
	4	Install dependencies: npm install
	5	
	6	Set up environment variables:
	◦	Create a .env file in the root: VITE_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
	◦	TELEGRAM_TOKEN=your-telegram-bot-token
	◦	
	◦	Get a Telegram bot token from BotFather.
	7	Fund a testnet account:
	◦	Run aptos account create --network testnet to generate an address.
	◦	Fund it at aptoslabs.com/testnet-faucet.
Running the App
	1	Start the web app: npm run dev
	2	
	◦	Open http://localhost:5173 to view the dashboard.
	3	Run the Telegram bot: node bot/bot.ts
	4	
	◦	Interact via Telegram with /start, /price BTC_USD, or /trade BTC 100.
Testing
npm test
	•	Runs Jest tests for Merkle and Hyperion integrations.
Project Structure
aptos-traderadar/
├── /public/                    # Static assets (index.html, logos)
├── /src/                      # React app
│   ├── /components/           # UI: Dashboard, TokenScreener, PriceChart, TradeModal
│   ├── /hooks/                # Data: useMerkle, useHyperion, useLivePrices
│   ├── /utils/                # Clients: aptosClient, merkleClient, hyperionUtils
├── /bot/                      # Telegram bot (bot.ts, botConfig.ts)
├── /contracts/                # Optional Move oracle (oracle.move)
├── /tests/                    # Jest tests for SDKs
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables
├── vite.config.ts             # Vite config
├── README.md                  # This file
└── demo.mp4                   # Demo video
Integrations
	•	Merkle Trade: Uses @merkletrade/ts-sdk for perp data (pairs, positions) and WebSocket for live prices. Supports market orders with zero-gas txns.
	•	Hyperion: Queries USDC/APT pool (address: 0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8) via @aptos-labs/ts-sdk for reserves/TVL.
	•	Aptos: Leverages parallel execution for sub-second updates; testnet for safe demos.
Hackathon Context
	•	Track: Trading & Market Infrastructure
	•	Why It Wins:
	◦	Composability: Merges Merkle perps ($26B volume) with Hyperion liquidity ($130M TVL) for unified analytics.
	◦	Impact: Fills gaps in Aptos analytics (e.g., DEXScreener lacks perps focus). Targets $800B+ remittance markets with mobile UX.
	◦	Technical Excellence: Real-time WebSocket, zero-gas trades, and CLMM queries showcase Aptos’ speed and scalability.
	◦	Feasibility: ~300 LOC, built with AI-assisted coding (e.g., Cursor) for rapid delivery in <27 hours.
	•	Prizes Targeted: Main Track 1st ($30K), Best Tech Implementation ($15K), Top University Team ($7K if applicable).
Future Roadmap
	•	Add fiat on/off-ramps via Circle CCTP.
	•	Integrate RWAs (e.g., Libre’s tokenized bonds) for asset tracking.
	•	Deploy on-chain oracle for persistent data.
	•	Expand bot with social trading features (e.g., X sentiment analysis).
Team
	•	[Your Team Name]
	•	Contact: [Your Discord handle or email]
	•	Built for CTRL+MOVE Hackathon, Aptos ecosystem
Resources
	•	Merkle Trade Docs
	•	Aptos SDK Docs
	•	Hyperion Pool Data
	•	CTRL+MOVE Hackathon

Notes for AI-Assisted Coding
	•	Prompts: Use specific prompts like “Generate a README.md for a React-based Aptos hackathon project with Merkle Trade and Hyperion integrations, including setup, features, and DoraHacks submission details.”
	•	Polish: Ensure markdown is clean (e.g., headers, lists, code blocks). Add links to demo.mp4 (placeholder or upload to Google Drive).
	•	Customization: Replace placeholders (team name, contact) with your details. AI can refine prose for clarity.
Hackathon Submission Tips
	•	DoraHacks: Upload this README, code, and demo.mp4 to dorahacks.io/hackathon/aptos-ctrlmove-hackathon/detail.
	•	Demo Video: Record 2-3 min showing: dashboard (table/chart), bot commands (/price, /trade), and a Merkle trade execution.
	•	Deadline: Submit by Oct 3, 11:59 PM UTC+3 (check DoraHacks for exact time zone).
	•	Support: Join CTRL+MOVE Discord or Merkle Telegram (@merkle_trade_dev) for last-minute help.
This README is concise yet detailed, highlighting your project’s strengths. If you need tweaks (e.g., add team bio, specific feature callouts), let me know, and I can refine it or generate another file! 🚀