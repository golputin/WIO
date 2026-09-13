import { env } from '../config/environment.js'
import { request } from '../services/httpClient.js'

const LABEL = 'Protocol status'
const base = () => env.rewardsApiUrl

/**
 * Protocol / keeper status. Produced by the off-chain keeper running on a VPS and exposed by the
 * rewards backend. The browser never runs keeper logic and never holds keeper keys.
 *
 * @typedef {Object} ProtocolStatus
 * @property {'operational'|'degraded'|'paused'|'deferred'} engine
 * @property {string|null} lastDistributionAt   ISO timestamp
 * @property {string|null} nextCheckAt          ISO timestamp
 * @property {{ amount: string, decimals: number, symbol: string } | null} rewardPool
 * @property {{ name: string, chainId: number } | null} network
 * @property {{ gasLimit: string, gasPriceWei: string, totalWei: string, nativeSymbol?: string } | null} lastGasEstimate
 * @property {string|null} deferredReason      set when execution conditions are not met
 * @property {string} asOf
 */

/** GET /protocol/status -> ProtocolStatus */
export function getProtocolStatus(signal) {
  return request(base(), '/protocol/status', { signal, providerLabel: LABEL })
}

/** GET /protocol/distributions?limit= -> { id, executedAt, txHash, assets: [{symbol, amount, decimals}] }[] */
export function getDistributions(limit = 10, signal) {
  return request(base(), '/protocol/distributions', { query: { limit }, signal, providerLabel: LABEL })
}
