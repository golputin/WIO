import NewsList from '../components/NewsList.jsx'
import Watchlist from '../components/Watchlist.jsx'
import { Reveal } from '../components/ui.jsx'
import PageShell from './PageShell.jsx'

export default function WatchlistPage() {
  return (
    <PageShell
      eyebrow="Watchlist"
      title="Track what matters to you."
      subtitle="Live prices, daily change and market activity for the assets you follow — with one-tap access to analysis."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Reveal>
            <Watchlist />
          </Reveal>
        </div>
        <div className="lg:col-span-4">
          <Reveal delay={0.06}>
            <NewsList title="Market headlines" />
          </Reveal>
        </div>
      </div>
    </PageShell>
  )
}
