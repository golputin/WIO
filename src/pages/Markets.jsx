import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import FilingIntelligence from '../components/FilingIntelligence.jsx'
import MarketDashboard from '../components/MarketDashboard.jsx'
import MarketTicker from '../components/MarketTicker.jsx'
import NewsList from '../components/NewsList.jsx'
import SymbolPicker from '../components/SymbolPicker.jsx'
import WhyMoving from '../components/WhyMoving.jsx'
import { Reveal, Section, SectionHeader } from '../components/ui.jsx'
import { useMovers } from '../hooks/useMarketData.js'
import { useWatchlist } from '../hooks/useWatchlist.js'

/**
 * /markets?symbol=XYZ — full analysis view for one asset.
 * Without a symbol, defaults to the first live trending asset (never a hardcoded ticker).
 */
export default function MarketsPage() {
  const [params, setParams] = useSearchParams()
  const trending = useMovers('trending')
  const picked = params.get('symbol')?.toUpperCase() || null
  const symbol = picked ?? (trending.state === 'ok' ? trending.data?.[0]?.symbol ?? null : null)
  const watchlist = useWatchlist()
  const watched = symbol ? watchlist.has(symbol) : false

  const setSymbol = (s) => setParams(s ? { symbol: s.toUpperCase() } : {}, { replace: false })

  return (
    <>
      <Section className="!pb-6 sm:!pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            align="left"
            eyebrow="Markets"
            title={symbol ? `${symbol} at a glance.` : 'Live market intelligence.'}
            subtitle="Price, chart, verified catalysts, latest filing and headlines — all from connected live providers."
          />
          <div className="flex items-center gap-2">
            <SymbolPicker value={symbol} onChange={setSymbol} />
            {symbol && (
              <button
                type="button"
                onClick={() => (watched ? watchlist.remove(symbol) : watchlist.add(symbol))}
                className="btn-secondary !px-3.5 !py-2 text-xs"
                aria-pressed={watched}
              >
                {watched ? <BookmarkCheck className="size-3.5 text-blue" /> : <Bookmark className="size-3.5" />}
                {watched ? 'In watchlist' : 'Add to watchlist'}
              </button>
            )}
          </div>
        </div>
      </Section>

      <MarketTicker />

      <div className="container-x space-y-6 py-10 lg:py-12">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <MarketDashboard symbol={symbol} floating={false} />
            </div>
            <div className="lg:col-span-7">
              <WhyMoving symbol={symbol} embedded />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <FilingIntelligence symbol={symbol} />
            </div>
            <div className="lg:col-span-4">
              <NewsList symbol={symbol} />
            </div>
          </div>
        </Reveal>
      </div>
    </>
  )
}
