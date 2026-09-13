/** Wrap an async handler so provider errors become clean JSON responses. */
export const route = (fn) => async (req, res) => {
  try {
    const data = await fn(req, res)
    if (!res.headersSent) res.json(data)
  } catch (err) {
    const status = Number.isInteger(err?.status) ? err.status : 500
    if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err?.message ?? err)
    if (!res.headersSent) res.status(status).json({ error: err?.message ?? 'Internal error', provider: err?.provider })
  }
}

/** 503 with a machine-readable reason: the frontend renders a "connect provider" state. */
export function notConfigured(what, envVar) {
  return Object.assign(new Error(`${what} is not configured. Set ${envVar} on the server.`), { status: 503, code: 'not_configured' })
}

export const clampInt = (v, fallback, min, max) => {
  const n = Number.parseInt(v, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

export const cleanSymbol = (s) => String(s ?? '').trim().toUpperCase().replace(/[^A-Z0-9.^=\-]/g, '').slice(0, 16)
