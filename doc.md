Deep and Detailed Explanation of Each File and Folder in the Aptos TradeRadar Project
Below is a deep and detailed explanation of every folder and file in the provided project structure for Aptos TradeRadar (also referred to as my-aptos-dapp). This is a full-stack decentralized application (DApp) built for the CTRL+MOVE Hackathon on the Aptos blockchain, focusing on real-time DeFi analytics with integrations for Merkle Trade (perpetual futures trading) and Hyperion (liquidity pools). The project includes a Next.js frontend for the web dashboard, a Telegram bot for mobile access, Move smart contracts for on-chain logic, and a Rust-based indexer for processing blockchain events to enable real-time analytics.
The structure is complex, combining frontend (Next.js with React and TailwindCSS), backend (Rust indexer with Diesel ORM for PostgreSQL), blockchain (Move contracts), and bot (Node.js with Telegraf). Explanations include:
	•	Purpose: What the file/folder does and why it’s included.
	•	Key Contents: Detailed description of code, logic, dependencies, and examples.
	•	Integration: How it connects to other parts of the project and Aptos ecosystem (e.g., testnet addresses, SDKs).
	•	Rationale for Hackathon: Why it’s designed this way for the Trading & Market Infrastructure track, composability, and deadline feasibility (even though the deadline has passed as per the current date, October 04, 2025, this can serve for post-submission or similar projects).
	•	Libraries and Addresses: Specific libraries (with versions if typical), Aptos addresses (e.g., Hyperion pool), and tips for AI coding (e.g., prompts for Cursor/Copilot).
	•	Estimated LOC & Complexity: Rough lines of code and difficulty (low: basic; medium: logic-heavy; high: async/on-chain).
Explanations are organized hierarchically by folder structure for clarity. The total project is estimated at ~1,500-2,000 LOC, feasible with AI-assisted coding for a hackathon MVP.

Root Folder: `aptos-traderadar/` (or `my-aptos-dapp/`)
	•	Purpose: The top-level directory serving as the Git repository root. It organizes the entire DApp, allowing easy cloning, building, and submission to DoraHacks. This folder encapsulates a monorepo-style setup for frontend, backend, bot, and contracts, enabling seamless development and deployment (e.g., via Docker for the indexer).
	•	Key Contents: Contains subfolders like logs/, bot/, contract/, indexer/, public/, src/, and root configs (package.json, Cargo.toml). No direct code here, but it manages build scripts (e.g., npm run dev for Next.js, cargo run for indexer).
	•	Integration: Acts as the entry point for CI/CD; frontend (src/) pulls data from indexer (indexer/) via database queries, bot (bot/) shares SDKs with frontend, and contracts (contract/) are deployed and queried by both.
	•	Rationale for Hackathon: A monorepo simplifies collaboration and judging; supports composability by linking Merkle/Hyperion data to on-chain events indexed in real-time, aligning with Aptos’ vision for scalable DeFi tools. Post-deadline, it allows easy iteration for production.
	•	Libraries and Addresses: None directly; uses NPM for JS deps, Cargo for Rust. AI Coding Prompt: “Generate a monorepo structure for an Aptos DApp with Next.js frontend, Rust indexer, and Move contracts, including root package.json with scripts for dev, build, and test.”
	•	Estimated LOC & Complexity: N/A (organizational); low complexity as it’s structural.
Folder: `logs/`
	•	Purpose: A dedicated directory for storing runtime logs from various components, such as indexer errors, bot interactions, or frontend console outputs. This helps in debugging on-chain events, API calls, or user actions without cluttering the console, making it essential for maintaining a production-like setup even in a hackathon prototype.
	•	Key Contents: Dynamically generated files like indexer.log (from Rust’s main.rs using log crate), bot.log (from bot.ts using console.log or a logger like Winston), or frontend.log (if implemented). Logs include timestamps, levels (info/error), and details like transaction hashes or event payloads.
	•	Integration: The Rust indexer (main.rs) writes to indexer.log via the log crate; the Telegram bot (bot.ts) appends to bot.log; frontend components (e.g., Dashboard.tsx) could pipe errors here via a custom logger. This folder is ignored in .gitignore to avoid committing sensitive data.
	•	Rationale for Hackathon: Logs are crucial for verifying integrations (e.g., Merkle trade executions or Hyperion queries) during demo videos or judge reviews. It demonstrates engineering maturity by handling errors gracefully, especially for real-time features where sub-second Aptos transactions could fail due to network issues.
	•	Libraries and Addresses: Rust: log crate (version ~0.4); Node.js: built-in fs for appending logs. No addresses. AI Coding Prompt: “Create a logging utility in Rust using the log crate to write timestamped entries to logs/indexer.log, including error handling for Aptos SDK calls.”
	•	Estimated LOC & Complexity: N/A (generated files); low, as logging is simple but critical for debugging high-volume event processing.
Folder: `my-aptos-dapp/`
	•	Purpose: This appears to be the main subdirectory for the Aptos-specific backend and blockchain components, encapsulating the indexer, contracts, and bot. It separates blockchain-heavy logic from the frontend (src/), allowing independent development (e.g., run indexer separately). In a monorepo, this folder could be a workspace for Rust and Move tools.
	•	Key Contents: Subfolders like bot/, contract/, indexer/, with Rust code for event processing and Move for smart contracts. It handles the “heavy lifting” of indexing on-chain events from Aptos testnet, making data available for the frontend.
	•	Integration: The indexer (indexer/main.rs) processes events from contracts (trade_radar.move), storing in a PostgreSQL DB queried by frontend (db/getTrades.ts). The bot (bot/bot.ts) interacts with the same SDKs. Frontend pulls data via API or direct DB access.
	•	Rationale for Hackathon: This folder enables the project’s core innovation: real-time analytics from Merkle and Hyperion, processed on-chain and off-chain. It showcases Aptos’ strengths in parallel execution for event indexing, helping win Best Tech prize by demonstrating scalable infrastructure.
	•	Libraries and Addresses: Rust: diesel (ORM, ~2.0), aptos-sdk (latest); Move: Aptos stdlib. Testnet RPC: https://fullnode.testnet.aptoslabs.com/v1. AI Coding Prompt: “Set up a Rust workspace in my-aptos-dapp with Cargo.toml for an indexer using diesel and aptos-sdk, including a Move contract folder.”
	•	Estimated LOC & Complexity: ~800 LOC across subfolders; high, as it involves Rust async processing and Move security.
Subfolder: `bot/`
	•	Purpose: Houses the Telegram bot, providing a mobile-first interface for users to query prices, execute trades, and receive alerts. This folder isolates bot logic from the web app, allowing it to run as a standalone service (e.g., on a server or locally).
	•	Key Contents: Primarily bot.ts, with possible configs. The bot acts as a lightweight client, mirroring frontend features for accessibility.
	•	Integration: Shares SDKs from src/lib/ (e.g., merkleClient.ts) for Merkle queries and aptos.ts for txns. Logs to logs/bot.log. Frontend could link to the bot via URLs in RootHeader.tsx.
	•	Rationale for Hackathon: Addresses the hackathon’s emphasis on mobile-first UIs and Telegram bots for DeFi, targeting global users in regions with high Telegram usage. It complements the dashboard for mass adoption, showing composability with Aptos primitives.
	•	Libraries and Addresses: telegraf (~4.12 for Telegram API), @merkletrade/ts-sdk (latest for perps), @aptos-labs/ts-sdk (latest for txns). Bot token from .env. AI Coding Prompt: “Build a Telegram bot in Node.js using telegraf, integrating @merkletrade/ts-sdk for price queries and trade executions on Aptos testnet, with logging to logs/bot.log.”
	•	Estimated LOC & Complexity: ~50 LOC; medium, as it involves async API calls and error handling for txns.
	•	File: bot.ts
	◦	Purpose: The core script for the Telegram bot, handling commands like price checks, trade executions, and alerts. It provides a conversational interface, making DeFi accessible without a browser, e.g., /price BTC_USD fetches real-time data from Merkle, /trade BTC 100 submits a market order, and it could send push notifications for liquidity changes from Hyperion.
	◦	Key Contents: Initializes Telegraf with token from .env. Defines commands using bot.command(): for /price, use merkle.apis.getPairs() to fetch and reply with formatted price; for /trade, parse args, build payload with merkle.payloads.placeMarketOrder (e.g., sizeDelta: 300_000_000n for $300 USDC, isLong: true), sign/submit via aptos.signAndSubmitTransaction, and reply with txn hash. Handles errors (e.g., insufficient balance) with logs. Supports Hyperion queries, e.g., /liquidity USDC-APT using aptos.view on pool address. Uses async/await for non-blocking operations. Includes middleware for authentication (e.g., check Aptos account).
	◦	Integration: Imports merkleClient.ts for SDK, aptos.ts for client, and constants.ts for addresses. Outputs logs to logs/bot.log using fs.appendFileSync. Can integrate with indexer DB for alerts (e.g., poll getLastSuccessVersion.ts for new events).
	◦	Rationale for Hackathon: Enables “social trading apps” and “mobile-first UIs” from the hackathon prompt, demonstrating Aptos’ low fees for frequent bot interactions. It’s quick to build (hours with AI) and adds impact for prizes, showing real-world utility for remittance markets.
	◦	Libraries and Addresses: telegraf (for bot framework), @merkletrade/ts-sdk (for perps API), @aptos-labs/ts-sdk (for txns), fs (built-in for logging). Hyperion pool: 0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8. Merkle testnet config: MerkleClientConfig.testnet(). AI Coding Prompt: “Write a detailed Telegram bot script in TypeScript using telegraf, integrating @merkletrade/ts-sdk for /price and /trade commands on Aptos testnet, with async txn submission, error handling, and logging to logs/bot.log. Include Hyperion pool query for /liquidity.”
	◦	Estimated LOC & Complexity: ~40 LOC; medium, due to async txn logic and error handling for blockchain calls (e.g., wallet signatures, gas estimation).
Subfolder: `contract/`
	•	Purpose: Manages Move smart contracts for on-chain logic, such as an oracle for price/TVL storage or custom trade mechanics. This folder isolates blockchain code, allowing independent deployment and testing, essential for Aptos’ Move-based ecosystem.
	•	Key Contents: scripts/ for deployment, sources/ for Move code, tests/ for unit tests, and Move.toml for config. It complements Merkle/Hyperion by providing custom primitives if needed (e.g., aggregating data on-chain).
	•	Integration: Deployed via scripts/, queried by indexer (extractor.rs) to capture events, and called by frontend (entry-functions/) or bot.
	•	Rationale for Hackathon: Shows advanced use of Aptos Move for composable DeFi, e.g., custom vaults inspired by the prompt. It’s optional for MVP but elevates tech excellence, demonstrating parallel execution for efficient event emission.
	•	Libraries and Addresses: Aptos Move stdlib (0x1::coin, 0x1::aptos_coin). Deployed address TBD (use Aptos Explorer for verification). AI Coding Prompt: “Create a Move contract folder structure with Move.toml, sources/trade_radar.move for a price oracle, scripts/deploy.ts in TypeScript using @aptos-labs/ts-sdk, and tests for unit testing.”
	•	Estimated LOC & Complexity: ~100 LOC; high, as Move requires careful resource management and security.
Subfolder: `contract/scripts/`
	•	Purpose: Contains scripts (TypeScript or shell) for deploying, upgrading, and interacting with Move contracts. This folder automates blockchain operations, making it easy to publish to testnet without manual CLI commands.
	•	Key Contents: Files like deploy.ts (TypeScript for SDK-based deployment) or shell scripts for Aptos CLI (aptos move publish --package-dir ../ --network testnet).
	•	Integration: Uses Move.toml for package config; calls sources/trade_radar.move; outputs deployed address for constants.ts.
	•	Rationale for Hackathon: Streamlines deployment for demo, allowing quick iterations. It supports the prompt’s “vault strategies” by enabling custom contract upgrades.
	•	Libraries and Addresses: @aptos-labs/ts-sdk for txn building. Testnet faucet for funding: https://aptoslabs.com/testnet-faucet. AI Coding Prompt: “Write a TypeScript deployment script using @aptos-labs/ts-sdk to publish a Move package from sources/trade_radar.move to Aptos testnet, with error handling and logging.”
	•	Estimated LOC & Complexity: ~30 LOC; medium, involving txn signing and submission.
Subfolder: `contract/sources/`
	•	Purpose: Stores the source code for Move modules, the core of on-chain logic. This folder is where custom Aptos primitives are defined, e.g., for storing Merkle prices or Hyperion TVL on-chain to enable composable queries.
	•	Key Contents: Primarily trade_radar.move, with potential additional modules for structs or helpers.
	•	Integration: Compiled via aptos move compile; events emitted here are indexed by indexer/extractor.rs; view functions called by priceOracle.ts.
	•	Rationale for Hackathon: Enables “on-chain matching engines” and “analytics dashboards” from the prompt, using Move’s resource-oriented programming for safe DeFi.
	•	Libraries and Addresses: Move stdlib (e.g., 0x1::coin for token handling). No external deps. AI Coding Prompt: “Write a detailed Move module trade_radar.move for an oracle that stores Merkle prices and Hyperion TVL, with entry functions, view functions, and event emission for indexing.”
	•	Estimated LOC & Complexity: ~50 LOC; high, due to Move’s strict semantics (e.g., borrow checking, generics).
	•	File: trade_radar.move
	◦	Purpose: The primary Move module defining on-chain logic for TradeRadar, acting as an oracle to store and query aggregated data from Merkle and Hyperion. It could include structs for prices, pools, trades, and messages, with entry functions for updates and view functions for reads. This enables on-chain composability, e.g., other contracts can query TVL for lending protocols.
	◦	Key Contents: Starts with module trade_radar::oracle { ... }. Uses use 0x1::coin, use 0x1::event for events. Structs: Price { pair: vector, value: u64, timestamp: u64 }, PoolData { reserve_x: u128, reserve_y: u128, tvl: u128 }, Trade { pair: vector, size: u128, collateral: u128, is_long: bool }, Message { content: vector, sender: address }. Entry functions: store_price(account: &signer, pair: vector, value: u64) (stores and emits event), add_liquidity(account: &signer, reserve_x: u128, reserve_y: u128) (updates pool, calculates TVL). View functions: #[view] public fun get_price(pair: vector): u64 { ... }, get_tvl(pool_id: vector): u128. Events: event StorePriceEvent { pair: vector, value: u64 } for indexing. Handles errors with abort (e.g., invalid sender). Supports generics for tokens (e.g., typeArguments: ["0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC"]).
	◦	Integration: Deployed address used in constants.ts; events like StorePriceEvent extracted by indexer/storers/create_trade_event_storer.rs; queried by priceOracle.ts in frontend for dashboard updates; called from entry-functions/createTrade.ts for atomic operations.
	◦	Rationale for Hackathon: Directly addresses “on-chain matching engines” and “vault strategies” by providing custom primitives. It leverages Aptos’ parallel execution for efficient multi-update txns, and sub-second finality for real-time oracle updates, making the project stand out for scalability.
	◦	Libraries and Addresses: Aptos stdlib (0x1::coin, 0x1::aptos_coin::AptosCoin for token types). Hyperion-inspired pool ID: 0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8. Merkle pairs like “BTC_USD”. AI Coding Prompt: “Develop a comprehensive Move module trade_radar.move for an Aptos oracle, including structs for prices, pools, trades, messages; entry functions for storing/updating; view functions for querying; event emission for indexing; and error handling with abort codes. Use generics for tokens and integrate with stdlib coin module.”
	◦	Estimated LOC & Complexity: ~50 LOC; high, as it requires handling resources, generics, and events securely to avoid vulnerabilities like re-entrancy.
Subfolder: `contract/tests/`
	•	Purpose: Contains unit tests for Move contracts to ensure correctness and prevent bugs in on-chain logic. This folder is crucial for validating functions like price storage or TVL calculations before deployment.
	•	Key Contents: Test files using Aptos Move test framework, e.g., testing store_price for correct event emission or get_tvl for accurate calculations.
	•	Integration: Run via aptos move test --package-dir ../; tests simulate txns and assert states, integrating with trade_radar.move.
	•	Rationale for Hackathon: Demonstrates robust engineering; judges can verify contract safety, essential for DeFi projects involving funds.
	•	Libraries and Addresses: Aptos Move test utils (built-in). No external. AI Coding Prompt: “Write unit tests for trade_radar.move using Aptos Move test framework, covering entry and view functions, with assertions for events and state changes.”
	•	Estimated LOC & Complexity: ~30 LOC; medium, as tests mirror contract logic but add assertions.
	•	File: Move.toml
	◦	Purpose: The configuration file for the Move project, defining package metadata, dependencies, and named addresses. It tells the Aptos CLI how to compile, test, and publish the module.
	◦	Key Contents: [package] section with name = "trade_radar", version = "0.1.0", authors. [dependencies] for Aptos framework (AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "main" }). [addresses] for named addresses (e.g., trade_radar = "0x... " for deployment).
	◦	Integration: Used by aptos move compile, aptos move test, and scripts/ for publishing. Dependencies ensure stdlib access for coin and event modules.
	◦	Rationale for Hackathon: Required for any Move project; allows quick deployment to testnet, supporting the prompt’s “core DeFi protocols”.
	◦	Libraries and Addresses: Git rev for Aptos core (use “main” for latest). AI Coding Prompt: “Generate a Move.toml for a hackathon project named trade_radar, with dependencies on AptosFramework and named addresses for deployment.”
	◦	Estimated LOC & Complexity: ~10 LOC; low, as it’s config but critical for compilation.
Subfolder: `indexer/`
	•	Purpose: A Rust-based blockchain indexer to listen for on-chain events from Aptos (e.g., trade creations, message updates) and store them in a database for queryable analytics. This folder is the backend heart, enabling real-time data for the frontend and bot by processing transactions in batches.
	•	Key Contents: Rust code with Diesel for DB, aptos-sdk for node interaction, and storers for event-specific logic. It runs as a service, polling or subscribing to Aptos node for events.
	•	Integration: Events from trade_radar.move are extracted and stored; DB is queried by db/ in frontend. Dockerized for easy run.
	•	Rationale for Hackathon: Essential for “analytics dashboards” in the prompt; handles Aptos’ high TPS for scalable infra, showing innovation in data processing.
	•	Libraries and Addresses: diesel (2.0 for ORM), aptos-sdk (latest for client), tokio (1.0 for async), actix-web (4.0 for health check). Testnet RPC: https://fullnode.testnet.aptoslabs.com/v1. AI Coding Prompt: “Build a Rust indexer for Aptos events using diesel, aptos-sdk, and tokio, with storers for trade/message events, DB models, and a health check server.”
	•	Estimated LOC & Complexity: ~500 LOC; high, due to async event processing and DB migrations.
Subfolder: `indexer/.cargo/`
	•	Purpose: Rust configuration directory, generated by Cargo, containing build settings and local overrides. It ensures consistent builds across environments.
	•	Key Contents: config.toml with options like target directory or profile overrides.
	•	Integration: Used by cargo build to customize the indexer build.
	•	Rationale for Hackathon: Standard for Rust projects; prevents build issues during judging.
	•	Libraries and Addresses: None. AI Coding Prompt: “Generate a .cargo/config.toml for a Rust project with custom target dir and release profile for optimization.”
	•	Estimated LOC & Complexity: ~5 LOC; low.
Subfolder: `indexer/src/`
	•	Purpose: The source code for the Rust indexer, organizing modules for config, DB, processing, and utilities. This is where the core logic lives for fetching, extracting, and storing Aptos events.
	•	Key Contents: Submodules like config/, db_models/, steps/, with main.rs as entry.
	•	Integration: main.rs orchestrates everything, using aptos-sdk to fetch txns and diesel to store.
	•	Rationale for Hackathon: Modular design for easy extension (e.g., add more event types); supports real-time features.
	•	Libraries and Addresses: See subfiles. AI Coding Prompt: “Structure a Rust src/ folder for an Aptos indexer with modules for config, db_models, storers, and utils, using diesel and aptos-sdk.”
	•	Estimated LOC & Complexity: ~400 LOC; high.
Subfolder: `indexer/src/config/`
	•	Purpose: Handles indexer configuration, loading settings from YAML or env for flexibility (e.g., RPC URL, DB connection).
	•	Key Contents: Structs for configs, deserialized from example.config.yaml.
	•	Integration: Loaded in main.rs to initialize processor.rs.
	•	Rationale for Hackathon: Allows easy switch from testnet to mainnet post-hack.
	•	Libraries and Addresses: serde (1.0 for deserialization). AI Coding Prompt: “Create Rust config modules using serde to load YAML for Aptos RPC and DB URL.”
	•	Estimated LOC & Complexity: ~30 LOC; medium.
	•	File: indexer_processor_config.rs
	◦	Purpose: Defines the main indexer config struct, including RPC, DB, and polling intervals. This ensures the indexer can be tuned for performance, e.g., poll every 1 second for sub-second updates.
	◦	Key Contents: #[derive(Deserialize)] struct IndexerConfig { rpc_url: String, db_url: String, poll_interval_ms: u64, chain_id: u64 }. Defaults: poll_interval_ms = 1000. Validates URLs (e.g., regex for HTTP).
	◦	Integration: Used in main.rs to set up aptos-sdk client and Diesel pool.
	◦	Rationale for Hackathon: Customizable for Aptos’ fast finality; supports scalability for high-volume events.
	◦	Libraries and Addresses: serde. RPC: https://fullnode.testnet.aptoslabs.com/v1. AI Coding Prompt: “Write a Rust struct for indexer config with serde Deserialize, including Aptos RPC URL, DB URL, and validation.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: mod.rs
	◦	Purpose: The module export file, making submodules public for use in other parts of src/. This is Rust convention for folder-based modules.
	◦	Key Contents: pub mod indexer_processor_config; pub mod processor_config;.
	◦	Integration: Allows main.rs to use config::IndexerConfig;.
	◦	Rationale for Hackathon: Keeps code organized, reducing errors in large projects.
	◦	Libraries and Addresses: None. AI Coding Prompt: “Generate a mod.rs for a Rust config folder exporting indexer_processor_config and processor_config.”
	◦	Estimated LOC & Complexity: ~5 LOC; low.
	•	File: processor_config.rs
	◦	Purpose: Configures specific processor settings, such as event types to index (e.g., “trade_created”, “message_updated”) and batch size for efficient processing.
	◦	Key Contents: #[derive(Deserialize)] struct ProcessorConfig { event_types: Vec, batch_size: usize }. Defaults: batch_size = 100. Filters for Merkle/Hyperion events.
	◦	Integration: Used in processor.rs to filter aptos-sdk transaction streams.
	◦	Rationale for Hackathon: Optimizes for hackathon scope, focusing on key events for analytics.
	◦	Libraries and Addresses: serde. Event types based on trade_radar.move events.
	◦	AI Coding Prompt: “Create a Rust struct for processor config with serde, including event_types Vec for Aptos events and batch_size.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
Subfolder: `indexer/src/db_migrations/`
	•	Purpose: Manages database schema migrations using Diesel, ensuring the DB evolves with the indexer (e.g., add new tables for RWA integration post-hack).
	•	Key Contents: migrations/ with SQL files, diesel.toml for config, and schema.rs for Rust representation.
	•	Integration: Run via diesel migration run in main.rs startup; defines schema for db_models/.
	•	Rationale for Hackathon: Ensures DB is up-to-date for analytics queries, preventing runtime errors.
	•	Libraries and Addresses: diesel_migrations. AI Coding Prompt: “Set up Diesel migrations for a Rust project with postgres, including diesel.toml and schema.rs for tables like trades and messages.”
	•	Estimated LOC & Complexity: ~30 LOC; medium.
	•	**Subfolder: migrations/
	◦	Purpose: Stores timestamped SQL migration scripts for creating/altering tables (e.g., initial setup for trades table).
	◦	Key Contents: Folders like 2025-10-01-000000_create_trades/up.sql with CREATE TABLE trades (id SERIAL PRIMARY KEY, pair VARCHAR NOT NULL, size BIGINT NOT NULL);.
	◦	Integration: Applied sequentially by Diesel; maps to db_models/trade.rs.
	◦	Rationale for Hackathon: Allows incremental DB changes for feature additions.
	◦	Libraries and Addresses: None. AI Coding Prompt: “Generate Diesel migration SQL for a trades table with columns for pair, size, collateral, and timestamp.”
	◦	Estimated LOC & Complexity: ~20 LOC; medium.
	•	File: diesel.toml
	◦	Purpose: Configures Diesel for migrations, specifying DB type and schema file.
	◦	Key Contents: database_url = "postgres://user:pass@localhost/db", schema = "schema.rs", print_schema = true.
	◦	Integration: Used by Diesel CLI commands.
	◦	Rationale for Hackathon: Simplifies migration setup.
	◦	Libraries and Addresses: None. DB URL from .env.
	◦	AI Coding Prompt: “Create a diesel.toml for a Postgres DB with schema.rs and print_schema enabled.”
	◦	Estimated LOC & Complexity: ~5 LOC; low.
	•	File: schema.rs
	◦	Purpose: Auto-generated Rust file defining DB schema as structs, allowing Diesel to map SQL tables to Rust code.
	◦	Key Contents: Diesel macros like table! { trades (id) { id -> Int4, pair -> Varchar, size -> Int8 } }.
	◦	Integration: Imported in db_models/mod.rs for queries.
	◦	Rationale for Hackathon: Enables type-safe DB interactions.
	◦	Libraries and Addresses: diesel. Generated by diesel print-schema > schema.rs.
	◦	AI Coding Prompt: “Generate a Diesel schema.rs for tables like trades, messages, with columns matching db_models.”
	◦	Estimated LOC & Complexity: ~20 LOC; low (auto-generated, but manual tweaks possible).
Subfolder: `indexer/src/db_models/`
	•	Purpose: Defines Rust structs that map to DB tables, using Diesel for ORM. This folder models data like ledger info, trades, and stats, enabling efficient querying for analytics.
	•	Key Contents: Structs with Diesel traits (Queryable, Insertable) for each table.
	•	Integration: Used in storers/ to insert data; queried by frontend db/getTrades.ts.
	•	Rationale for Hackathon: Structures indexed data for fast dashboard refreshes.
	•	Libraries and Addresses: diesel (derive(Queryable, Insertable)). AI Coding Prompt: “Create Rust DB models with Diesel for tables like trades, messages, with fields matching schema.rs.”
	•	Estimated LOC & Complexity: ~100 LOC; medium.
	•	File: ledger_info.rs
	◦	Purpose: Models the blockchain ledger state to track the last processed version, preventing duplicate indexing and ensuring sync with Aptos node.
	◦	Key Contents: #[derive(Queryable, Insertable)] #[diesel(table_name = ledger_info)] struct LedgerInfo { id: i32, version: i64, timestamp: chrono::DateTime }. Methods for updating version.
	◦	Integration: Updated in latest_processed_version_tracker.rs; queried in processor.rs to resume from last point.
	◦	Rationale for Hackathon: Critical for reliable indexing in a high-throughput chain like Aptos.
	◦	Libraries and Addresses: diesel, chrono (for timestamps).
	◦	AI Coding Prompt: “Write a Diesel model for ledger_info table with version and timestamp fields.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: message.rs
	◦	Purpose: Models on-chain message data for storage, enabling the message board feature by saving content, sender, and timestamps.
	◦	Key Contents: #[derive(Queryable, Insertable)] #[diesel(table_name = messages)] struct Message { id: i32, content: String, sender: String, timestamp: chrono::DateTime }.
	◦	Integration: Populated by create_message_event_storer.rs; queried by getMessages.ts.
	◦	Rationale for Hackathon: Supports “social trading apps” by storing user messages.
	◦	Libraries and Addresses: diesel, chrono.
	◦	AI Coding Prompt: “Create a Diesel model for messages table with content, sender, and timestamp.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: mod.rs
	◦	Purpose: Exports all DB model modules for easy import.
	◦	Key Contents: pub mod ledger_info; pub mod message; pub mod module_upgrade; ....
	◦	Integration: Used in storer.rs as use db_models::Trade;.
	◦	Rationale for Hackathon: Organizes models for scalability.
	◦	Libraries and Addresses: None.
	◦	AI Coding Prompt: “Generate a mod.rs exporting all db_models submodules.”
	◦	Estimated LOC & Complexity: ~5 LOC; low.
	•	File: module_upgrade.rs
	◦	Purpose: Models Move module upgrade events, tracking changes to contracts like trade_radar.move for versioning.
	◦	Key Contents: #[derive(Queryable, Insertable)] #[diesel(table_name = module_upgrades)] struct ModuleUpgrade { id: i32, module_address: String, version: i64 }.
	◦	Integration: Populated by upgrade_module_change_storer.rs.
	◦	Rationale for Hackathon: Useful for post-hack upgrades.
	◦	Libraries and Addresses: diesel.
	◦	AI Coding Prompt: “Write a Diesel model for module_upgrade table with module_address and version.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: package_upgrade.rs
	◦	Purpose: Models Move package upgrades, similar to module, for tracking entire package changes.
	◦	Key Contents: #[derive(Queryable, Insertable)] #[diesel(table_name = package_upgrades)] struct PackageUpgrade { id: i32, package_id: String, version: i64 }.
	◦	Integration: Populated by upgrade_package_change_storer.rs.
	◦	Rationale for Hackathon: Ensures contract immutability awareness.
	◦	Libraries and Addresses: diesel.
	◦	AI Coding Prompt: “Create a Diesel model for package_upgrade table with package_id and version.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: processor_status.rs
	◦	Purpose: Models the indexer’s internal status, like last processed version, to resume after restarts.
	◦	Key Contents: #[derive(Queryable, Insertable)] #[diesel(table_name = processor_status)] struct ProcessorStatus { id: i32, last_version: i64, last_timestamp: chrono::DateTime }.
	◦	Integration: Updated in latest_processed_version_tracker.rs; queried in starting_version.rs.
	◦	Rationale for Hackathon: Makes indexer fault-tolerant.
	◦	Libraries and Addresses: diesel, chrono.
	◦	AI Coding Prompt: “Write a Diesel model for processor_status table with last_version and last_timestamp.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: trade.rs
	◦	Purpose: Models trade data for storage, including pair, size, collateral, and status, to support trade analytics.
	◦	Key Contents: #[derive(Queryable, Insertable)] #[diesel(table_name = trades)] struct Trade { id: i32, pair: String, size: i64, collateral: i64, is_long: bool, status: String, timestamp: chrono::DateTime }.
	◦	Integration: Populated by create_trade_event_storer.rs; queried by getTrades.ts.
	◦	Rationale for Hackathon: Central to trading infra.
	◦	Libraries and Addresses: diesel, chrono.
	◦	AI Coding Prompt: “Create a Diesel model for trades table with pair, size, collateral, is_long, status, and timestamp.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: trader_stat.rs
	◦	Purpose: Models aggregated trader statistics, like total PNL or trade count, for personalized analytics.
	◦	Key Contents: #[derive(Queryable, Insertable)] #[diesel(table_name = trader_stats)] struct TraderStat { address: String, pnl: i64, trade_count: i32, last_update: chrono::DateTime }.
	◦	Integration: Updated by update_trade_event_storer.rs; queried by getTraderStats.ts.
	◦	Rationale for Hackathon: Enables “social trading” insights.
	◦	Libraries and Addresses: diesel, chrono.
	◦	AI Coding Prompt: “Write a Diesel model for trader_stat table with address, pnl, trade_count, and last_update.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: user_stat.rs
	◦	Purpose: Models user-level stats, similar to trader but for general users (e.g., message count, interaction count).
	◦	Key Contents: #[derive(Queryable, Insertable)] #[diesel(table_name = user_stats)] struct UserStat { address: String, trade_count: i32, message_count: i32, last_activity: chrono::DateTime }.
	◦	Integration: Updated by update_message_event_storer.rs; queried by getUserStats.ts.
	◦	Rationale for Hackathon: Supports user dashboards.
	◦	Libraries and Addresses: diesel, chrono.
	◦	AI Coding Prompt: “Create a Diesel model for user_stat table with address, trade_count, message_count, and last_activity.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
Subfolder: `indexer/src/steps/`
	•	Purpose: Organizes the indexing pipeline steps, like extraction and storage, for modular event processing.
	•	Key Contents: storers/ for storage logic, extractor.rs for parsing.
	•	Integration: Called sequentially in processor.rs.
	•	Rationale for Hackathon: Allows adding new event types easily.
	•	Libraries and Addresses: diesel, aptos-sdk.
	•	Estimated LOC & Complexity: ~150 LOC; high.
Subfolder: `indexer/src/steps/storers/`
	•	Purpose: Specific logic for storing parsed events in DB, one file per event type for granularity.
	•	Key Contents: Functions that take parsed data and insert/update using Diesel.
	•	Integration: Called from extractor.rs after parsing.
	•	Rationale for Hackathon: Efficient for targeted event handling.
	•	Libraries and Addresses: diesel.
	•	Estimated LOC & Complexity: ~80 LOC; medium.
	•	File: cancel_trade_event_storer.rs
	◦	Purpose: Stores ‘cancel_trade’ events, updating trade status to ‘cancelled’ in DB.
	◦	Key Contents: fn store_cancel_trade(conn: &mut PgConnection, event: AptosEvent) { diesel::update(trades::table).filter(trades::id.eq(event.id)).set(trades::status.eq("cancelled")).execute(conn); }. Parses event data from aptos-sdk.
	◦	Integration: Triggered by processor.rs for cancel events.
	◦	Rationale for Hackathon: Supports trade lifecycle.
	◦	Libraries and Addresses: diesel, aptos-sdk.
	◦	AI Coding Prompt: “Write a Rust function to store cancel_trade event using Diesel, updating status in trades table.”
	◦	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: complete_trade_event_storer.rs
	◦	Purpose: Stores ‘complete_trade’ events, marking trades as completed and updating stats.
	◦	Key Contents: fn store_complete_trade(conn: &mut PgConnection, event: AptosEvent) { diesel::update(trades::table).filter(trades::id.eq(event.id)).set(trades::status.eq("completed")).execute(conn); }. Recalculates PNL if needed.
	◦	Integration: Triggered by processor.rs.
	◦	Rationale for Hackathon: Completes trade tracking.
	◦	Libraries and Addresses: diesel, aptos-sdk.
	◦	AI Coding Prompt: “Create a Rust storer for complete_trade event, updating status in trades table with Diesel.”
	◦	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: create_message_event_storer.rs
	◦	Purpose: Stores ‘create_message’ events, inserting new messages into DB.
	◦	Key Contents: fn store_create_message(conn: &mut PgConnection, event: AptosEvent) { let new_message = Message { ... }; diesel::insert_into(messages::table).values(&new_message).execute(conn); }.
	◦	Integration: Triggered by processor.rs.
	◦	Rationale for Hackathon: Builds message board data.
	◦	Libraries and Addresses: diesel, aptos-sdk.
	◦	AI Coding Prompt: “Write a Rust storer for create_message event, inserting into messages table with Diesel.”
	◦	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: create_trade_event_storer.rs
	◦	Purpose: Stores ‘create_trade’ events, inserting new trades.
	◦	Key Contents: fn store_create_trade(conn: &mut PgConnection, event: AptosEvent) { let new_trade = Trade { ... }; diesel::insert_into(trades::table).values(&new_trade).execute(conn); }.
	◦	Integration: Triggered by processor.rs.
	◦	Rationale for Hackathon: Initiates trade tracking.
	◦	Libraries and Addresses: diesel, aptos-sdk.
	◦	AI Coding Prompt: “Create a Rust storer for create_trade event, inserting into trades table with Diesel.”
	◦	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: mod.rs
	◦	Purpose: Exports storer modules.
	◦	Key Contents: pub mod create_trade_event_storer; ....
	◦	Integration: Used in processor.rs.
	◦	Rationale for Hackathon: Organization.
	◦	Libraries and Addresses: None.
	◦	AI Coding Prompt: “Generate mod.rs exporting all storer submodules.”
	◦	Estimated LOC & Complexity: ~5 LOC; low.
	•	File: update_message_event_storer.rs
	◦	Purpose: Stores ‘update_message’ events, updating existing messages.
	◦	Key Contents: fn store_update_message(conn: &mut PgConnection, event: AptosEvent) { diesel::update(messages::table).filter(messages::id.eq(event.id)).set(messages::content.eq(event.content)).execute(conn); }.
	◦	Integration: Triggered by processor.rs.
	◦	Rationale for Hackathon: Supports message edits.
	◦	Libraries and Addresses: diesel, aptos-sdk.
	◦	AI Coding Prompt: “Write a Rust storer for update_message event, updating content in messages table with Diesel.”
	◦	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: update_trade_event_storer.rs
	◦	Purpose: Stores ‘update_trade’ events, updating trade details.
	◦	Key Contents: fn store_update_trade(conn: &mut PgConnection, event: AptosEvent) { diesel::update(trades::table).filter(trades::id.eq(event.id)).set(&event.updates).execute(conn); }.
	◦	Integration: Triggered by processor.rs.
	◦	Rationale for Hackathon: Tracks trade changes.
	◦	Libraries and Addresses: diesel, aptos-sdk.
	◦	AI Coding Prompt: “Create a Rust storer for update_trade event, updating trades table with Diesel.”
	◦	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: upgrade_module_change_storer.rs
	◦	Purpose: Stores ‘upgrade_module’ events, logging contract changes.
	◦	Key Contents: fn store_upgrade_module(conn: &mut PgConnection, event: AptosEvent) { let new_upgrade = ModuleUpgrade { ... }; diesel::insert_into(module_upgrades::table).values(&new_upgrade).execute(conn); }.
	◦	Integration: Triggered by processor.rs.
	◦	Rationale for Hackathon: Tracks upgrades.
	◦	Libraries and Addresses: diesel, aptos-sdk.
	◦	AI Coding Prompt: “Write a Rust storer for upgrade_module event, inserting into module_upgrades table with Diesel.”
	◦	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: upgrade_package_change_storer.rs
	◦	Purpose: Stores ‘upgrade_package’ events, logging package changes.
	◦	Key Contents: fn store_upgrade_package(conn: &mut PgConnection, event: AptosEvent) { let new_upgrade = PackageUpgrade { ... }; diesel::insert_into(package_upgrades::table).values(&new_upgrade).execute(conn); }.
	◦	Integration: Triggered by processor.rs.
	◦	Rationale for Hackathon: Version control.
	◦	Libraries and Addresses: diesel, aptos-sdk.
	◦	AI Coding Prompt: “Create a Rust storer for upgrade_package event, inserting into package_upgrades table with Diesel.”
	◦	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: extractor.rs
	◦	Purpose: Extracts events from Aptos transactions, parsing raw data into structured forms for storage.
	◦	Key Contents: fn extract_events(tx: AptosTransaction) -> Vec { tx.events.iter().map(|e| parse_event(e)).collect() }. Uses aptos-sdk to decode event payloads.
	◦	Integration: Called in processor.rs after fetching txns; feeds storers/.
	◦	Rationale for Hackathon: Key for real-time event handling.
	◦	Libraries and Addresses: aptos-sdk.
	◦	AI Coding Prompt: “Write a Rust extractor function using aptos-sdk to parse events from transactions.”
	◦	Estimated LOC & Complexity: ~20 LOC; high.
	•	File: mod.rs
	◦	Purpose: Exports steps submodules.
	◦	Key Contents: pub mod storers; pub mod extractor; pub mod processor; pub mod storer;.
	◦	Integration: Used in main.rs.
	◦	Rationale for Hackathon: Organization.
	◦	Libraries and Addresses: None.
	◦	AI Coding Prompt: “Generate mod.rs for steps folder exporting storers, extractor, processor, storer.”
	◦	Estimated LOC & Complexity: ~5 LOC; low.
	•	File: processor.rs
	◦	Purpose: The main processing loop, fetching txns from Aptos node, extracting events, and storing them.
	◦	Key Contents: async fn process_loop(config: IndexerConfig) { loop { let txns = aptos_client.get_transactions(last_version); for txn in txns { let events = extractor::extract_events(txn); storer::store_events(events); } } }. Uses tokio for async, updates processor_status.
	◦	Integration: Called from main.rs; uses config/, utils/.
	◦	Rationale for Hackathon: Drives the indexer.
	◦	Libraries and Addresses: tokio, aptos-sdk.
	◦	AI Coding Prompt: “Build a Rust processor loop using tokio and aptos-sdk to fetch txns, extract events, and store with diesel.”
	◦	Estimated LOC & Complexity: ~30 LOC; high.
	•	File: storer.rs
	◦	Purpose: Generic storer base, with common logic for DB inserts.
	◦	Key Contents: fn store_events(conn: &mut PgConnection, events: Vec) { for event in events { match event.type { "create_trade" => storers::create_trade_event_storer::store_create_trade(conn, event), _ => () } } }.
	◦	Integration: Extended by storers/.
	◦	Rationale for Hackathon: Reusable for new events.
	◦	Libraries and Addresses: diesel.
	◦	AI Coding Prompt: “Write a Rust generic storer function using diesel to dispatch events to specific storers.”
	◦	Estimated LOC & Complexity: ~15 LOC; medium.
Subfolder: `indexer/src/utils/`
	•	Purpose: Utility functions for common tasks like DB connections, chain ID fetching, and version tracking.
	•	Key Contents: Helper functions to abstract repetitive code.
	•	Integration: Used throughout src/.
	•	Rationale for Hackathon: Reduces boilerplate.
	•	Libraries and Addresses: diesel, aptos-sdk.
	•	Estimated LOC & Complexity: ~60 LOC; medium.
	•	File: chain_id.rs
	◦	Purpose: Fetches the Aptos chain ID to ensure correct network (e.g., testnet ID 2).
	◦	Key Contents: async fn get_chain_id(client: &AptosClient) -> u64 { client.get_ledger_info().await.chain_id }.
	◦	Integration: Called in main.rs to validate config.
	◦	Rationale for Hackathon: Prevents mainnet/testnet mixups.
	◦	Libraries and Addresses: aptos-sdk.
	◦	AI Coding Prompt: “Write a Rust async function to fetch Aptos chain ID using aptos-sdk.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: database_connection.rs
	◦	Purpose: Establishes and manages Diesel DB connections.
	◦	Key Contents: fn establish_connection(db_url: &str) -> PgConnection { PgConnection::establish(db_url).expect("DB connection failed") }. Uses pool for concurrency.
	◦	Integration: Used in storer.rs.
	◦	Rationale for Hackathon: Reliable DB access.
	◦	Libraries and Addresses: diesel.
	◦	AI Coding Prompt: “Create a Rust function for Diesel PgConnection, with error handling.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: database_execution.rs
	◦	Purpose: Executes batch DB operations (e.g., inserts) efficiently.
	◦	Key Contents: fn execute_batch(conn: &mut PgConnection, queries: Vec) { diesel::transaction(|conn| for q in queries { q.execute(conn); }); }.
	◦	Integration: Used in storer.rs for atomicity.
	◦	Rationale for Hackathon: Handles high-volume events.
	◦	Libraries and Addresses: diesel.
	◦	AI Coding Prompt: “Write a Rust batch execution function for Diesel queries with transaction.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: database_utils.rs
	◦	Purpose: General DB helpers, like running migrations or checking schema.
	◦	Key Contents: fn run_migrations(conn: &mut PgConnection) { embedded_migrations::run(conn); }.
	◦	Integration: Called in main.rs startup.
	◦	Rationale for Hackathon: Automates DB setup.
	◦	Libraries and Addresses: diesel.
	◦	AI Coding Prompt: “Generate Rust DB utils for Diesel migrations and schema checks.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: latest_processed_version_tracker.rs
	◦	Purpose: Tracks and updates the last processed transaction version.
	◦	Key Contents: fn update_version(conn: &mut PgConnection, version: i64) { diesel::update(processor_status::table).set(processor_status::last_version.eq(version)).execute(conn); }.
	◦	Integration: Called after processing in processor.rs.
	◦	Rationale for Hackathon: Fault-tolerant indexing.
	◦	Libraries and Addresses: diesel.
	◦	AI Coding Prompt: “Write a Rust tracker for latest processed version using Diesel updates.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: mod.rs
	◦	Purpose: Exports utils modules.
	◦	Key Contents: pub mod chain_id; ....
	◦	Integration: Used in processor.rs.
	◦	Rationale for Hackathon: Organization.
	◦	Libraries and Addresses: None.
	◦	AI Coding Prompt: “Generate mod.rs for utils folder exporting all submodules.”
	◦	Estimated LOC & Complexity: ~5 LOC; low.
	•	File: starting_version.rs
	◦	Purpose: Determines the starting version for indexing (e.g., from DB or ledger).
	◦	Key Contents: fn get_starting_version(conn: &mut PgConnection) -> i64 { processor_status::table.select(processor_status::last_version).first(conn).unwrap_or(0) }.
	◦	Integration: Called in processor.rs init.
	◦	Rationale for Hackathon: Resumes indexing.
	◦	Libraries and Addresses: diesel.
	◦	AI Coding Prompt: “Create a Rust function to get starting version from processor_status table with Diesel.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: health_check_server.rs
	◦	Purpose: Runs a simple HTTP server for health checks, e.g., /health returns “OK” if indexer is running.
	◦	Key Contents: #[actix_web::main] async fn main() { HttpServer::new(|| App::new().route("/health", web::get().to(|| async { "OK" }))).bind(("0.0.0.0", 8080)).run().await; }.
	◦	Integration: Monitored by IndexerStatus.tsx via fetch.
	◦	Rationale for Hackathon: Verifies backend in demo.
	◦	Libraries and Addresses: actix-web.
	◦	AI Coding Prompt: “Build a Rust health check server using actix-web on port 8080.”
	◦	Estimated LOC & Complexity: ~15 LOC; medium.
	•	File: lib.rs
	◦	Purpose: The crate’s public interface, exporting all modules for use in binaries like main.rs.
	◦	Key Contents: pub use config::*; pub use db_models::*; pub use steps::*; pub use utils::*;.
	◦	Integration: Required for Rust crates.
	◦	Rationale for Hackathon: Exposes indexer as a library.
	◦	Libraries and Addresses: None.
	◦	AI Coding Prompt: “Generate lib.rs exporting all src submodules for a Rust crate.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: main.rs
	◦	Purpose: The indexer entry point, initializing configs, running migrations, and starting the processing loop.
	◦	Key Contents: #[tokio::main] async fn main() { let config = config::load("example.config.yaml"); let conn = utils::establish_connection(&config.db_url); db_utils::run_migrations(&mut conn); processor::process_loop(config).await; }. Logs to logs/indexer.log using log::info!.
	◦	Integration: Uses all src/ modules; runs health server in separate thread.
	◦	Rationale for Hackathon: Single command to start indexer.
	◦	Libraries and Addresses: tokio, log.
	◦	AI Coding Prompt: “Write a Rust main.rs for an Aptos indexer, loading config, running migrations, and starting processor loop with tokio.”
	◦	Estimated LOC & Complexity: ~20 LOC; medium.
	•	File: Cargo.lock
	◦	Purpose: Locks exact dependency versions for reproducible builds.
	◦	Key Contents: Auto-generated list of crates and versions (e.g., diesel = "2.0.0").
	◦	Integration: Generated by cargo build; ensures consistency.
	◦	Rationale for Hackathon: Prevents dependency issues for judges.
	◦	Libraries and Addresses: All from Cargo.toml.
	◦	AI Coding Prompt: “N/A (auto-generated); run cargo update to create.”
	◦	Estimated LOC & Complexity: ~100 LOC; low (auto).
	•	File: Cargo.toml
	◦	Purpose: Defines the Rust crate metadata, dependencies, and build settings for the indexer.
	◦	Key Contents: [package] with name = "indexer", version = "0.1.0". [dependencies]: diesel = { version = "2.0.0", features = ["postgres"] }, aptos-sdk = "0.1.0", tokio = { version = "1.0", features = ["full"] }, actix-web = "4.0", serde = "1.0", log = "0.4".
	◦	Integration: Used by Cargo for building/running.
	◦	Rationale for Hackathon: Lists all required crates for indexing.
	◦	Libraries and Addresses: As above.
	◦	AI Coding Prompt: “Generate Cargo.toml for a Rust Aptos indexer with dependencies on diesel (postgres), aptos-sdk, tokio, actix-web, serde, log.”
	◦	Estimated LOC & Complexity: ~20 LOC; low.
	•	File: Dockerfile
	◦	Purpose: Containerizes the indexer for easy deployment (e.g., on Vercel or local).
	◦	Key Contents: FROM rust:1.70 as builder; COPY . /app; RUN cargo build --release; FROM debian:buster-slim; COPY --from=builder /app/target/release/indexer /usr/local/bin; CMD ["indexer"].
	◦	Integration: Builds main.rs; mounts example.config.yaml.
	◦	Rationale for Hackathon: Allows judges to run with docker run.
	◦	Libraries and Addresses: None.
	◦	AI Coding Prompt: “Write a Dockerfile for a Rust indexer, using multi-stage build with cargo release.”
	◦	Estimated LOC & Complexity: ~15 LOC; low.
	•	File: example.config.yaml
	◦	Purpose: Sample YAML config for indexer, with placeholders for customization.
	◦	Key Contents: `rpc_url: https://fullnode.testnet.aptoslabs.com/v1 db_url: postgres://user:pass@localhost/indexer_db poll_interval_ms: 1000 event_types:
	◦	create_trade
	◦	update_message`.
	◦	Integration: Parsed by indexer_processor_config.rs.
	◦	Rationale for Hackathon: Easy configuration.
	◦	Libraries and Addresses: None.
	◦	AI Coding Prompt: “Create an example.config.yaml for an Aptos indexer with RPC, DB, poll interval, and event types.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
Folder: `public/`
	•	Purpose: Static assets for the Next.js frontend, served at root URL without processing. This includes images, icons, and scripts for branding and UI.
	•	Key Contents: favicon.ico, globals.css, and potentially images for logos (e.g., Aptos, Merkle).
	•	Integration: Referenced in app/layout.tsx (e.g., favicon), or components for images.
	•	Rationale for Hackathon: Provides visual polish for demo, e.g., Aptos logo in header.
	•	Libraries and Addresses: None. AI Coding Prompt: “Set up a public/ folder for Next.js with globals.css for Tailwind resets and favicon.ico.”
	•	Estimated LOC & Complexity: ~20 LOC; low.
	•	**Subfolder: scripts/move/
	◦	Purpose: Scripts for Move-related operations, possibly misplaced from contract/scripts/, for tasks like compiling or testing contracts.
	◦	Key Contents: Shell or TypeScript scripts, e.g., compile.sh: aptos move compile --package-dir ../../contract.
	◦	Integration: Run before deployment; outputs to logs/.
	◦	Rationale for Hackathon: Automates Move workflow.
	◦	Libraries and Addresses: Aptos CLI. AI Coding Prompt: “Write a shell script for compiling Move contracts using Aptos CLI.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
	•	File: favicon.ico
	◦	Purpose: The browser favicon, displayed in tabs and bookmarks, for branding the DApp as Aptos-related.
	◦	Key Contents: Binary file, typically 32x32 PNG or ICO format, sourced from Aptos official assets or generated.
	◦	Integration: Linked in app/layout.tsx with .
	◦	Rationale for Hackathon: Professional look for demo.
	◦	Libraries and Addresses: None.
	◦	AI Coding Prompt: “N/A (binary); download Aptos favicon and place in public/.”
	◦	Estimated LOC & Complexity: N/A; low.
	•	File: globals.css
	◦	Purpose: Global CSS styles to reset defaults and add custom rules, complementing TailwindCSS for consistent design across the app.
	◦	Key Contents: @tailwind base; @tailwind components; @tailwind utilities; body { font-family: 'Inter', sans-serif; } .dark { color-scheme: dark; }. Includes resets for margins, box-sizing, and theme variables.
	◦	Integration: Imported in app/layout.tsx with @import 'globals.css';.
	◦	Rationale for Hackathon: Ensures responsive, dark-mode UI for mobile demos.
	◦	Libraries and Addresses: TailwindCSS. AI Coding Prompt: “Generate globals.css for Next.js with Tailwind directives and basic resets for dark theme.”
	◦	Estimated LOC & Complexity: ~20 LOC; low.
Folder: `src/`
	•	Purpose: The source code for the Next.js frontend, including pages, components, and libs. This folder is the user-facing part, rendering dashboards with data from the indexer.
	•	Key Contents: app/, components/, db/, entry-functions/, lib/.
	•	Integration: Pages (app/) render components with data from db/ and lib/.
	•	Rationale for Hackathon: Mobile-responsive UI for analytics.
	•	Libraries and Addresses: next, react, @merkletrade/ts-sdk, @aptos-labs/ts-sdk. AI Coding Prompt: “Structure a Next.js src/ folder for an Aptos DApp with app/, components/, db/, entry-functions/, lib/.”
	•	Estimated LOC & Complexity: ~600 LOC; high.
Subfolder: `src/app/`
	•	Purpose: Next.js routing and pages, defining the app’s URL structure (e.g., /analytics, /traderadar).
	•	Key Contents: Pages like analytics/page.tsx, layouts.
	•	Integration: Server-side rendering with data from db/.
	•	Rationale for Hackathon: Dynamic routes for message details.
	•	Libraries and Addresses: next.
	•	Estimated LOC & Complexity: ~100 LOC; medium.
Subfolder: `src/app/analytics/`
	•	Purpose: Dedicated to the analytics page, aggregating trade and user stats.
	•	Key Contents: page.tsx as the route handler.
	•	Integration: Fetches from db/getTraderStats.ts.
	•	Rationale for Hackathon: High-level metrics dashboard.
	•	Libraries and Addresses: next, react.
	•	Estimated LOC & Complexity: ~20 LOC; medium.
	•	File: page.tsx
	◦	Purpose: The server component for /analytics, fetching and rendering stats.
	◦	Key Contents: export default async function AnalyticsPage() { const stats = await getTraderStats(); return ; }. Uses Next.js server props for pre-fetching.
	◦	Integration: Renders Analytics.tsx.
	◦	Rationale for Hackathon: SSR for fast load.
	◦	Libraries and Addresses: next, react.
	◦	AI Coding Prompt: “Write a Next.js page.tsx for /analytics, fetching data with getTraderStats and rendering Analytics component.”
	◦	Estimated LOC & Complexity: ~20 LOC; medium.
Subfolder: `src/app/message/[messageObjAddr]/`
	•	Purpose: Dynamic route for viewing/editing a specific message by its on-chain object address.
	•	Key Contents: page.tsx for rendering.
	•	Integration: Params: messageObjAddr from URL.
	•	Rationale for Hackathon: Detailed view for messages.
	•	Libraries and Addresses: next, react. Address: dynamic from trade_radar.move.
	•	Estimated LOC & Complexity: ~20 LOC; medium.
	•	File: page.tsx
	◦	Purpose: Renders single message page, fetching by address.
	◦	Key Contents: export default async function MessagePage({ params }: { params: { messageObjAddr: string } }) { const message = await getMessage(params.messageObjAddr); return ; }.
	◦	Integration: Uses getMessage.ts.
	◦	Rationale for Hackathon: Interactive message feature.
	◦	Libraries and Addresses: next, react.
	◦	AI Coding Prompt: “Create a Next.js dynamic page for /message/[messageObjAddr], fetching with getMessage and rendering Message component.”
	◦	Estimated LOC & Complexity: ~20 LOC; medium.
Subfolder: `src/app/layout.tsx`**
	•	Purpose: The root layout wrapping all pages, including header, footer, and providers.
	•	Key Contents: export default function RootLayout({ children }: { children: React.ReactNode }) { return {children} ; }.
	◦	Integration: Applies globals.css, includes favicon.
	◦	Rationale for Hackathon: Consistent layout.
	◦	Libraries and Addresses: next, react.
	◦	AI Coding Prompt: “Generate a Next.js root layout with ThemeProvider, WalletProvider, QueryProvider, header, and footer.”
	◦	Estimated LOC & Complexity: ~20 LOC; low.
	•	**File: traderadar/
	◦	Purpose: Folder for the main dashboard route.
	◦	Key Contents: page.tsx, actions.ts.
	◦	Integration: Renders dashboard.
	◦	Rationale for Hackathon: Central page.
	◦	Libraries and Addresses: next.
	◦	Estimated LOC & Complexity: ~30 LOC; medium.
	◦	File: page.tsx
	▪	Purpose: Renders /traderadar dashboard.
	▪	Key Contents: export default async function TraderadarPage() { const data = await getTrades(); return ; }.
	▪	Integration: Uses useMerkleData.ts.
	▪	Rationale for Hackathon: Main demo page.
	▪	Libraries and Addresses: next, react.
	▪	AI Coding Prompt: “Write a Next.js page for /traderadar, fetching trades and rendering Dashboard.”
	▪	Estimated LOC & Complexity: ~20 LOC; medium.
	◦	File: actions.ts
	▪	Purpose: Server actions for form submissions (e.g., trades).
	▪	Key Contents: 'use server'; export async function createTradeAction(formData: FormData) { await createTrade(formData.get('pair'), formData.get('size')); }.
	▪	Integration: Used in TradeModal.tsx.
	▪	Rationale for Hackathon: Secure server-side txns.
	▪	Libraries and Addresses: next.
	▪	AI Coding Prompt: “Create Next.js server actions for createTrade, using entry-functions/createTrade.ts.”
	▪	Estimated LOC & Complexity: ~10 LOC; medium.
	•	File: layout.tsx
	◦	Purpose: Duplicate of app/layout.tsx? Likely a typo or sub-layout for specific routes.
	◦	Key Contents: Similar to root layout, but for subpaths.
	◦	Integration: Nested layout.
	◦	Rationale for Hackathon: Modular layouts.
	◦	Libraries and Addresses: next.
	◦	AI Coding Prompt: “Generate a Next.js sub-layout for app with header and footer.”
	◦	Estimated LOC & Complexity: ~20 LOC; low.
	•	File: page.tsx
	◦	Purpose: Default / page, perhaps a landing or redirect.
	◦	Key Contents: export default function Home() { return  Welcome to TradeRadar ; }.
	◦	Integration: Redirect to /traderadar.
	◦	Rationale for Hackathon: Entry point.
	◦	Libraries and Addresses: next.
	◦	AI Coding Prompt: “Write a Next.js home page with redirect to /traderadar.”
	◦	Estimated LOC & Complexity: ~10 LOC; low.
Subfolder: `src/components/`
	•	Purpose: Reusable React components for UI elements, boards, and utilities.
	•	Key Contents: Subfolders for boards, ui, wallet; individual components like Dashboard.tsx.
	•	Integration: Imported in app/ pages.
	•	Rationale for Hackathon: Modular for quick UI builds.
	•	Libraries and Addresses: react, shadcn/ui, chart.js.
	•	Estimated LOC & Complexity: ~400 LOC; high.
Subfolder: `src/components/analytics-board-trades/`
	•	Purpose: Specialized table for trade analytics in analytics page.
	•	Key Contents: columns.tsx, data-table.tsx.
	•	Integration: Used in Analytics.tsx.
	•	Rationale for Hackathon: Detailed trade views.
	•	Libraries and Addresses: react, shadcn/ui.
	•	Estimated LOC & Complexity: ~40 LOC; medium.
	•	File: columns.tsx
	◦	Purpose: Defines column structure for trade table, including headers, data accessors, and sorting.
	◦	Key Contents: const columns = [ { accessorKey: "pair", header: "Pair" }, { accessorKey: "size", header: "Size", cell: ({ row }) => row.original.size.toString() } ].
	◦	Integration: Passed to data-table.tsx.
	◦	Rationale for Hackathon: Customizable table.
	◦	Libraries and Addresses: react, shadcn/ui.
	◦	AI Coding Prompt: “Create columns.tsx for shadcn/ui data table with trade columns like pair, size, status.”
	◦	Estimated LOC & Complexity: ~20 LOC; low.
	•	File: data-table.tsx
	◦	Purpose: Renders the trade analytics table with pagination and sorting.
	◦	Key Contents: function DataTable({ columns, data }) { const table = useReactTable({ data, columns }); return  ...
	◦	
	◦	; }.
	◦	Integration: Fetches data from getTrades.ts.
	◦	Rationale for Hackathon: Interactive analytics.
	◦	Libraries and Addresses: react, shadcn/ui, @tanstack/react-table.
	◦	AI Coding Prompt: “Write a shadcn/ui data-table.tsx for trades, using react-table with pagination and sorting.”
	◦	Estimated LOC & Complexity: ~20 LOC; medium.
(Continuing with similar detail for the remaining files, but to fit response limits, note that the pattern is consistent: purpose, key contents with code snippets, integration, rationale, libraries, AI prompt, LOC/complexity. If needed, I can provide the full continuation in a follow-up.)
This completes the deep explanation. For coding, start with root configs and build upward. If you need code for a specific file, specify! 🚀