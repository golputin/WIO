/**
 * Skeleton loaders. Shapes only — never numbers.
 */
export function Skeleton({ className = '', style }) {
  return <span aria-hidden="true" style={style} className={`skeleton block ${className}`} />
}

export function SkeletonText({ lines = 3, className = '' }) {
  const widths = ['w-11/12', 'w-2/3', 'w-4/5', 'w-1/2', 'w-3/4']
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${widths[i % widths.length]}`} />
      ))}
    </div>
  )
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <div className="flex items-center gap-4 py-3" aria-hidden="true">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Skeleton key={i} className="hidden h-3.5 w-16 sm:block" />
      ))}
    </div>
  )
}

export default function LoadingState({ label = 'Loading live data...', rows = 3, className = '' }) {
  return (
    <div role="status" aria-live="polite" className={`px-1 ${className}`}>
      <p className="mb-2 text-xs font-medium text-muted">{label}</p>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  )
}
