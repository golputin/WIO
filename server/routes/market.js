import { Router } from 'express'
import { clampInt, cleanSymbol, notConfigured, route } from '../lib/route.js'
import * as finnhub from '../providers/finnhub.js'
import * as yahoo from '../providers/yahoo.js'

/** Mounted at /market — mirrors src/api/marketApi.js. */
export const market = Router()

market.get('/status', route(async () => {
  // Session state derived from the S&P 500 quote timestamp (fresh within 20 minutes = open).
  const [spx] = await yahoo.getIndices()
  const asOf = spx?.asOf ?? new Date().toISOString()
  const ageMin = (Date.now() - new Date(asOf).getTime()) / 60_000
  return { open: ageMin < 20, session: ageMin < 20 ? 'regular' : 'closed', asOf }
}))

market.get('/indices', route(() => yahoo.getIndices()))

market.get('/quotes', route((req) => {
  const symbols = String(req.query.symbols ?? '').split(',').map(cleanSymbol).filter(Boolean).slice(0, 50)
  return symbols.length ? yahoo.getQuotes(symbols) : []
}))

market.get('/quote/:symbol', route(async (req) => {
  const q = await yahoo.getQuote(cleanSymbol(req.params.symbol))
  if (!q) throw Object.assign(new Error('Quote not found.'), { status: 404 })
  return q
}))

market.get('/chart/:symbol', route((req) => yahoo.getChart(cleanSymbol(req.params.symbol), String(req.query.range ?? '1D').toUpperCase())))

market.get('/search', route((req) => {
  const q = String(req.query.q ?? '').trim().slice(0, 40)
  return q.length ? yahoo.search(q) : []
}))

market.get('/movers', route((req) => yahoo.getMovers(String(req.query.type ?? 'gainers'), clampInt(req.query.limit, 12, 1, 25))))

market.get('/earnings', route((req) => {
  if (!finnhub.configured()) throw notConfigured('Earnings calendar', 'FINNHUB_API_KEY')
  const range = String(req.query.range ?? 'week').toLowerCase()
  if (!['today', 'tomorrow', 'week', 'month', 'upcoming'].includes(range)) {
    throw Object.assign(new Error('Invalid earnings range. Use today, tomorrow, week, or month.'), { status: 400, code: 'invalid_range' })
  }
  return finnhub.getEarnings(range)
}))

// No free, reliable macro-event calendar is wired yet; report it honestly rather than inventing events.
market.get('/events', route(() => {
  throw notConfigured('Market events calendar', 'an events provider')
}))
