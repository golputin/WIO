import { env } from '../config/environment.js'
import { request } from '../services/httpClient.js'

const LABEL = 'Watchlist'
const base = () => env.userApiUrl

/**
 * Production watchlist persistence. Requires an authenticated user backend
 * (session cookie via `credentials: 'include'`). Payload: { symbols: string[] }.
 */
export function getWatchlist(signal) {
  return request(base(), '/watchlist', { signal, providerLabel: LABEL })
}

export function putWatchlist(symbols, signal) {
  return request(base(), '/watchlist', { method: 'PUT', body: { symbols }, signal, providerLabel: LABEL })
}
