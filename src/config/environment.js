/**
 * Central place for every runtime configuration value.
 * Only `VITE_*` variables are exposed by Vite to the browser bundle.
 * Never place private keys or server secrets here.
 */

const read = (key) => {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.trim() !== '' ? value.trim().replace(/\/+$/, '') : null
}

export const env = Object.freeze({
  marketApiUrl: read('VITE_MARKET_API_URL'),
  newsApiUrl: read('VITE_NEWS_API_URL'),
  filingsApiUrl: read('VITE_FILINGS_API_URL'),
  rewardsApiUrl: read('VITE_REWARDS_API_URL'),
  alertsApiUrl: read('VITE_ALERTS_API_URL'),
  analyticsApiUrl: read('VITE_ANALYTICS_API_URL'),
  rpcUrl: read('VITE_RPC_URL'),
  chainId: read('VITE_CHAIN_ID'),
  rewardContractAddress: read('VITE_REWARD_CONTRACT_ADDRESS'),
  explorerUrl: read('VITE_EXPLORER_URL'),
  xUrl: read('VITE_X_URL') ?? 'https://x.com',
  isDev: Boolean(import.meta.env.DEV),
})

/** Which live-data providers are configured. Drives "connect a provider" states. */
export const providers = Object.freeze({
  market: Boolean(env.marketApiUrl),
  news: Boolean(env.newsApiUrl),
  filings: Boolean(env.filingsApiUrl),
  rewards: Boolean(env.rewardsApiUrl),
  alerts: Boolean(env.alertsApiUrl),
  analytics: Boolean(env.analyticsApiUrl),
  chain: Boolean(env.rpcUrl && env.rewardContractAddress),
})

/** Build an explorer link for a tx hash or address; returns null when no explorer is configured. */
export function explorerLink(kind, value) {
  if (!env.explorerUrl || !value) return null
  const path = kind === 'address' ? 'address' : 'tx'
  return `${env.explorerUrl}/${path}/${value}`
}
