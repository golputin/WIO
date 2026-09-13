import { env } from '../config/environment.js'
import { request } from '../services/httpClient.js'

const LABEL = 'News'
const base = () => env.newsApiUrl

/**
 * @typedef {Object} NewsItem
 * @property {string} id
 * @property {string} headline
 * @property {string} source
 * @property {string} url
 * @property {string} publishedAt   ISO timestamp
 * @property {string[]} [symbols]
 * @property {string} [summary]
 */

/** GET /news?symbol=&limit= -> NewsItem[] */
export function getNews({ symbol, limit = 20 } = {}, signal) {
  return request(base(), '/news', { query: { symbol, limit }, signal, providerLabel: LABEL })
}

/** GET /brief -> daily brief generated server-side from real market/news data */
export function getDailyBrief(signal) {
  return request(base(), '/brief', { signal, providerLabel: LABEL })
}
