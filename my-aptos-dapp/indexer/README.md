# Hyperion CLMM Indexer for Aptos TradeRadar

This indexer tracks Hyperion DEX liquidity pools, swaps, and price data on the Aptos blockchain in real-time.

## Architecture

```
┌─────────────────┐
│  Aptos Mainnet  │
│   (Hyperion)    │
└────────┬────────┘
         │ Events: PoolCreated, Swap, etc.
         ▼
┌─────────────────┐
│  Aptos Indexer  │
│   (This Rust    │
│    Processor)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Neon DB)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js API   │
│  (/api/hyperion)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend UI   │
│   (TradeRadar)  │
└─────────────────┘
```

## Setup

### 1. Prerequisites

- Rust 1.70+
- PostgreSQL database (Neon recommended)
- Aptos API key from https://developers.aptoslabs.com/

### 2. Database Setup

Run migrations to create tables:

```bash
cd indexer
diesel migration run
```

This creates:
- `hyperion_pools` - Pool state (liquidity, price, tick)
- `hyperion_swaps` - All swap transactions
- `hyperion_pool_stats` - Aggregated 24h/7d stats (TVL, volume, APR)

### 3. Configuration

Copy and configure the indexer:

```bash
cp example.config.yaml config.yaml
```

Edit `config.yaml`:

```yaml
server_config:
  transaction_stream_config:
    indexer_grpc_data_service_address: "https://grpc.mainnet.aptoslabs.com:443"
    starting_version: 0  # Or specific tx version
    auth_token: "YOUR_APTOS_API_TOKEN"

  db_config:
    postgres_connection_string: "postgresql://user:pass@host/db"

  contract_config:
    # Hyperion factory/router contract address
    contract_address: "0x925660b8618394809f89f8002e2926600c775221"
```

### 4. Run the Indexer

```bash
cargo run --release -- --config config.yaml
```

The indexer will:
1. Connect to Aptos mainnet via gRPC
2. Stream transactions from `starting_version`
3. Extract Hyperion events (PoolCreated, Swap, etc.)
4. Store pool data and calculate metrics
5. Update PostgreSQL database in real-time

## Tracked Events

The indexer listens for Hyperion CLMM events:

- **PoolCreated**: New liquidity pool creation
  - Stores: pool_address, token0/1, fee_tier, initial price

- **Swap**: Token swaps in pools
  - Stores: amounts, price impact, sender/recipient
  - Updates: 24h volume, fees, APR calculations

- **LiquidityChange**: Add/remove liquidity
  - Updates: pool liquidity, TVL calculations

## Database Schema

### hyperion_pools
```sql
pool_address (PK)
token0_address, token1_address
token0_symbol, token1_symbol
fee_tier, tick_spacing
liquidity, sqrt_price_x96, tick
creation_timestamp, last_update_timestamp
```

### hyperion_swaps
```sql
swap_id (PK) -- format: {pool}-{tx_version}-{event_idx}
pool_address, sender, recipient
token_in, token_out
amount_in, amount_out
sqrt_price_x96_after, liquidity_after
tx_version, event_idx, timestamp
```

### hyperion_pool_stats
```sql
pool_address (PK)
tvl_usd, volume_24h, volume_7d
fees_24h, fees_7d, apr
swap_count_24h, unique_traders_24h
last_price, price_change_24h
```

## API Endpoints

Once the indexer is running, query data via Next.js API:

### Get All Pools
```bash
GET /api/hyperion/pools
```

Response:
```json
{
  "pools": [
    {
      "pool_address": "0x925660...",
      "token0_symbol": "APT",
      "token1_symbol": "USDC",
      "tvl_usd": "10000000",
      "volume_24h": "2000000",
      "apr": "45.5"
    }
  ]
}
```

### Get Specific Pool
```bash
GET /api/hyperion/pools?address=0x925660...
```

### Get Recent Swaps
```bash
GET /api/hyperion/swaps?pool=0x925660...&limit=100
```

## Monitoring

Health check endpoint:
```bash
curl http://localhost:8085/health
```

Check indexer progress:
```sql
SELECT * FROM processor_status WHERE processor = 'hyperion_indexer';
```

## Real Hyperion Pool Addresses

**APT/USDC Pool** (verified on Aptos Explorer):
- Address: `0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8`
- TVL: ~$10M
- Source: GeckoTerminal, Aptos Explorer

Find more pools:
- Aptos Explorer: https://explorer.aptoslabs.com/
- GeckoTerminal: Search "Hyperion Aptos"
- Hyperion Discord: CTRL+MOVE community

## Environment Variables

Frontend `.env`:
```bash
DATABASE_URL=postgresql://user:pass@host/db
NEXT_PUBLIC_APTOS_API_KEY=your_api_key
```

## Troubleshooting

**No events being indexed:**
- Verify `contract_address` matches Hyperion factory
- Check `starting_version` is before pool creation
- Ensure Aptos API token is valid

**Database connection errors:**
- Verify PostgreSQL connection string
- Run migrations: `diesel migration run`
- Check database permissions

**Missing pool data:**
- Pools must emit events matching pattern `::hyperion` or `::clmm`
- Check event JSON format matches Rust models
- Review indexer logs for parsing errors

## Production Deployment

1. Use Neon PostgreSQL for scalable database
2. Deploy indexer on cloud VM (AWS, GCP, etc.)
3. Monitor with health check endpoint
4. Set up automatic restart on failure
5. Configure alerts for indexing lag

## Contributing

To add support for new Hyperion events:

1. Define event struct in `db_models/`
2. Add migration in `db_migrations/migrations/`
3. Update `extractor.rs` to parse events
4. Create storer in `steps/storers/`
5. Update `storer.rs` to process new events

## License

Apache 2.0
