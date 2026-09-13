import { env } from '../config/environment.js'
import { request } from '../services/httpClient.js'

const LABEL = 'Market data'
const base = () => env.marketApiUrl

/**
 * Data contracts expected from the market backend. The backend is responsible for talking to the
 * upstream vendor with its own credentials.
 *
 * @typedef {Object} Quote
 * @property {string} symbol
 * @property {string} name
 * @property {number} price
 * @property {number} change            absolute change
 * @property {number} changePercent     percentage change (e.g. 1.23 for +1.23%)
 * @property {number} [volume]
 * @property {number} [marketCap]
 * @property {string} [currency]
 * @property {string} [exchange]
 * @property {string} asOf              ISO timestamp
 *
 * @typedef {Object} IndexQuote
 * @property {string} symbol            e.g. "SPX"
 * @property {string} name              e.g. "S&P 500"
 * @property {number} value
 * @property {number} change
 * @property {number} changePercent
 * @property {string} asOf
 *
 * @typedef {Object} Candle
 * @property {string} t   ISO timestamp
 * @property {number} o
 * @property {number} h
 * @property {number} l
 * @property {number} c
 * @property {number} [v]
 *
 * @typedef {Object} SearchResult
 * @property {string} symbol
 * @property {string} name
 * @property {string} [exchange]
 * @property {string} [type]
 */

/** GET /indices -> IndexQuote[] */
export function getIndices(signal) {
  return request(base(), '/indices', { signal, providerLabel: LABEL })
}

/** GET /quotes?symbols=A,B -> Quote[] */
export function getQuotes(symbols, signal) {
  if (!symbols?.length) return Promise.resolve({ status: 'ok', data: [] })
  return request(base(), '/quotes', { query: { symbols: symbols.join(',') }, signal, providerLabel: LABEL })
}

/** GET /quote/:symbol -> Quote */
export function getQuote(symbol, signal) {
  return request(base(), `/quote/${encodeURIComponent(symbol)}`, { signal, providerLabel: LABEL })
}

/** GET /chart/:symbol?range=1D -> Candle[] */
export function getChart(symbol, range = '1D', signal) {
  return request(base(), `/chart/${encodeURIComponent(symbol)}`, { query: { range }, signal, providerLabel: LABEL })
}

/** GET /search?q= -> SearchResult[] */
export function searchAssets(q, signal) {
  return request(base(), '/search', { query: { q }, signal, providerLabel: LABEL })
}

/** GET /movers?type=trending|gainers|losers|volume -> Quote[] */
export function getMovers(type, signal) {
  return request(base(), '/movers', { query: { type }, signal, providerLabel: LABEL })
}

/** GET /earnings?range=today|upcoming -> { symbol, name, date, time, epsEstimate? }[] */
export function getEarnings(range = 'upcoming', signal) {
  return request(base(), '/earnings', { query: { range }, signal, providerLabel: LABEL })
}

/** GET /events -> { id, title, date, category, description? }[] */
export function getMarketEvents(signal) {
  return request(base(), '/events', { signal, providerLabel: LABEL })
}

/** GET /status -> { open: boolean, session: string, asOf: string } */
export function getMarketStatus(signal) {
  return request(base(), '/status', { signal, providerLabel: LABEL })
}
