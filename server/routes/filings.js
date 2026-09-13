import { Router } from 'express'
import { cached } from '../lib/cache.js'
import { clampInt, cleanSymbol, notConfigured, route } from '../lib/route.js'
import * as finnhub from '../providers/finnhub.js'
import * as llm from '../providers/llm.js'
import * as sec from '../providers/sec.js'

/** Mounted at /filings — mirrors src/api/filingsApi.js. */
export const filings = Router()

async function listFilings(symbol, limit) {
  if (symbol) {
    if (sec.configured()) {
      try {
        return await sec.getFilings(symbol, limit)
      } catch (err) {
        if (!finnhub.configured()) throw err
      }
    }
    if (finnhub.configured()) return finnhub.getFilings(symbol, limit)
    throw notConfigured('Filings provider', 'SEC_USER_AGENT or FINNHUB_API_KEY')
  }
  if (!sec.configured()) throw notConfigured('Recent filings feed', 'SEC_USER_AGENT')
  return sec.getRecentFilings(limit)
}

filings.get('/filings', route((req) => listFilings(cleanSymbol(req.query.symbol), clampInt(req.query.limit, 10, 1, 25))))

/** Analysis is generated only from the retrieved document text and always cites it. */
async function analyzeFiling(filing) {
  if (!llm.configured()) throw notConfigured('Filing analysis (LLM)', 'OPENAI_API_KEY')
  if (!sec.configured()) throw notConfigured('Filing document access', 'SEC_USER_AGENT')
  return cached(`analysis:${filing.id}`, 6 * 60 * 60_000, async () => {
    const text = await sec.getDocumentText(filing.url)
    if (text.length < 500) throw Object.assign(new Error('Filing document too short to analyze.'), { status: 422 })
    const out = await llm.completeJson(llm.FILING_SYSTEM_PROMPT, `Company: ${filing.company} (${filing.symbol})\nForm: ${filing.formType}\nFiled: ${filing.filedAt}\n\n${text}`)
    return {
      filing,
      metrics: Array.isArray(out.metrics) ? out.metrics.slice(0, 6) : [],
      developments: Array.isArray(out.developments) ? out.developments.slice(0, 5) : [],
      risks: Array.isArray(out.risks) ? out.risks.slice(0, 5) : [],
      summary: typeof out.summary === 'string' ? out.summary : '',
      sources: [
        { label: `SEC Filing (${filing.formType})`, url: filing.url },
        { label: 'EDGAR', url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${filing.symbol}` },
      ],
      generatedAt: new Date().toISOString(),
    }
  })
}

filings.get('/filings/latest', route(async (req) => {
  const symbol = cleanSymbol(req.query.symbol)
  if (!symbol) throw Object.assign(new Error('symbol is required.'), { status: 400 })
  const [latest] = await listFilings(symbol, 1)
  if (!latest) throw Object.assign(new Error(`No filings found for ${symbol}.`), { status: 404 })
  return analyzeFiling(latest)
}))

filings.get('/filings/:id/analysis', route(async (req) => {
  if (!sec.configured()) throw notConfigured('Filing document access', 'SEC_USER_AGENT')
  const filing = await sec.getFilingById(String(req.params.id))
  if (!filing) throw Object.assign(new Error('Filing not found.'), { status: 404 })
  return analyzeFiling(filing)
}))
