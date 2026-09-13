import { env } from './environment.js'

/**
 * Official MarketLens token. Every value comes from VITE_TOKEN_* — nothing is guessed.
 * Until the operator fills VITE_TOKEN_ADDRESS the UI shows a "not launched yet" state:
 * no chart, no CA, no numbers.
 *
 * VITE_TOKEN_ADDRESS   contract / mint address (the "CA")
 * VITE_TOKEN_CHAIN     DexScreener chain slug: solana | ethereum | base | bsc | arbitrum ...
 * VITE_TOKEN_SYMBOL    ticker shown in the UI (default LENS)
 * VITE_TOKEN_CHART_URL optional full embed URL; overrides the DexScreener default
 * VITE_TOKEN_PAIR      optional DexScreener pair address (better chart than token address)
 */
export const token = Object.freeze({
  address: env.tokenAddress,
  chain: env.tokenChain,
  symbol: env.tokenSymbol ?? 'LENS',
  pair: env.tokenPair,
  live: Boolean(env.tokenAddress && env.tokenChain),
})

/** DexScreener page for humans (opens in a new tab). */
export function tokenPageUrl() {
  if (!token.live) return null
  return `https://dexscreener.com/${token.chain}/${token.pair ?? token.address}`
}

/** Embeddable chart URL. Operator override wins. */
export function tokenChartUrl() {
  if (env.tokenChartUrl) return env.tokenChartUrl
  const page = tokenPageUrl()
  if (!page) return null
  return `${page}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15`
}
