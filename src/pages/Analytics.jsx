import { Link } from 'react-router-dom'
import MarketDashboard from '../components/MarketDashboard.jsx'
import NewsList from '../components/NewsList.jsx'
import SymbolPicker from '../components/SymbolPicker.jsx'
import TrendingPicker from '../components/TrendingPicker.jsx'
import WhyMoving from '../components/WhyMoving.jsx'
import { Reveal } from '../components/ui.jsx'
import { useMovers } from '../hooks/useMarketData.js'
import { useSymbolParam } from '../hooks/useSymbolParam.js'
import { marketPath } from '../utils/routes.js'
import PageShell from './PageShell.jsx'

/**
 * /analytics — "Why Is It Moving?" for one asset: verified catalysts, sentiment and confidence,
 * with the evidence (price action, headlines) alongside. `?symbol=` selects the asset; without one
 * the page follows the first live trending asset.
 */
export default function AnalyticsPage() {
  const [picked, setSymbol] = useSymbolParam()
  const trending = useMovers('trending')
  const symbol = picked ?? (trending.state === 'ok' ? trending.data?.[0]?.symbol ?? null : null)

  return (
    <PageShell
      eyebrow="Analytics"
      title={symbol ? `Why is ${symbol} moving?` : 'Why is it moving?'}
      subtitle="Catalysts are detected only from retrieved sources — headlines, filings and the live tape. When nothing can be verified, we say so."
      aside={
        <div className="flex items-center gap-2">
          <SymbolPicker value={symbol} onChange={setSymbol} />
          {symbol && (
            <Link to={marketPath(symbol)} className="btn-primary !px-3.5 !py-2 text-xs">
              Full view
            </Link>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <Reveal>
          <WhyMoving symbol={symbol} />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <MarketDashboard symbol={symbol} floating={false} />
            </div>
            <div className="lg:col-span-4">
              <NewsList symbol={symbol} limit={6} title="Evidence · headlines" />
            </div>
            <div className="lg:col-span-3">
              <TrendingPicker value={symbol} onSelect={setSymbol} title="Analyse next" subtitle="Live trending assets" limit={6} />
            </div>
          </div>
        </Reveal>
      </div>
    </PageShell>
  )
}
