import { motion } from 'framer-motion'
import { useId, useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { formatDateTime, formatPrice } from '../utils/formatters.js'
import { Skeleton } from './LoadingState.jsx'

/**
 * Price chart. Renders Recharts ONLY when real candles exist; otherwise a skeleton or nothing.
 * @param {{ candles?: Array<{t:string,c:number}>, state: 'idle'|'loading'|'ok'|'unavailable', height?: number, tone?: 'positive'|'negative'|'neutral' }} props
 */
export default function StockChart({ candles, state, height = 160, tone = 'neutral', currency = 'USD' }) {
  const gradientId = useId()
  const data = useMemo(
    () => (Array.isArray(candles) ? candles.filter((c) => typeof c?.c === 'number').map((c) => ({ t: c.t, c: c.c })) : []),
    [candles],
  )

  if (state === 'loading') {
    return <Skeleton className="w-full" style={{ height }} />
  }

  if (state !== 'ok' || data.length < 2) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted"
        style={{ height }}
      >
        {state === 'unavailable' ? 'Chart data unavailable' : 'No chart data'}
      </div>
    )
  }

  const stroke = tone === 'positive' ? '#18B981' : tone === 'negative' ? '#E5484D' : '#1677FF'

  return (
    <motion.div
      initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
      animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ height }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            cursor={{ stroke: '#E2EAF4', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const p = payload[0].payload
              return (
                <div className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs shadow-card">
                  <p className="tabular font-semibold text-fg">{formatPrice(p.c, currency)}</p>
                  <p className="text-muted">{formatDateTime(p.t)}</p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="c"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: stroke }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
