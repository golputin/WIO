import SmartAlerts from '../components/SmartAlerts.jsx'
import PageShell from './PageShell.jsx'

export default function AlertsPage() {
  return (
    <PageShell
      eyebrow="Smart alerts"
      title="Know when something important happens."
      subtitle="Price levels, unusual volume, new filings, earnings and major news — delivered as web notifications."
    >
      <SmartAlerts />
    </PageShell>
  )
}
