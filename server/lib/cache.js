/**
 * Tiny in-memory TTL cache with request coalescing. Keeps upstream rate limits happy when many
 * browser tabs poll the same quotes. Replace with Redis when running more than one instance.
 */
const store = new Map()

export async function cached(key, ttlMs, loader) {
  const hit = store.get(key)
  const now = Date.now()
  if (hit && hit.expires > now) return hit.promise
  const promise = loader().catch((err) => {
    store.delete(key)
    throw err
  })
  store.set(key, { promise, expires: now + ttlMs })
  return promise
}

export function cacheSize() {
  return store.size
}
