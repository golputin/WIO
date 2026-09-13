import { env } from '../config/environment.js'
import { request } from '../services/httpClient.js'

const LABEL = 'Filings'
const base = () => env.filingsApiUrl

/**
 * @typedef {Object} Filing
 * @property {string} id
 * @property {string} symbol
 * @property {string} company
 * @property {string} formType       e.g. "10-K", "10-Q", "8-K"
 * @property {string} filedAt        ISO timestamp
 * @property {string} url            link to the primary source document
 *
 * @typedef {Object} FilingAnalysis
 * @property {Filing} filing
 * @property {{ label: string, current: string, previous?: string, delta?: string }[]} metrics
 * @property {string[]} developments
 * @property {string[]} risks
 * @property {string} summary                  generated from the real filing content
 * @property {{ label: string, url: string }[]} sources
 */

/** GET /filings?symbol=&limit= -> Filing[] */
export function getFilings({ symbol, limit = 20 } = {}, signal) {
  return request(base(), '/filings', { query: { symbol, limit }, signal, providerLabel: LABEL })
}

/** GET /filings/:id/analysis -> FilingAnalysis */
export function getFilingAnalysis(id, signal) {
  return request(base(), `/filings/${encodeURIComponent(id)}/analysis`, { signal, providerLabel: LABEL })
}

/** GET /filings/latest?symbol= -> FilingAnalysis for the most recent filing */
export function getLatestFilingAnalysis(symbol, signal) {
  return request(base(), '/filings/latest', { query: { symbol }, signal, providerLabel: LABEL })
}
