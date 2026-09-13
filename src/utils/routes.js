/** Route builders shared by links and programmatic navigation. */

/** `/markets/:symbol` — canonical analysis URL for one asset. */
export function marketPath(symbol) {
  return `/markets/${encodeURIComponent(String(symbol).toUpperCase())}`
}
