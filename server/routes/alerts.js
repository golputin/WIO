import { Router } from 'express'

/**
 * Alerts are intentionally unavailable until a persistent, user-scoped alert
 * store and evaluator/notification worker are configured. Never return fake
 * alert rules or claim success without that infrastructure.
 */
export const alerts = Router()

const unavailable = (_req, res) => {
  res.status(503).json({
    error: 'Alert service is not configured.',
    code: 'not_configured',
    capability: 'alerts',
  })
}

alerts.get('/alerts', unavailable)
alerts.post('/alerts', unavailable)
alerts.delete('/alerts/:id', unavailable)

export default alerts

/**
 * Required before enabling alerts:
 * - persistent user-scoped alert storage/authentication
 * - live condition evaluator and scheduler
 * - web-notification delivery
 */
