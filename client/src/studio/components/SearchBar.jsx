import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane } from 'lucide-react'
import { Button } from './ui.jsx'
import DestinationField from './DestinationField.jsx'
import DateRangeField from './DateRangeField.jsx'
import { listDestinations } from '../../api/destinations.js'

// Wired to the real destinations API. Destination is required; dates are
// optional (the backend filters by them when present). Submitting runs a
// real search on the results screen.
export default function SearchBar ({ initialDestinationId = '', initialFrom = '', initialTo = '' }) {
  const navigate = useNavigate()
  const [destinations, setDestinations] = useState([])
  const [destinationsError, setDestinationsError] = useState(false)
  const [destinationId, setDestinationId] = useState(initialDestinationId)
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const [invalid, setInvalid] = useState(false)
  // Only one field's dropdown open at a time: 'dest' | 'date' | null.
  const [openField, setOpenField] = useState(null)

  useEffect(() => { listDestinations().then(setDestinations).catch(() => setDestinationsError(true)) }, [])
  useEffect(() => { if (initialDestinationId) setDestinationId(initialDestinationId) }, [initialDestinationId])

  function submit (e) {
    e.preventDefault()
    if (!destinationId) { setInvalid(true); return }
    const q = new URLSearchParams({ destinationId: String(destinationId) })
    if (from && to) { q.set('dateFrom', from); q.set('dateTo', to) }
    navigate(`/rezultatet?${q.toString()}`)
  }

  return (
    <form className="st-search" onSubmit={submit} data-invalid={invalid || undefined}>
      <label className="st-search__field">
        <span className="st-search__label">Destinacioni</span>
        <DestinationField
          destinations={destinations}
          error={destinationsError}
          value={destinationId}
          onChange={id => { setDestinationId(id); if (id) setInvalid(false) }}
          placeholder="Zgjidh destinacionin"
          open={openField === 'dest'}
          onOpenChange={o => setOpenField(o ? 'dest' : null)}
        />
      </label>

      <div className="st-search__field">
        <span className="st-search__label">Datat</span>
        <DateRangeField
          from={from}
          to={to}
          onChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
          isOpen={openField === 'date'}
          onOpenChange={o => setOpenField(o ? 'date' : null)}
        />
      </div>

      <Button type="submit" className="st-search__go">
        <Plane size={16} /> Kërko
      </Button>
    </form>
  )
}
