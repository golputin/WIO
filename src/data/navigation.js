/** Static product navigation — copy only, no market data. */

export const NAV_LINKS = [
  { label: 'Markets', to: '/markets' },
  { label: 'Discover', to: '/discover' },
  { label: 'Watchlist', to: '/watchlist' },
  { label: 'Alerts', to: '/alerts' },
  { label: 'Rewards', to: '/rewards' },
]

export const FOOTER_COLUMNS = [
  {
    heading: 'Product',
    links: NAV_LINKS,
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Documentation', to: '/docs', external: false },
      { label: 'Blog', to: '/blog' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', to: '/legal/terms' },
      { label: 'Privacy', to: '/legal/privacy' },
      { label: 'Risk Disclosure', to: '/legal/risk' },
      { label: 'Reward Disclosure', to: '/legal/rewards' },
    ],
  },
]
