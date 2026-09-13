import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * `?symbol=XYZ` as page state for list/filter pages (news, filings, analytics).
 * Returns [symbol | null, setSymbol]. Passing null/'' clears the filter.
 */
export function useSymbolParam() {
  const [params, setParams] = useSearchParams()
  const symbol = params.get('symbol')?.trim().toUpperCase() || null
  const setSymbol = useCallback(
    (next) =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev)
          if (next) out.set('symbol', String(next).toUpperCase())
          else out.delete('symbol')
          return out
        },
        { replace: false },
      ),
    [setParams],
  )
  return [symbol, setSymbol]
}
