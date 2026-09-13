import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BellOff, Check, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ALERT_CONDITIONS } from '../api/alertsApi.js'
import { useAlerts } from '../hooks/useAlerts.js'
import { formatDateTime } from '../utils/formatters.js'
import EmptyState from './EmptyState.jsx'
import LoadingState from './LoadingState.jsx'
import SymbolPicker from './SymbolPicker.jsx'
import { Badge } from './ui.jsx'

/**
 * Alert builder + list. Rules are stored by the alerts backend; without one, the builder validates
 * but clearly reports that notifications are not active. Nothing is simulated.
 */
export default function SmartAlerts() {
  const { list, create, remove, mutation, serviceConfigured } = useAlerts()
  const [symbol, setSymbol] = useState(null)
  const [condition, setCondition] = useState('')
  const [threshold, setThreshold] = useState('')
  const [touched, setTouched] = useState(false)

  const cond = useMemo(() => ALERT_CONDITIONS.find((c) => c.value === condition) ?? null, [condition])
  const thresholdNumber = threshold.trim() === '' ? null : Number(threshold)
  const thresholdValid = !cond?.requiresThreshold || (thresholdNumber !== null && Number.isFinite(thresholdNumber) && thresholdNumber > 0)
  const valid = Boolean(symbol && cond && thresholdValid)

  const submit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    const ok = await create({
      symbol,
      condition: cond.value,
      threshold: cond.requiresThreshold ? thresholdNumber : null,
      delivery: 'web',
    })
    if (ok) {
      setCondition('')
      setThreshold('')
      setTouched(false)
    }
  }

  const rules = list.state === 'ok' && Array.isArray(list.data) ? list.data : []

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Builder */}
      <form onSubmit={submit} className="card p-6 lg:col-span-5" noValidate>
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-blue" />
          <h3 className="text-lg font-semibold tracking-tight text-navy">Create Market Alert</h3>
        </div>

        {!serviceConfigured && (
          <div role="status" className="mt-4 flex gap-3 rounded-xl border border-border bg-bg p-3.5 text-sm">
            <BellOff className="mt-0.5 size-4 shrink-0 text-muted" />
            <div>
              <p className="font-semibold text-navy">Alert service unavailable.</p>
              <p className="text-muted">Connect the alert backend to enable notifications.</p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-5">
          <div>
            <span className="label">Asset</span>
            <div className="flex items-center gap-3">
              <div className="input flex min-h-[42px] items-center">
                {symbol ? <span className="font-mono text-sm font-semibold text-navy">{symbol}</span> : <span className="text-muted/70">Search asset</span>}
              </div>
              <SymbolPicker value={symbol} onChange={setSymbol} label="Change" />
            </div>
            {touched && !symbol && <p className="mt-1.5 text-xs text-red">Select an asset.</p>}
          </div>

          <div>
            <label htmlFor="alert-condition" className="label">
              Condition
            </label>
            <select id="alert-condition" value={condition} onChange={(e) => setCondition(e.target.value)} className="input">
              <option value="">Select condition</option>
              {ALERT_CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {touched && !cond && <p className="mt-1.5 text-xs text-red">Select a condition.</p>}
          </div>

          <AnimatePresence initial={false}>
            {cond?.requiresThreshold && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label htmlFor="alert-threshold" className="label">
                  Threshold {cond.unit ? `(${cond.unit})` : ''}
                </label>
                <input
                  id="alert-threshold"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="Enter threshold"
                  className="input tabular"
                />
                {touched && !thresholdValid && <p className="mt-1.5 text-xs text-red">Enter a positive number.</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="alert-delivery" className="label">
              Delivery
            </label>
            <select id="alert-delivery" value="web" disabled className="input">
              <option value="web">Web Notification</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary mt-6 w-full" disabled={mutation.state === 'saving'}>
          {mutation.state === 'saving' ? 'Creating...' : 'Create Alert'}
        </button>

        {mutation.message && mutation.state !== 'saving' && (
          <p role="status" className={`mt-3 text-center text-xs ${mutation.state === 'ok' ? 'text-green' : 'text-muted'}`}>
            {mutation.state === 'ok' && <Check className="mr-1 inline size-3.5" />}
            {mutation.message}
          </p>
        )}
      </form>

      {/* Existing rules */}
      <div className="card p-6 lg:col-span-7">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-navy">Your alerts</h3>
          {list.state === 'ok' && <Badge tone="muted">{rules.length} active</Badge>}
        </div>
        <div className="mt-4">
          {!serviceConfigured ? (
            <EmptyState
              title="Alert service unavailable."
              description="Alerts you create will be stored and evaluated by the alert backend once it is connected."
            />
          ) : list.state === 'loading' ? (
            <LoadingState label="Loading alerts..." rows={3} />
          ) : list.state === 'unavailable' ? (
            <EmptyState icon="error" title="Unable to load alerts." description={list.error?.message} onRetry={list.refresh} />
          ) : rules.length === 0 ? (
            <EmptyState icon={Bell} title="No alerts yet." description="Create your first alert to get notified when something important happens." />
          ) : (
            <ul className="divide-y divide-border">
              {rules.map((r) => {
                const c = ALERT_CONDITIONS.find((x) => x.value === r.condition)
                return (
                  <li key={r.id} className="flex items-center gap-4 py-3.5">
                    <span className="inline-flex min-w-16 justify-center rounded-lg bg-light px-2 py-1.5 font-mono text-xs font-semibold text-navy">{r.symbol}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy">
                        {c?.label ?? r.condition}
                        {r.threshold !== null && r.threshold !== undefined && (
                          <span className="tabular ml-1.5 text-muted">
                            {r.threshold}
                            {c?.unit === '%' ? '%' : ''}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted">
                        {r.lastTriggeredAt ? `Last triggered ${formatDateTime(r.lastTriggeredAt)}` : `Created ${formatDateTime(r.createdAt)}`}
                      </p>
                    </div>
                    <Badge tone={r.status === 'active' ? 'green' : r.status === 'triggered' ? 'blue' : 'muted'} dot>
                      {r.status}
                    </Badge>
                    <button type="button" onClick={() => remove(r.id)} className="rounded-lg p-2 text-muted hover:bg-red-100 hover:text-red" aria-label={`Delete alert for ${r.symbol}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
