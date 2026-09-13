import { env } from '../config/environment.js'
import { normalizeRewardAsset } from '../config/rewardAssets.js'
import { ok, request } from '../services/httpClient.js'

const LABEL = 'Rewards'
const base = () => env.rewardsApiUrl

/**
 * The rewards backend indexes the reward contract and exposes read models. Writes (claims) are
 * always signed by the user's wallet in the browser — the backend only prepares calldata.
 *
 * @typedef {Object} RewardBalance
 * @property {string} symbol
 * @property {string} claimable        raw integer string in token base units
 * @property {number} decimals
 * @property {string} [claimableUsd]   optional fiat estimate provided by backend
 *
 * @typedef {Object} RewardHistoryEntry
 * @property {string} id
 * @property {string} distributedAt   ISO timestamp
 * @property {string} symbol
 * @property {string} amount          raw integer string
 * @property {number} decimals
 * @property {'claimable'|'claimed'|'pending'} status
 * @property {string|null} txHash
 *
 * @typedef {Object} GasEstimate
 * @property {string} gasLimit
 * @property {string} gasPriceWei
 * @property {string} totalWei
 * @property {string} [totalNative]   formatted native amount (e.g. "0.0012")
 * @property {string} [nativeSymbol]  e.g. "ETH"
 *
 * @typedef {Object} ClaimPrepared
 * @property {string} to
 * @property {string} data
 * @property {string} [value]
 * @property {GasEstimate} gas
 */

/** GET /assets -> RewardAsset[] */
export async function getRewardAssets(signal) {
  const res = await request(base(), '/assets', { signal, providerLabel: LABEL })
  if (res.status !== 'ok') return res
  const rawAssets = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.assets) ? res.data.assets : []
  const assets = rawAssets.map((asset) => normalizeRewardAsset({ ...asset, tokenAddress: asset.tokenAddress ?? asset.contractAddress, enabled: asset.configured === true })).filter(Boolean)
  return ok(assets)
}

/** GET /balances/:address -> RewardBalance[] */
export function getRewardBalances(address, signal) {
  return request(base(), `/balances/${encodeURIComponent(address)}`, { signal, providerLabel: LABEL })
}

/** GET /history/:address -> RewardHistoryEntry[] */
export function getRewardHistory(address, signal) {
  return request(base(), `/history/${encodeURIComponent(address)}`, { signal, providerLabel: LABEL })
}

/** POST /claims/prepare { address, symbols } -> ClaimPrepared */
export function prepareClaim(address, symbols, signal) {
  return request(base(), '/claims/prepare', {
    method: 'POST',
    body: { address, symbols },
    signal,
    providerLabel: LABEL,
  })
}

/** GET /claims/:txHash -> { status: 'pending'|'confirmed'|'failed', confirmations, blockNumber? } */
export function getClaimStatus(txHash, signal) {
  return request(base(), `/claims/${encodeURIComponent(txHash)}`, { signal, providerLabel: LABEL })
}
