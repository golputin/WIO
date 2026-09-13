import { AlertCircle, Plug, RefreshCw, WifiOff } from 'lucide-react'

const ICONS = {
  config: Plug,
  error: AlertCircle,
  network: WifiOff,
}

/**
 * Intentional "no data" surface. Used for: provider not configured, transient errors, empty results.
 * Never renders placeholder numbers.
 */
export default function EmptyState({
  icon = 'config',
  title,
  description,
  action,
  onRetry,
  compact = false,
  className = '',
}) {
  const Icon = typeof icon === 'string' ? ICONS[icon] ?? Plug : icon
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center text-center ${compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12'} ${className}`}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full bg-surface-2 text-gold ${compact ? 'size-9' : 'size-12'}`}
      >
        <Icon className={compact ? 'size-4' : 'size-5'} strokeWidth={1.75} />
      </span>
      <div>
        <p className={`font-semibold text-fg ${compact ? 'text-sm' : 'text-base'}`}>{title}</p>
        {description && <p className={`mt-1 text-muted ${compact ? 'text-xs' : 'text-sm'}`}>{description}</p>}
      </div>
      {(action || onRetry) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-secondary !px-4 !py-2 text-xs">
              <RefreshCw className="size-3.5" /> Try again
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}

/** Map a hook error to the right EmptyState props. */
export function unavailableProps(error, labels = {}) {
  const reason = error?.reason
  if (reason === 'not_configured') {
    return {
      icon: 'config',
      title: labels.notConfiguredTitle ?? 'Data unavailable',
      description: labels.notConfiguredDescription ?? 'Connect a data provider to continue.',
    }
  }
  if (reason === 'network') {
    return { icon: 'network', title: 'Network connection lost.', description: 'Check your connection and try again.' }
  }
  return {
    icon: 'error',
    title: labels.errorTitle ?? 'Unable to load data.',
    description: error?.message ?? labels.errorDescription,
  }
}
