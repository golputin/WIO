import { env } from './environment.js'

/**
 * Official MarketLens token. Every value comes from VITE_TOKEN_* — nothing is guessed.
 * Until the operator fills VITE_TOKEN_ADDRESS the UI shows a "not launched yet" state:
 * no chart, no CA, no numbers.
 *
 * VITE_TOKEN_ADDRESS   contract / mint address (the "CA")
 * VITE_TOKEN_CHAIN     DexScreener chain slug: robinhood | solana | ethereum | base | bsc | arbitrum ...
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
  return env.tokenChartUrl ||
    `https://gmgn.ai/${token.chain}/token/${token.address}`
}

export function tokenChartUrl() {
  if (!token.live) return null
  return env.tokenChartUrl ||
    `https://gmgn.ai/${token.chain}/token/${token.pair ?? token.address}`
}

