import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { WalletProvider } from './hooks/useWallet.jsx'
import AboutPage from './pages/About.jsx'
import AlertsPage from './pages/Alerts.jsx'
import DiscoverPage from './pages/Discover.jsx'
import HomePage from './pages/Home.jsx'
import MarketsPage from './pages/Markets.jsx'
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
