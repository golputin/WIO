/**
 * Minimal fetch wrapper shared by every api module.
 *
 * Every api function returns a `Result`:
 *   { status: 'ok',            data }
 *   { status: 'unavailable',   reason: 'not_configured' | 'network' | 'http' | 'invalid', message, retryable }
 *
 * Components never see raw exceptions or fabricated fallbacks; they render the status.
 */

export const NOT_CONFIGURED = 'not_configured'

export function ok(data) {
  return { status: 'ok', data }
}

export function unavailable(reason, message, retryable = true) {
  return { status: 'unavailable', reason, message, retryable }
}

export function notConfigured(providerLabel) {
  return unavailable(NOT_CONFIGURED, `${providerLabel} provider is not configured.`, false)
}

/**
 * @param {string|null} baseUrl  configured provider base URL (null = not configured)
 * @param {string} path          endpoint path beginning with "/"
 * @param {object} [options]
 * @param {Record<string,string|number|undefined>} [options.query]
 * @param {'GET'|'POST'|'DELETE'|'PUT'|'PATCH'} [options.method]
 * @param {unknown} [options.body]
 * @param {AbortSignal} [options.signal]
 * @param {string} [options.providerLabel]
 */
export async function request(baseUrl, path, options = {}) {
  const { query, method = 'GET', body, signal, providerLabel = 'Data' } = options

  if (!baseUrl) return notConfigured(providerLabel)

  const url = new URL(baseUrl + path)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    }
  }

  let res
  try {
    res = await fetch(url.toString(), {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
  } catch (err) {
    if (err?.name === 'AbortError') return unavailable('aborted', 'Request cancelled.', false)
    return unavailable('network', 'Network connection lost.', true)
  }

  if (!res.ok) {
    return unavailable('http', `Unable to load ${providerLabel.toLowerCase()} (HTTP ${res.status}).`, res.status >= 500)
  }

  try {
    const data = res.status === 204 ? null : await res.json()
    return ok(data)
  } catch {
    return unavailable('invalid', `${providerLabel} returned an unreadable response.`, true)
  }
}

/** Narrow helper: is this result a "provider missing" state (vs. a transient error)? */
export function isNotConfigured(result) {
  return result?.status === 'unavailable' && result.reason === NOT_CONFIGURED
}
