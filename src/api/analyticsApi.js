import { env } from '../config/environment.js'
import { request } from '../services/httpClient.js'

const LABEL = 'Analytics'
const base = () => env.analyticsApiUrl

/**
 * "Why Is It Moving?" analysis. Generated server-side from retrieved market data, news, filings and
 * market events. The service must return `factors: []` and `catalystDetected: false` when it cannot
 * verify a cause — the frontend then shows "No verified catalyst detected yet".
 *
 * @typedef {Object} MovementFactor
 * @property {string} type          'news' | 'filing' | 'event' | 'signal'
 * @property {string} title
 * @property {string} [detail]
 * @property {string} [sourceLabel]
 * @property {string} [sourceUrl]
 * @property {string} [observedAt]
 *
 * @typedef {Object} MovementAnalysis
 * @property {string} symbol
 * @property {boolean} catalystDetected
 * @property {MovementFactor[]} factors
 * @property {{ label: string, score?: number } | null} sentiment
 * @property {number | null} confidence   0–100
 * @property {{ label: string, url?: string }[]} sources
 * @property {string} generatedAt
 */

/** GET /why-moving/:symbol -> MovementAnalysis */
export function getMovementAnalysis(symbol, signal) {
  return request(base(), `/why-moving/${encodeURIComponent(symbol)}`, { signal, providerLabel: LABEL })
}

/** GET /sentiment/:symbol -> { label, score, asOf } */
export function getSentiment(symbol, signal) {
  return request(base(), `/sentiment/${encodeURIComponent(symbol)}`, { signal, providerLabel: LABEL })
}
