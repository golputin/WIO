import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { WalletProvider } from './hooks/useWallet.jsx'
import AboutPage from './pages/About.jsx'
import AlertsPage from './pages/Alerts.jsx'
import AnalyticsPage from './pages/Analytics.jsx'
import DiscoverPage from './pages/Discover.jsx'
import FilingsPage from './pages/Filings.jsx'
import HomePage from './pages/Home.jsx'
import MarketsPage from './pages/Markets.jsx'
import NewsPage from './pages/News.jsx'
import NotFoundPage from './pages/NotFound.jsx'
import RewardsPage from './pages/Rewards.jsx'
import WatchlistPage from './pages/Watchlist.jsx'

export default function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/markets/:symbol" element={<MarketsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/filings" element={<FilingsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </WalletProvider>
  )
}
