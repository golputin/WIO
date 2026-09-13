import { cached } from './cache.js'

export class UpstreamError extends Error {
  constructor(status, message, provider) {
    super(message)
    this.status = status
    this.provider = provider
  }
}

// Yahoo rate-limits full browser UAs that lack matching browser headers; a plain UA is accepted.
const DEFAULT_UA = 'Mozilla/5.0'

/** Small semaphore so fan-out endpoints (indices, watchlists) do not burst upstreams. */
const MAX_CONCURRENT = Number(process.env.UPSTREAM_CONCURRENCY) || 4
let active = 0
const waiters = []
async function withSlot(fn) {
  if (active >= MAX_CONCURRENT) await new Promise((r) => waiters.push(r))
  active++
  try {
    return await fn()
  } finally {
    active--
    waiters.shift()?.()
  }
}

/**
 * Fetch JSON from an upstream provider with a timeout. Never throws raw fetch errors —
 * every failure becomes an UpstreamError carrying an HTTP status the route can forward.
 */
export async function fetchJson(url, { headers = {}, timeoutMs = 8000, provider = 'upstream' } = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  let res
  try {
    res = await withSlot(() => fetch(url, { headers: { 'User-Agent': DEFAULT_UA, Accept: 'application/json', ...headers }, signal: ctrl.signal }))
  } catch (err) {
    clearTimeout(t)
    const timedOut = err?.name === 'AbortError'
    throw new UpstreamError(504, timedOut ? `${provider} timed out.` : `${provider} unreachable.`, provider)
  }
  clearTimeout(t)
  if (!res.ok) throw new UpstreamError(res.status === 429 ? 429 : 502, `${provider} responded ${res.status}.`, provider)
  try {
    return await res.json()
  } catch {
    throw new UpstreamError(502, `${provider} returned unreadable JSON.`, provider)
  }
}

/** fetchJson with a shared TTL cache keyed by URL. */
export function fetchJsonCached(url, ttlMs, opts) {
  return cached(`${opts?.provider ?? ''}:${url}`, ttlMs, () => fetchJson(url, opts))
}
