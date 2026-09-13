import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import DailyBrief from '../components/DailyBrief.jsx'
import NewsList from '../components/NewsList.jsx'
import SymbolPicker from '../components/SymbolPicker.jsx'
import TrendingPicker from '../components/TrendingPicker.jsx'
import { Reveal } from '../components/ui.jsx'
import { useSymbolParam } from '../hooks/useSymbolParam.js'
import { marketPath } from '../utils/routes.js'
import PageShell from './PageShell.jsx'

/** /news — verified headlines (market-wide or filtered by `?symbol=`) plus the daily brief. */
export default function NewsPage() {
  const [symbol, setSymbol] = useSymbolParam()

  return (
    <PageShell
      eyebrow="News"
      title={symbol ? `${symbol} headlines.` : 'Verified market headlines.'}
      subtitle="Every story links to its original publisher. Filter by asset to see only the coverage that matters to a position."
      aside={
        <div className="flex items-center gap-2">
          <SymbolPicker value={symbol} onChange={setSymbol} label="Change filter" />
          {symbol && (
            <>
              <button type="button" onClick={() => setSymbol(null)} className="btn-secondary !px-3.5 !py-2 text-xs" aria-label="Clear asset filter">
                <X className="size-3.5" /> Clear
              </button>
              <Link to={marketPath(symbol)} className="btn-primary !px-3.5 !py-2 text-xs">
                Analyse {symbol}
              </Link>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <NewsList symbol={symbol} limit={25} title={symbol ? 'Coverage' : 'Latest headlines'} />
            </div>
            <div className="lg:col-span-4">
              <TrendingPicker value={symbol} onSelect={setSymbol} subtitle="Tap an asset to filter headlines" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <DailyBrief />
        </Reveal>
      </div>
    </PageShell>
  )
}
