import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_LINKS } from '../data/navigation.js'
import MarketLensLogo from './MarketLensLogo.jsx'
import SearchDialog from './SearchDialog.jsx'
import WalletConnect from './WalletConnect.jsx'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { scrollY } = useScroll()
  const location = useLocation()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 8))

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

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

  const linkCls = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-light text-blue' : 'text-navy/80 hover:bg-light hover:text-navy'
    }`

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled
            ? 'border-border/80 bg-white/70 shadow-[0_1px_0_rgba(11,31,58,0.02)] backdrop-blur-xl'
            : 'border-transparent bg-bg/0'
        }`}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="container-x flex h-16 items-center justify-between gap-4" aria-label="Primary">
          <Link to="/" className="shrink-0 rounded-lg" aria-label="MarketLens home">
            <MarketLensLogo height={28} />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={linkCls}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="btn-ghost !px-2.5 !py-2 sm:!px-3"
              aria-label="Search assets"
            >
              <Search className="size-4" />
              <span className="hidden text-muted md:inline">Search</span>
              <kbd className="hidden rounded-md border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-muted md:inline">
                ⌘K
              </kbd>
            </button>
            <div className="hidden sm:block">
              <WalletConnect size="sm" />
            </div>
            <Link to="/rewards" className="btn-primary hidden !px-4 !py-2 text-xs sm:inline-flex">
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="btn-ghost !px-2.5 !py-2 lg:hidden"
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
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-border bg-white/95 backdrop-blur-xl lg:hidden"
            >
              <div className="container-x flex flex-col gap-1 py-3">
                {NAV_LINKS.map((l) => (
                  <NavLink key={l.to} to={l.to} className={linkCls}>
                    {l.label}
                  </NavLink>
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3 sm:hidden">
                  <WalletConnect />
                  <Link to="/rewards" className="btn-primary">
                    Get Started
                  </Link>
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
