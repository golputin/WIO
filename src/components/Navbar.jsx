import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_LINKS } from '../data/navigation.js'
import MarketLensLogo from './MarketLensLogo.jsx'
import MarketStatusPill from './MarketStatusPill.jsx'
import SearchDialog from './SearchDialog.jsx'
import WalletConnect from './WalletConnect.jsx'

function DesktopLink({ to, end, label }) {
  return (
    <NavLink to={to} end={end} className="group relative block px-3 py-2 text-[13px] font-medium">
      {({ isActive }) => (
        <>
          <span className={`transition-colors ${isActive ? 'text-fg' : 'text-muted group-hover:text-fg-2'}`}>{label}</span>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-x-3 -bottom-[1px] h-px bg-gold"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  // Mobile menu is open only while the route it was opened on is still active — no effect needed.
  const [menuOpenedAt, setMenuOpenedAt] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const { scrollY } = useScroll()
  const location = useLocation()
  const menuOpen = menuOpenedAt === location.pathname
  const setMenuOpen = (next) => setMenuOpenedAt((typeof next === 'function' ? next(menuOpen) : next) ? location.pathname : null)

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 12))

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const compact = scrolled || menuOpen

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          compact ? 'border-border bg-bg/75 backdrop-blur-xl' : 'border-transparent bg-bg/0'
        }`}
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav
          className={`container-x flex items-center justify-between gap-4 transition-[height] duration-300 ${
            compact ? 'h-14' : 'h-16'
          }`}
          aria-label="Primary"
        >
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/" className="shrink-0 rounded-md" aria-label="MarketLens Capital home">
              <MarketLensLogo height={26} />
            </Link>
            <MarketStatusPill className="hidden lg:inline-flex" />
          </div>

          <ul className="hidden items-center lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <DesktopLink {...l} />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface/50 px-2.5 text-sm text-muted transition hover:border-border-strong hover:text-fg md:w-52 md:justify-between md:px-3"
              aria-label="Search assets"
            >
              <span className="inline-flex items-center gap-2">
                <Search className="size-4" />
                <span className="hidden text-[13px] md:inline">Search markets</span>
              </span>
              <kbd className="hidden rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-dim md:inline">
                ⌘K
              </kbd>
            </button>
            <div className="hidden sm:block">
              <WalletConnect size="sm" />
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-fg-2 transition hover:bg-surface-2 lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-border bg-bg/95 backdrop-blur-xl lg:hidden"
            >
              <div className="container-x py-4">
                <MarketStatusPill className="mb-3" />
                <ul className="divide-y divide-border">
                  {NAV_LINKS.map((l) => (
                    <li key={l.to}>
                      <NavLink
                        to={l.to}
                        end={l.end}
                        className={({ isActive }) =>
                          `flex items-center justify-between py-3 text-[15px] font-medium transition-colors ${
                            isActive ? 'text-gold' : 'text-fg-2 hover:text-fg'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {l.label}
                            {isActive && <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-border pt-4 sm:hidden">
                  <WalletConnect className="[&>button]:w-full [&>button]:justify-center" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
