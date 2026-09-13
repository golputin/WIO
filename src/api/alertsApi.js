import { env } from '../config/environment.js'
import { request } from '../services/httpClient.js'

const LABEL = 'Alert service'
const base = () => env.alertsApiUrl

/**
 * @typedef {Object} AlertRule
 * @property {string} id
 * @property {string} symbol
 * @property {AlertCondition} condition
 * @property {number|null} threshold
 * @property {'web'} delivery
 * @property {'active'|'paused'|'triggered'} status
 * @property {string} createdAt
 * @property {string|null} lastTriggeredAt
 *
 * @typedef {'price_above'|'price_below'|'percent_move'|'unusual_volume'|'new_filing'|'earnings'|'major_news'|'market_event'} AlertCondition
 */

/** Condition catalogue is static product configuration, not market data. */
export const ALERT_CONDITIONS = Object.freeze([
  { value: 'price_above', label: 'Price above', requiresThreshold: true, thresholdLabel: 'Price', unit: 'USD' },
  { value: 'price_below', label: 'Price below', requiresThreshold: true, thresholdLabel: 'Price', unit: 'USD' },
  { value: 'percent_move', label: 'Percentage move', requiresThreshold: true, thresholdLabel: 'Move', unit: '%' },
  { value: 'unusual_volume', label: 'Unusual volume', requiresThreshold: false },
  { value: 'new_filing', label: 'New SEC filing', requiresThreshold: false },
  { value: 'earnings', label: 'Earnings announcement', requiresThreshold: false },
  { value: 'major_news', label: 'Major news', requiresThreshold: false },
  { value: 'market_event', label: 'Market event', requiresThreshold: false },
])

/** GET /alerts -> AlertRule[] */
export function listAlerts(signal) {
  return request(base(), '/alerts', { signal, providerLabel: LABEL })
}

/** POST /alerts -> AlertRule */
export function createAlert(rule, signal) {
  return request(base(), '/alerts', { method: 'POST', body: rule, signal, providerLabel: LABEL })
}

/** DELETE /alerts/:id */
export function deleteAlert(id, signal) {
  return request(base(), `/alerts/${encodeURIComponent(id)}`, { method: 'DELETE', signal, providerLabel: LABEL })
}
