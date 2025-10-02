Deep Explanation of Each File in the Aptos TradeRadar Project Structure
Below, I’ll provide a detailed explanation of every file and folder in the proposed project structure for Aptos TradeRadar. This is a React-based web app (using Vite for fast development) with TypeScript, integrating Merkle Trade’s SDK for perpetual futures data, Hyperion’s liquidity pool queries via Aptos SDK, and a Telegram bot for mobile alerts. The explanations cover:
	•	Purpose: What the file does and why it’s included.
	•	Key Contents: High-level code structure, dependencies, and logic.
	•	Integration: How it connects to other parts of the project and the Aptos ecosystem.
	•	Rationale for Hackathon: Why it’s designed this way for speed, composability, and the CTRL+MOVE Hackathon (e.g., focusing on Trading & Market Infrastructure track, Merkle/Hyperion composability, and deadline feasibility).
	•	Estimated LOC & Complexity: Rough size and ease of AI-assisted coding.
The structure is modular for rapid iteration—separate concerns like UI, data fetching, and utils to make debugging easier. Folders are explained first, then files within them.
Root Folder: `aptos-traderadar/`
	•	Purpose: The top-level directory containing the entire project. It serves as the Git repo root for DoraHacks submission.
	•	Key Contents: All subfolders and root files. No code here—just organization.
	•	Integration: Acts as the entry point for building (npm run build) and running (npm run dev).
	•	Rationale for Hackathon: Keeps everything self-contained for easy judging and deployment (e.g., to Vercel/Netlify for demo).
	•	Estimated LOC & Complexity: N/A (organizational).
Folder: `/public/`
	•	Purpose: Holds static assets that don’t need bundling or processing by Vite/React. These are served directly by the web server.
	•	Key Contents: Includes files like HTML templates and images, optimized for fast loading.
	•	Integration: Referenced in React components (e.g., ).
	•	Rationale for Hackathon: Ensures branding (Aptos/Merkle logos) without bloating the bundle, keeping the app lightweight for mobile demos.
	•	Estimated LOC & Complexity: Minimal; static files only.
	◦	File: index.html
	▪	Purpose: The main HTML entry point for the React app. Vite injects the bundled JavaScript here at build time.
	▪	Key Contents: Basic HTML structure with (meta tags for SEO, viewport for mobile responsiveness, title like “Aptos TradeRadar”), with a   for React mounting, and script tags for Vite. Includes favicon link and any base CSS resets.
	▪	Integration: React’s index.tsx renders into #root. It loads static assets from /public/assets/.
	▪	Rationale for Hackathon: Custom meta tags highlight the project’s Aptos focus (e.g., description: “Real-time DEX analytics with Merkle Trade and Hyperion on Aptos”). Ensures PWA-like feel for Telegram Mini App compatibility.
	▪	Estimated LOC & Complexity: ~20 LOC; low—mostly boilerplate.
	◦	Subfolder: assets/
	▪	Purpose: Stores non-code assets like images or fonts, keeping them separate from source code.
	▪	Key Contents: Images, SVGs, or CSS files not processed by Tailwind.
	▪	Integration: Imported via relative paths in components (e.g., in Dashboard.tsx for logos).
	▪	Rationale for Hackathon: Quick branding; e.g., include Merkle/Hyperion icons for demo polish.
	▪	Estimated LOC & Complexity: N/A; asset storage.
	▪	File: aptos-logo.png
	▪	Purpose: A sample image asset for UI branding, like displaying the Aptos logo in the header.
	▪	Key Contents: Binary image file (PNG for transparency). Source: Download from Aptos official site or generate via AI.
	▪	Integration: Used in Dashboard.tsx or App.tsx as .
	▪	Rationale for Hackathon: Visual tie-in to Aptos ecosystem; judges see immediate relevance. Replace with Merkle/Hyperion logos if needed.
	▪	Estimated LOC & Complexity: N/A; binary file.
Folder: `/src/`
	•	Purpose: Contains all source code for the React app, following standard React patterns (components, hooks, utils).
	•	Key Contents: TypeScript files for UI, logic, and data handling.
	•	Integration: Entry point is index.tsx, which bootstraps the app.
	•	Rationale for Hackathon: Modular for quick additions (e.g., more integrations); uses hooks for efficient data fetching to showcase Aptos’ low-latency.
	•	Estimated LOC & Complexity: ~250 LOC total; medium—core dev focus.
	◦	Subfolder: /components/
	▪	Purpose: Reusable UI elements built with React and TailwindCSS for styling. Keeps UI logic separate from data fetching.
	▪	Key Contents: Functional components with props for data injection.
	▪	Integration: Imported into App.tsx or Dashboard.tsx.
	▪	Rationale for Hackathon: Composable UI mirrors Aptos’ composable primitives; easy to demo features like charts.
	▪	Estimated LOC & Complexity: ~100 LOC across files; medium—UI-focused.
	▪	File: Dashboard.tsx
	▪	Purpose: The central UI component, acting as the “home page” that orchestrates the screener, chart, and trade features.
	▪	Key Contents: Imports TokenScreener.tsx, PriceChart.tsx, and TradeModal.tsx. Uses hooks like useMerkle.ts and useHyperion.ts to fetch data. Renders a layout with header (logos, title), main content (table + chart), and footer (e.g., Aptos testnet status). Handles state for selected tokens/pairs.
	▪	Integration: Props pass data from hooks; e.g., . Triggers TradeModal on button click.
	▪	Rationale for Hackathon: Showcases full integration—Merkle perps + Hyperion liquidity in one view. Judges can interact with real-time data.
	▪	Estimated LOC & Complexity: ~40 LOC; medium—composition hub.
	▪	File: TokenScreener.tsx
	▪	Purpose: A table-based token explorer, similar to DEXScreener, displaying aggregated data from Merkle and Hyperion.
	▪	Key Contents: Uses libraries like shadcn/ui or MUI for table. Columns: symbol (e.g., “BTC_USD”), price (from Merkle), volume, TVL/APR (from Hyperion). Includes sorting (e.g., by TVL descending) and filtering (e.g., min volume $100K). Props: data: Array from types.ts.
	▪	Integration: Data from useMerkle (pairs) and useHyperion (pools), formatted via formatData.ts. Click rows to open TradeModal.
	▪	Rationale for Hackathon: Core feature for “analytics dashboard”—highlights composability (e.g., Hyperion TVL informing Merkle trades).
	▪	Estimated LOC & Complexity: ~30 LOC; medium—table logic.
	▪	File: PriceChart.tsx
	▪	Purpose: Visualizes live price data, emphasizing real-time Aptos performance.
	▪	Key Contents: Integrates chart.js and react-chartjs-2. Props: prices: number[] from useLivePrices.ts. Configures line chart with options for zoom, themes (dark mode), and labels (e.g., “BTC/USD Price”). Handles updates via useEffect for smooth rerenders.
	▪	Integration: Subscribes to Merkle WS via hook; combines with Hyperion data for overlays (e.g., liquidity spikes).
	▪	Rationale for Hackathon: Demonstrates sub-second updates via Aptos/Merkle; eye-catching for demo video.
	▪	Estimated LOC & Complexity: ~20 LOC; low—chart config.
	▪	File: TradeModal.tsx
	▪	Purpose: A popup for executing trades, showcasing Merkle SDK’s order placement.
	▪	Key Contents: Uses shadcn/ui for modal. Form inputs: pair (dropdown from Merkle pairs), size/collateral (numbers), long/short toggle. On submit, calls merkle.payloads.placeMarketOrder from merkleClient.ts, builds txn with Aptos SDK, signs/submits. Displays success hash or errors.
	▪	Integration: Triggered from TokenScreener or bot; uses aptosClient.ts for txn handling.
	▪	Rationale for Hackathon: Proves “one-click trades”—key for Best Tech prize, showing engineering with zero-gas UX.
	▪	Estimated LOC & Complexity: ~30 LOC; medium—form + SDK calls.
	◦	Subfolder: /hooks/
	▪	Purpose: Custom React hooks for data fetching and state management, following React best practices to keep components clean.
	▪	Key Contents: Use useState, useEffect for async ops; handle errors/loading states.
	▪	Integration: Exported for use in components; depend on /utils/ for clients.
	▪	Rationale for Hackathon: Efficient for real-time data; showcases SDK usage without bloating UI code.
	▪	Estimated LOC & Complexity: ~60 LOC; medium—async logic.
	▪	File: useMerkle.ts
	▪	Purpose: Fetches and manages Merkle Trade data like pairs and positions.
	▪	Key Contents: Initializes client from merkleClient.ts. useEffect fetches merkle.apis.getPairs() and getPositions(userAddress). Returns state with loading/error. Supports polling for updates.
	▪	Integration: Feeds TokenScreener and TradeModal; combines with Hyperion for unified data.
	▪	Rationale for Hackathon: Central to perps infra; handles testnet for safe demos.
	▪	Estimated LOC & Complexity: ~20 LOC; medium—API calls.
	▪	File: useHyperion.ts
	▪	Purpose: Queries Hyperion liquidity pools for reserves, TVL, etc.
	▪	Key Contents: Uses aptos.view() from aptosClient.ts for pool-specific functions (e.g., get_reserves). Calculates TVL (reserveX * priceX + reserveY * priceY). Hardcodes key pools like USDC/APT.
	▪	Integration: Merges with Merkle data in formatData.ts; enables liquidity-based alerts.
	▪	Rationale for Hackathon: Highlights CLMM composability; fills analytics gaps.
	▪	Estimated LOC & Complexity: ~20 LOC; medium—view functions.
	▪	File: useLivePrices.ts
	▪	Purpose: Handles real-time price subscriptions via Merkle WebSocket.
	▪	Key Contents: Creates MerkleWebsocketClient; subscribes to pairs (e.g., “BTC_USD”). Updates state array for chart (limits to last 50 points). Cleanup on unmount.
	▪	Integration: Powers PriceChart; could extend to bot alerts.
	▪	Rationale for Hackathon: Shows Aptos’ speed; essential for “live dashboard”.
	▪	Estimated LOC & Complexity: ~20 LOC; medium—WS handling.
	◦	Subfolder: /utils/
	▪	Purpose: Shared helper functions and client setups, reusable across hooks and bot.
	▪	Key Contents: Pure functions; no React-specific code.
	▪	Integration: Imported everywhere for consistency.
	▪	Rationale for Hackathon: Avoids duplication; easy to test.
	▪	Estimated LOC & Complexity: ~50 LOC; low—utilities.
	▪	File: aptosClient.ts
	▪	Purpose: Sets up and exports the Aptos SDK client.
	▪	Key Contents: const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET })); Handles env vars for mainnet switch.
	▪	Integration: Used in hooks for views/txns.
	▪	Rationale for Hackathon: Central config for testnet safety.
	▪	Estimated LOC & Complexity: ~10 LOC; low.
	▪	File: merkleClient.ts
	▪	Purpose: Initializes Merkle SDK.
	▪	Key Contents: const merkle = new MerkleClient(await MerkleClientConfig.testnet()); Exports for reuse.
	▪	Integration: Core for queries/WS in hooks.
	▪	Rationale for Hackathon: Abstracts SDK setup.
	▪	Estimated LOC & Complexity: ~10 LOC; low.
	▪	File: hyperionUtils.ts
	▪	Purpose: Helpers for Hyperion data processing.
	▪	Key Contents: Functions like calculateTVL(reserves, prices) using BigInt math; APR estimates from volume.
	▪	Integration: Called in useHyperion.ts.
	▪	Rationale for Hackathon: Accurate metrics for dashboard.
	▪	Estimated LOC & Complexity: ~15 LOC; low.
	▪	File: formatData.ts
	▪	Purpose: Normalizes data from SDKs into UI-friendly formats.
	▪	Key Contents: Merges Merkle/Hyperion into TokenData type; handles BigInt to string conversion.
	▪	Integration: Used in hooks before returning state.
	▪	Rationale for Hackathon: Ensures consistent display.
	▪	Estimated LOC & Complexity: ~15 LOC; low.
	◦	File: App.tsx
	▪	Purpose: The root React component, wrapping the app with providers (e.g., wallet context if added).
	▪	Key Contents: Renders ; adds global styles or routers if multi-page.
	▪	Integration: Mounted in index.tsx.
	▪	Rationale for Hackathon: Simple single-page app.
	▪	Estimated LOC & Complexity: ~20 LOC; low.
	◦	File: index.tsx
	▪	Purpose: Entry point; renders React app to DOM.
	▪	Key Contents: ReactDOM.createRoot(document.getElementById('root')!).render();
	▪	Integration: Links HTML to JS.
	▪	Rationale for Hackathon: Vite default; no changes needed.
	▪	Estimated LOC & Complexity: ~10 LOC; low.
	◦	File: types.ts
	▪	Purpose: Defines shared TypeScript interfaces for type safety.
	▪	Key Contents: interface TokenData { symbol: string; price: number; tvl: number; } etc., matching SDK responses.
	▪	Integration: Used in hooks/components.
	▪	Rationale for Hackathon: Prevents bugs in integrations.
	▪	Estimated LOC & Complexity: ~20 LOC; low.
Folder: `/bot/`
	•	Purpose: Separate directory for the Telegram bot, runnable as a standalone Node.js script.
	•	Key Contents: Non-React code for serverless/mobile integration.
	•	Integration: Shares /utils/ for SDK clients; bot commands mirror dashboard features.
	•	Rationale for Hackathon: Fits “Telegram trading bots” suggestion; mobile-first for mass adoption.
	•	Estimated LOC & Complexity: ~50 LOC; medium—bot logic.
	◦	File: bot.ts
	▪	Purpose: Core bot script handling commands and interactions.
	▪	Key Contents: Uses telegraf; commands like /price BTC_USD (fetches from Merkle), /trade BTC 100 (builds/submits txn). Integrates Hyperion for liquidity alerts.
	▪	Integration: Reuses merkleClient.ts and aptosClient.ts.
	▪	Rationale for Hackathon: Enables demo without browser.
	▪	Estimated LOC & Complexity: ~40 LOC; medium.
	◦	File: botConfig.ts
	▪	Purpose: Configures bot with env vars.
	▪	Key Contents: Exports TELEGRAM_TOKEN from .env.
	▪	Integration: Imported in bot.ts.
	▪	Rationale for Hackathon: Secure secrets.
	▪	Estimated LOC & Complexity: ~10 LOC; low.
Folder: `/contracts/`
	•	Purpose: Optional Move smart contracts for on-chain features (stretch goal).
	•	Key Contents: Move code and deployment scripts.
	•	Integration: Deployed via Aptos CLI; queried in hooks.
	•	Rationale for Hackathon: Shows advanced use of Aptos primitives if time allows.
	•	Estimated LOC & Complexity: ~50 LOC; high—optional.
	◦	File: oracle.move
	▪	Purpose: On-chain oracle aggregating Merkle/Hyperion data.
	▪	Key Contents: Move module with structs for prices/TVL; view functions like get_price(pair).
	▪	Integration: Queried via aptos.view in hooks.
	▪	Rationale for Hackathon: Boosts tech excellence.
	▪	Estimated LOC & Complexity: ~30 LOC; high.
	◦	File: deploy.ts
	▪	Purpose: Script to publish Move module.
	▪	Key Contents: Uses Aptos SDK to build/publish package.
	▪	Integration: Run via node deploy.ts.
	▪	Rationale for Hackathon: Automates deployment.
	▪	Estimated LOC & Complexity: ~20 LOC; medium.
Folder: `/tests/`
	•	Purpose: Unit tests for reliability.
	•	Key Contents: Jest tests.
	•	Integration: Run via npm test.
	•	Rationale for Hackathon: Shows engineering rigor.
	•	Estimated LOC & Complexity: ~40 LOC; medium.
	◦	File: merkle.test.ts
	▪	Purpose: Tests Merkle SDK calls.
	▪	Key Contents: Mocks client; asserts pair data.
	▪	Integration: Covers useMerkle.ts.
	▪	Rationale for Hackathon: Validates integrations.
	▪	Estimated LOC & Complexity: ~20 LOC; medium.
	◦	File: hyperion.test.ts
	▪	Purpose: Tests Hyperion queries.
	▪	Key Contents: Mocks views; checks TVL calc.
	▪	Integration: Covers useHyperion.ts.
	▪	Rationale for Hackathon: Ensures accuracy.
	▪	Estimated LOC & Complexity: ~20 LOC; medium.
Root Files
	•	File: package.json
	◦	Purpose: Manages dependencies, scripts, and metadata.
	◦	Key Contents: Deps like "@merkletrade/ts-sdk": "^latest"; scripts: "dev", "build", "test".
	◦	Integration: npm install bootstraps project.
	◦	Rationale for Hackathon: Easy setup for judges.
	◦	Estimated LOC & Complexity: ~30 LOC; low.
	•	File: tsconfig.json
	◦	Purpose: Configures TypeScript compiler.
	◦	Key Contents: Strict mode, JSX for React, paths for imports.
	◦	Integration: Ensures type safety.
	◦	Rationale for Hackathon: Bug-free code.
	◦	Estimated LOC & Complexity: ~20 LOC; low.
	•	File: .env
	◦	Purpose: Stores secrets like API keys.
	◦	Key Contents: TELEGRAM_TOKEN=..., APTOS_NODE_URL=....
	◦	Integration: Loaded via process.env.
	◦	Rationale for Hackathon: Secure; gitignore it.
	◦	Estimated LOC & Complexity: ~5 LOC; low.
	•	File: vite.config.ts
	◦	Purpose: Customizes Vite build/dev server.
	◦	Key Contents: Plugins for React/Tailwind; base URL for deployment.
	◦	Integration: Optimizes bundling.
	◦	Rationale for Hackathon: Fast dev cycles.
	◦	Estimated LOC & Complexity: ~15 LOC; low.
	•	File: README.md
	◦	Purpose: Documents project for DoraHacks.
	◦	Key Contents: Overview, setup (npm i && npm run dev), features, integrations.
	◦	Integration: Links to demo.mp4.
	◦	Rationale for Hackathon: Required for submission.
	◦	Estimated LOC & Complexity: ~50 LOC; low.
	•	File: demo.mp4
	◦	Purpose: Video demo of app/bot.
	◦	Key Contents: 2-3 min screen recording (e.g., dashboard refresh, trade execution).
	◦	Integration: Upload to DoraHacks.
	◦	Rationale for Hackathon: Visual proof of functionality.
	◦	Estimated LOC & Complexity: N/A; media file.
This covers everything—modular, deadline-ready, and Aptos-optimized. If you need code for a specific file, let me know! 🚀