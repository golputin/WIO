/**
 * Finnhub (https://finnhub.io) — optional. Requires FINNHUB_API_KEY (free tier is enough).
 * Adds earnings calendar, company news and SEC filings when configured.
 */
import { fetchJsonCached } from '../lib/http.js'

const BASE = 'https://finnhub.io/api/v1'
const PROVIDER = 'Finnhub'
const TTL = { earnings: 30 * 60_000, news: 120_000, filings: 10 * 60_000 }

export const configured = () => Boolean(process.env.FINNHUB_API_KEY)

function url(path, params = {}) {
  const u = new URL(BASE + path)
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) u.searchParams.set(k, String(v))
  u.searchParams.set('token', process.env.FINNHUB_API_KEY)
  return u.toString()
}

const day = (d) => d.toISOString().slice(0, 10)

/** range: 'today' | 'upcoming' (next 14 days) */
export async function getEarnings(range = 'upcoming') {
  const from = new Date()
  const to = new Date()
  if (range === 'upcoming') to.setDate(to.getDate() + 14)
  const json = await fetchJsonCached(url('/calendar/earnings', { from: day(from), to: day(to) }), TTL.earnings, { provider: PROVIDER })
  return (json?.earningsCalendar ?? [])
    .filter((e) => e.symbol && e.date)
    .map((e) => ({
      symbol: e.symbol,
      name: e.name ?? undefined,
      date: e.date,
      time: e.hour === 'bmo' ? 'Before open' : e.hour === 'amc' ? 'After close' : e.hour || undefined,
      epsEstimate: typeof e.epsEstimate === 'number' ? e.epsEstimate : undefined,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getCompanyNews(symbol, limit = 10) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 7)
  const json = await fetchJsonCached(url('/company-news', { symbol, from: day(from), to: day(to) }), TTL.news, { provider: PROVIDER })
  return (Array.isArray(json) ? json : [])
    .filter((n) => n.headline && n.url)
    .slice(0, limit)
    .map((n) => ({
      id: String(n.id ?? n.url),
      headline: n.headline,
      source: n.source ?? 'Finnhub',
      url: n.url,
      publishedAt: new Date((n.datetime ?? 0) * 1000).toISOString(),
      symbols: [symbol],
      summary: n.summary || undefined,
    }))
}

/** SEC filings for a symbol (Finnhub mirrors EDGAR). */
export async function getFilings(symbol, limit = 10) {
  const json = await fetchJsonCached(url('/stock/filings', { symbol }), TTL.filings, { provider: PROVIDER })
  return (Array.isArray(json) ? json : [])
    .filter((f) => f.accessNumber && f.form)
    .slice(0, limit)
    .map((f) => ({
      id: f.accessNumber,
      symbol: f.symbol ?? symbol,
      company: f.symbol ?? symbol,
      formType: f.form,
      filedAt: new Date(f.filedDate).toISOString(),
      url: f.reportUrl || f.filingUrl,
    }))
}
