import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic loader for api functions that return a `Result` ({ status: 'ok' | 'unavailable' }).
 *
 * Returns:
 *   state:  'idle' | 'loading' | 'ok' | 'unavailable'
 *   data:   payload when ok
 *   error:  { reason, message, retryable } when unavailable
 *   refresh(): re-run
 *
 * @param {(signal: AbortSignal) => Promise<object>} fetcher   stable or memoized
 * @param {object} [options]
 * @param {boolean} [options.enabled=true]
 * @param {number} [options.refreshMs]   poll interval (only while ok)
 * @param {unknown[]} [options.deps]     re-run when these change
 */
export function useAsyncResource(fetcher, { enabled = true, refreshMs, deps = [] } = {}) {
  const [state, setState] = useState(enabled ? 'loading' : 'idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const abortRef = useRef(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async ({ silent = false } = {}) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    if (!silent) setState('loading')
    try {
      const result = await fetcherRef.current(controller.signal)
      if (controller.signal.aborted) return
      if (result?.status === 'ok') {
        setData(result.data)
        setError(null)
        setUpdatedAt(Date.now())
        setState('ok')
      } else if (result?.reason === 'aborted') {
        return
      } else {
        setError({
          reason: result?.reason ?? 'unknown',
          message: result?.message ?? 'Unable to load data.',
          retryable: result?.retryable ?? true,
        })
        setState('unavailable')
      }
    } catch (err) {
      if (controller.signal.aborted) return
      setError({ reason: 'exception', message: err?.message || 'Unexpected error.', retryable: true })
      setState('unavailable')
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort()
      setState('idle')
      setData(null)
      setError(null)
      return undefined
    }
    run()
    let timer
    if (refreshMs) {
      timer = setInterval(() => run({ silent: true }), refreshMs)
    }
    return () => {
      abortRef.current?.abort()
      if (timer) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, refreshMs, run, ...deps])

  return { state, data, error, updatedAt, refresh: () => run(), isLoading: state === 'loading' }
}
