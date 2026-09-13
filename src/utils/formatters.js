/**
 * Formatting helpers. Every function returns `null` for missing input so callers can render an
 * explicit unavailable state instead of a misleading "$0.00" or "0%".
 */

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

export function formatPrice(value, currency = 'USD') {
  if (!isNum(value)) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)
}

export function formatNumber(value, opts = {}) {
  if (!isNum(value)) return null
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, ...opts }).format(value)
}

export function formatCompact(value) {
  if (!isNum(value)) return null
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

export function formatPercent(value, { sign = true } = {}) {
  if (!isNum(value)) return null
  const abs = Math.abs(value).toFixed(2)
  if (!sign) return `${abs}%`
  if (value > 0) return `+${abs}%`
  if (value < 0) return `-${abs}%`
  return `${abs}%`
}

export function formatChange(value, currency = 'USD') {
  if (!isNum(value)) return null
  const formatted = formatPrice(Math.abs(value), currency)
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

export function changeTone(value) {
  if (!isNum(value) || value === 0) return 'neutral'
  return value > 0 ? 'positive' : 'negative'
}

export function formatDate(iso, opts = {}) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...opts }).format(d)
}

export function formatDateTime(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function formatRelative(iso, now = Date.now()) {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const diff = Math.round((t - now) / 1000)
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (abs < 60) return rtf.format(diff, 'second')
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}

export function todayLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

/** Format a raw integer token amount (string/bigint) using its decimals. */
export function formatTokenAmount(raw, decimals = 18, maxFraction = 6) {
  if (raw === null || raw === undefined || raw === '') return null
  let big
  try {
    big = BigInt(raw)
  } catch {
    return null
  }
  const negative = big < 0n
  if (negative) big = -big
  const divisor = 10n ** BigInt(decimals)
  const whole = big / divisor
  const fraction = big % divisor
  let fracStr = fraction.toString().padStart(decimals, '0').slice(0, maxFraction).replace(/0+$/, '')
  const wholeStr = new Intl.NumberFormat('en-US').format(whole)
  const out = fracStr ? `${wholeStr}.${fracStr}` : wholeStr
  return negative ? `-${out}` : out
}

/** Sum raw integer amounts sharing the same decimals. Returns a string or null. */
export function sumRawAmounts(items) {
  if (!Array.isArray(items) || items.length === 0) return null
  try {
    return items.reduce((acc, v) => acc + BigInt(v ?? 0), 0n).toString()
  } catch {
    return null
  }
}

export function isZeroRaw(raw) {
  try {
    return BigInt(raw ?? 0) === 0n
  } catch {
    return true
  }
}

export function formatWeiToNative(wei, decimals = 18, maxFraction = 6) {
  return formatTokenAmount(wei, decimals, maxFraction)
}

export function formatGwei(wei) {
  if (wei === null || wei === undefined) return null
  try {
    const g = Number(BigInt(wei)) / 1e9
    return `${g.toLocaleString('en-US', { maximumFractionDigits: 2 })} gwei`
  } catch {
    return null
  }
}

export function shortAddress(address, size = 4) {
  if (typeof address !== 'string' || address.length < size * 2 + 2) return address ?? null
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`
}

export function shortHash(hash) {
  return shortAddress(hash, 6)
}
