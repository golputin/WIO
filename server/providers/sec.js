/**
 * SEC EDGAR — free, no API key, but the SEC requires a descriptive User-Agent that
 * identifies you: set SEC_USER_AGENT="MarketLens admin@yourdomain.com".
 * Some cloud IP ranges are blocked by the SEC; when that happens routes fall back to Finnhub.
 */
import { fetchJsonCached } from '../lib/http.js'

const PROVIDER = 'SEC EDGAR'
const TTL = { tickers: 24 * 60 * 60_000, submissions: 10 * 60_000, recent: 5 * 60_000 }
const DEFAULT_FORMS = ['8-K', '10-K', '10-Q', '6-K', '20-F', 'S-1']

export const configured = () => Boolean(process.env.SEC_USER_AGENT)

const headers = () => ({ 'User-Agent': process.env.SEC_USER_AGENT, 'Accept-Encoding': 'gzip, deflate' })
const pad = (cik) => String(cik).padStart(10, '0')

async function tickerMap() {
  const json = await fetchJsonCached('https://www.sec.gov/files/company_tickers.json', TTL.tickers, { provider: PROVIDER, headers: headers() })
  const map = new Map()
  for (const row of Object.values(json ?? {})) if (row?.ticker) map.set(String(row.ticker).toUpperCase(), { cik: row.cik_str, name: row.title })
  return map
}

export async function lookup(symbol) {
  const map = await tickerMap()
  return map.get(String(symbol).toUpperCase()) ?? null
}

export function documentUrl(cik, accession, primaryDocument) {
  return `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession.replace(/-/g, '')}/${primaryDocument}`
}

/** Filings for one registrant CIK, newest first. `forms` empty = all forms. */
export async function getFilingsByCik(cik, { symbol = '', limit = 10, forms = DEFAULT_FORMS } = {}) {
  const json = await fetchJsonCached(`https://data.sec.gov/submissions/CIK${pad(cik)}.json`, TTL.submissions, { provider: PROVIDER, headers: headers() })
  const r = json?.filings?.recent
  if (!r) return []
  const ticker = symbol || json.tickers?.[0] || ''
  const out = []
  for (let i = 0; i < (r.accessionNumber?.length ?? 0) && out.length < limit; i++) {
    if (forms.length && !forms.includes(r.form[i])) continue
    out.push({
      id: r.accessionNumber[i],
      symbol: String(ticker).toUpperCase(),
      company: json.name ?? ticker,
      formType: r.form[i],
      filedAt: new Date(r.filingDate[i]).toISOString(),
      url: documentUrl(cik, r.accessionNumber[i], r.primaryDocument[i]),
      description: r.primaryDocDescription?.[i] || undefined,
    })
  }
  return out
}

/** Filings for one company symbol, newest first. */
export async function getFilings(symbol, limit = 10, forms = DEFAULT_FORMS) {
  const co = await lookup(symbol)
  if (!co) throw Object.assign(new Error(`No SEC registrant found for ${symbol}.`), { status: 404 })
  return getFilingsByCik(co.cik, { symbol, limit, forms })
}

/** Resolve one filing by accession number. The first 10 digits identify the filer's CIK. */
export async function getFilingById(accession) {
  const m = /^(\d{10})-\d{2}-\d{6}$/.exec(accession)
  if (!m) throw Object.assign(new Error('Invalid accession number.'), { status: 400 })
  const list = await getFilingsByCik(Number(m[1]), { limit: 1000, forms: [] })
  return list.find((f) => f.id === accession) ?? null
}

/** Latest filings across all registrants (EDGAR full-text search index). */
export async function getRecentFilings(limit = 10, forms = ['8-K', '10-K', '10-Q']) {
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22*%22&forms=${encodeURIComponent(forms.join(','))}`
  const json = await fetchJsonCached(url, TTL.recent, { provider: PROVIDER, headers: headers() })
  const map = await tickerMap()
  const byCik = new Map([...map.entries()].map(([t, v]) => [String(v.cik), { ticker: t, name: v.name }]))
  return (json?.hits?.hits ?? [])
    .map((h) => {
      const s = h._source ?? {}
      const cik = s.ciks?.[0]
      const [accession, doc] = String(h._id ?? '').split(':')
      const co = cik ? byCik.get(String(Number(cik))) : null
      if (!accession || !cik) return null
      return {
        id: accession,
        symbol: co?.ticker ?? '',
        company: s.display_names?.[0]?.replace(/\s*\(CIK.*$/, '') ?? co?.name ?? 'Unknown registrant',
        formType: s.form_type ?? s.root_forms?.[0] ?? '',
        filedAt: new Date(s.file_date).toISOString(),
        url: doc ? documentUrl(cik, accession, doc) : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}`,
      }
    })
    .filter(Boolean)
    .slice(0, limit)
}

/** Plain text of a filing's primary document (HTML stripped), truncated for LLM input. */
export async function getDocumentText(url, maxChars = 60_000) {
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) throw Object.assign(new Error(`SEC document fetch failed (${res.status}).`), { status: 502 })
  const html = await res.text()
  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
  return text.slice(0, maxChars)
}
