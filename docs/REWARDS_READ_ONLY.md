# Rewards read-only configuration

Set these only in `/opt/marketlens/server/.env` on the VPS. Contract addresses are intentionally blank until the operator supplies them:

```env
REWARD_CHAIN_ID=
REWARD_RPC_URL=
REWARD_AAPL_CONTRACT=
REWARD_SPY_CONTRACT=
REWARD_SPCX_CONTRACT=
REWARD_AMZN_CONTRACT=
REWARD_NVDA_CONTRACT=
REWARD_TSLA_CONTRACT=
```

The backend reads ERC-20 `symbol`, `name`, `decimals`, and `balanceOf` through the configured RPC. It does not deploy or sign transactions. Claims, distributor accounting, and keeper execution remain disabled until separately implemented.