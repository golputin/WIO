import { env } from './environment.js'

/**
 * Official MarketLens token. Every value comes from VITE_TOKEN_* — nothing is guessed.
 * Until the operator fills VITE_TOKEN_ADDRESS the UI shows a "not launched yet" state:
 * no chart, no CA, no numbers.
 *
 * VITE_TOKEN_ADDRESS   contract / mint address (the "CA")
 * VITE_TOKEN_CHAIN     chain identifier shown in the UI
 * VITE_TOKEN_SYMBOL    ticker shown in the UI (default LENS)
 * VITE_PONS_CHART_API_URL optional Pons chart endpoint; defaults to WSEX backend
 * VITE_TOKEN_CHART_URL is no longer used for the chart provider
 * VITE_TOKEN_PAIR      retained for compatibility, not used by Pons chart
 */
export const token = Object.freeze({
  address: env.tokenAddress,
  chain: env.tokenChain,
  symbol: env.tokenSymbol ?? 'LENS',
  pair: env.tokenPair,
  live: Boolean(env.tokenAddress && env.tokenChain),
})

/** Pons chart API URL for the configured token. */
export function tokenChartApiUrl(range = '5m') {
  if (!token.live || !env.ponsChartApiUrl) return null
  const url = new URL(env.ponsChartApiUrl)
  url.searchParams.set('address', token.address)
  url.searchParams.set('range', range)
  return url.toString()
}

