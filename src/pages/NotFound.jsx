import { Link } from 'react-router-dom'
import { Section } from '../components/ui.jsx'

export default function NotFoundPage() {
  return (
    <Section>
      <div className="mx-auto max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy">Page not found</h1>
        <p className="mt-3 text-muted">The page you requested does not exist or has moved.</p>
        <Link to="/" className="btn-primary mt-6">
          Back to home
        </Link>
      </div>
    </Section>
  )
}
