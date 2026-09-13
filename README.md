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
