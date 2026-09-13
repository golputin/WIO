# MarketLens — Configuration Guide

MarketLens has two processes:

```
Browser ──► Frontend (Vite, port 5173) ──► Data backend (server/, port 8787) ──► Yahoo / Finnhub / SEC / LLM
                                       └─► Rewards backend + Reward contract (your infrastructure)
```

Secrets live **only** in `server/.env` (or your rewards backend). The frontend `.env.local` contains
public URLs and addresses only — everything prefixed `VITE_` is shipped to the browser.

## 1. Quick start (no keys needed)

```bash
npm install                 # also installs server/ deps
cp .env.example .env.local  # frontend → local backend URLs are already filled in
cp server/.env.example server/.env
npm run dev:all             # backend on :8787, frontend on :5173
```

Yahoo Finance needs no credentials, so quotes, charts, indices, search, trending, movers,
headlines, the daily brief and "Why Is It Moving?" work immediately.

## 2. Frontend — `.env.local`

| Variable | What it is | Where to get it |
| --- | --- | --- |
| `VITE_MARKET_API_URL` | Backend market route | `http://localhost:8787/market` locally, `https://api.yourdomain.com/market` in production |
| `VITE_NEWS_API_URL` | Backend news route | `…/news` |
| `VITE_FILINGS_API_URL` | Backend filings route | `…/filings` |
| `VITE_ANALYTICS_API_URL` | Backend analytics route | `…/analytics` |
| `VITE_REWARDS_API_URL` | Rewards backend (balances, history, claim prep, protocol status) | Your rewards service (section 4) |
| `VITE_ALERTS_API_URL` | Alerts backend | Your alerts service (section 5) |
| `VITE_USER_API_URL` | Authenticated user backend for watchlist persistence | Optional; unset = browser local storage (dev only) |
| `VITE_RPC_URL` | Public JSON-RPC URL of the chain the reward contract lives on | Alchemy / Infura / QuickNode / public RPC — use a **public** URL; do not put a secret key here |
| `VITE_CHAIN_ID` | Chain ID as a number (1 Ethereum, 8453 Base, 42161 Arbitrum, 56 BNB, …) | Your deployment chain |
| `VITE_REWARD_CONTRACT_ADDRESS` | Deployed reward contract address | From your contract deployment |
| `VITE_EXPLORER_URL` | Block explorer base, no trailing slash | `https://etherscan.io`, `https://basescan.org`, … |
| `VITE_X_URL` | Official X profile | `https://x.com/<handle>` |

Restart `npm run dev` after editing `.env.local`; Vite reads env at startup.

## 3. Data backend — `server/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | no (8787) | Listening port |
| `CORS_ORIGINS` | yes in prod | Comma-separated frontend origins allowed to call the API |
| `FINNHUB_API_KEY` | no | Earnings calendar, company news, SEC filings fallback. Free key at <https://finnhub.io/register> |
| `SEC_USER_AGENT` | no | Enables SEC EDGAR (no key). SEC requires `"AppName contact@yourdomain.com"` |
| `OPENAI_API_KEY` | no | Filing analysis (metrics / developments / risks / summary) generated **only** from the retrieved filing text |
| `OPENAI_MODEL` | no | Default `gpt-4o-mini` |
| `OPENAI_BASE_URL` | no | Any OpenAI-compatible endpoint |
| `UPSTREAM_CONCURRENCY` | no (4) | Max parallel upstream requests |

What each provider unlocks:

| Feature | Yahoo (built-in) | + Finnhub | + SEC_USER_AGENT | + OpenAI |
| --- | --- | --- | --- | --- |
| Quotes, charts, indices, search, movers, trending | ✓ | | | |
| Headlines, daily brief, Why Is It Moving? | ✓ | better per-company news | filing factor | |
| Upcoming / today's earnings | | ✓ | | |
| Filings list per company | | ✓ | ✓ (primary) | |
| Recent filings feed (Discover) | | | ✓ | |
| Filing analysis (What changed / risks / summary) | | | ✓ | ✓ |

Not wired yet (the UI shows an honest "not configured" state): market-events calendar, sentiment
scores. Add a provider in `server/providers/` and a route in `server/routes/`.

Check what is active: `curl http://localhost:8787/health`.

## 4. Rewards & the token (on-chain)

The rewards UI is fully built but reads everything from **your** rewards backend and reward
contract; nothing is hardcoded. To make it live you need:

1. **The MarketLens token** — an ERC-20 whose holders are eligible. Deploy it (or use the existing
   one) and note its address and chain.
2. **The reward contract** — tracks per-holder claimable balances for each reward asset and exposes
   `claim(...)`. Its address goes in `VITE_REWARD_CONTRACT_ADDRESS`; its chain in `VITE_CHAIN_ID` /
   `VITE_RPC_URL`.
3. **Reward assets** — the stock-linked tokens (e.g. tokenised AAPL/NVDA/AMZN). The backend returns
   them from `GET /assets`, so adding an asset is a backend/contract change, not a frontend change.
4. **The rewards backend** (`VITE_REWARDS_API_URL`) implementing the contract in `src/api/rewardsApi.js`
   and `src/api/protocolApi.js`:

   | Endpoint | Returns |
   | --- | --- |
   | `GET /assets` | `[{ symbol, name, tokenAddress, decimals, enabled }]` |
   | `GET /balances/:address` | `[{ symbol, claimable, decimals, claimableUsd? }]` (raw integer strings) |
   | `GET /history/:address` | `[{ id, distributedAt, symbol, amount, decimals, status, txHash }]` |
   | `POST /claims/prepare` `{ address, symbols }` | `{ to, data, value?, gas: { gasLimit, gasPriceWei, totalWei } }` — unsigned tx the wallet signs |
   | `GET /claims/:txHash` | `{ status: 'pending'\|'confirmed'\|'failed', confirmations, blockNumber? }` |
   | `GET /protocol/status` | engine state, last distribution, next check, reward pool, network, last gas estimate, deferredReason |
   | `GET /protocol/distributions?limit=` | keeper execution history |

5. **The keeper (VPS)** — off-chain worker that collects protocol fees, funds the reward contract,
   executes swaps into reward assets and updates accounting. It holds the **keeper private key**;
   that key must never appear in any `VITE_*` variable or in `server/.env` of the public API.

The wallet flow (connect, chain switch, gas estimate, sign, track) already works against any
EIP-1193 wallet once `VITE_CHAIN_ID` and `VITE_REWARD_CONTRACT_ADDRESS` are set.

## 5. Alerts backend

`VITE_ALERTS_API_URL` must implement `GET /alerts`, `POST /alerts`, `DELETE /alerts/:id` per
`src/api/alertsApi.js`. Until then the Alerts page shows "Alert service unavailable".

## 6. Production deployment

- Deploy `server/` (Node ≥ 20.6) behind HTTPS, set `CORS_ORIGINS=https://yourdomain.com`.
- Build the frontend with the production URLs in `.env.production`, then `npm run build` → `dist/`.
- Put the API behind a cache/CDN if traffic is high; the in-memory cache is per instance.
- Never commit `.env`, `.env.local` or `server/.env` (already git-ignored).
