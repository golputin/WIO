import { Search } from 'lucide-react'
import { useState } from 'react'
import SearchDialog from './SearchDialog.jsx'

/** Button that opens the live asset search and reports the chosen symbol. */
export default function SymbolPicker({ value, onChange, label = 'Change asset', className = '' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`btn-secondary !px-3.5 !py-2 text-xs ${className}`}>
        <Search className="size-3.5" />
        {value ? `${value} · ${label}` : 'Search asset'}
      </button>
      <SearchDialog open={open} onClose={() => setOpen(false)} onSelect={onChange} />
    </>
  )
}
