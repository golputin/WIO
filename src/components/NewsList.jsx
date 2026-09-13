import { ExternalLink, Newspaper } from 'lucide-react'
import { providers } from '../config/environment.js'
import { useNews } from '../hooks/useMarketData.js'
import { formatRelative } from '../utils/formatters.js'
import EmptyState from './EmptyState.jsx'
import { SkeletonText } from './LoadingState.jsx'

/** Headlines from the news provider for a symbol (or the whole market when symbol is null). */
export default function NewsList({ symbol, limit = 8, title = 'Latest news', className = '' }) {
  const news = useNews({ symbol: providers.news ? symbol ?? undefined : undefined, limit })
  const items = news.state === 'ok' && Array.isArray(news.data) ? news.data : []

  return (
    <section aria-labelledby="news-heading" className={`card overflow-hidden ${className}`}>
      <header className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Newspaper className="size-4 text-blue" />
        <h2 id="news-heading" className="text-sm font-bold tracking-tight text-navy">
          {title}
          {symbol && <span className="ml-1.5 font-semibold text-muted">· {symbol}</span>}
        </h2>
      </header>
      {!providers.news ? (
        <EmptyState compact title="News provider is not configured." description="Connect VITE_NEWS_API_URL to load verified headlines." />
      ) : news.state === 'loading' ? (
        <div className="space-y-5 p-5" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <SkeletonText key={i} lines={2} />
          ))}
        </div>
      ) : news.state === 'unavailable' ? (
        <EmptyState
          compact
          icon={news.error?.reason === 'network' ? 'network' : 'error'}
          title="Unable to load news."
          description={news.error?.message}
          onRetry={news.error?.retryable ? news.refresh : undefined}
        />
      ) : items.length === 0 ? (
        <EmptyState compact icon={Newspaper} title="No recent headlines." description="Nothing verified has been published for this asset yet." />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((n) => (
            <li key={n.id ?? n.url}>
              <a
                href={n.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-start gap-3 px-5 py-3.5 transition hover:bg-bg"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug font-semibold text-navy group-hover:text-blue">{n.headline}</p>
                  <p className="mt-1 text-xs text-muted">
                    {n.source}
                    {n.publishedAt && <> · {formatRelative(n.publishedAt)}</>}
                  </p>
                </div>
                <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted group-hover:text-blue" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
