# MarketLens

**Understand the Market. Earn the Market.**

Real-time market intelligence, AI-powered analysis, smart alerts, and stock rewards — all in one platform.

## Stack

- React 19 + Vite 8
- Tailwind CSS 4
- React Router 7
- Framer Motion
- Lucide React
- Recharts (rendered only when real data exists)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in provider URLs
npm run dev
```

Production build:

```bash
npm run build
```

## No mock data policy

The UI never displays fabricated market, reward, or protocol values. Every number flows through
`src/api/*` service modules that read provider URLs from environment variables
(`src/config/environment.js`). When a provider is not configured, the UI renders an explicit
"unavailable / connect a provider" state instead of a placeholder value.

Privileged operations (AI keys, keeper, RPC secrets) must live behind a backend. The frontend only
talks to backend endpoints and the user's wallet.

## Routes

| Route        | Page                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `/`          | Home — hero, live ticker, features, Why Is It Moving?, filings, daily brief, rewards, about, CTA |
| `/markets`   | Symbol analysis (`?symbol=AAPL`), chart, catalysts, news, filings     |
| `/discover`  | Trending, top movers, high volume, earnings, filings, market events   |
| `/watchlist` | Live watchlist with local (dev) or backend (prod) persistence         |
| `/alerts`    | Alert builder + alert list (requires alerts backend)                  |
| `/rewards`   | Claimable balances, claim flows, history, protocol status, mechanism  |
| `/about`     | Principles, capabilities, reward mechanism, community                 |

## Environment variables

All variables are optional; each unset provider yields an explicit "not configured" state.

| Variable                       | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `VITE_MARKET_API_URL`          | Quotes, indices, charts, movers, earnings (backend proxy)  |
| `VITE_NEWS_API_URL`            | News & catalysts                                           |
| `VITE_FILINGS_API_URL`         | SEC / company filing intelligence                          |
| `VITE_ANALYTICS_API_URL`       | "Why Is It Moving?" analysis service                       |
| `VITE_ALERTS_API_URL`          | Alerts backend                                             |
| `VITE_USER_API_URL`            | Authenticated user backend (watchlist persistence)         |
| `VITE_REWARDS_API_URL`         | Reward balances, history, protocol/keeper status           |
| `VITE_RPC_URL`, `VITE_CHAIN_ID`| Chain used for wallet connection and claims                |
| `VITE_REWARD_CONTRACT_ADDRESS` | Reward contract                                            |
| `VITE_EXPLORER_URL`            | Block explorer base for transaction links                  |
| `VITE_X_URL`                   | Community link (X only)                                    |

## Architecture

```
src/
├── api/          service modules (marketApi, newsApi, filingsApi, rewardsApi, protocolApi, analyticsApi)
├── components/   reusable UI
├── pages/        route views
├── hooks/        data hooks (useMarketData, useRewards, useWallet, useAlerts)
├── services/     http client, wallet provider adapter
├── config/       environment + reward asset configuration
├── utils/        formatters
└── data/         static, non-financial content (nav links, copy)
```
