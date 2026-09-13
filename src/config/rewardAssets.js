/**
 * Reward asset registry.
 *
 * The authoritative list of reward assets comes from the rewards backend / reward contract
 * (`rewardsApi.getRewardAssets()`). This module only defines the shape and provides an empty
 * default so the UI renders whatever the backend returns — nothing is hardcoded here.
 *
 * @typedef {Object} RewardAsset
 * @property {string}  symbol        e.g. "AAPL"
 * @property {string}  name          e.g. "Apple Inc."
 * @property {string}  tokenAddress  on-chain token address representing the reward asset
 * @property {number}  decimals      token decimals
 * @property {boolean} enabled       whether claiming is currently enabled
 */

/** @type {RewardAsset[]} */
export const defaultRewardAssets = []

/** Validate and normalize a reward asset returned by the backend. Drops malformed entries. */
export function normalizeRewardAsset(raw) {
  if (!raw || typeof raw.symbol !== 'string') return null
  return {
    symbol: raw.symbol.toUpperCase(),
    name: typeof raw.name === 'string' ? raw.name : raw.symbol.toUpperCase(),
    tokenAddress: typeof raw.tokenAddress === 'string' ? raw.tokenAddress : null,
    decimals: Number.isInteger(raw.decimals) ? raw.decimals : 18,
    enabled: raw.enabled !== false,
  }
}
