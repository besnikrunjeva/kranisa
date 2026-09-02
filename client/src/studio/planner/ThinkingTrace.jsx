import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const MOOD_LABEL = { beach: 'Plazh', city: 'Qytet', family: 'Familje', escape: 'Arratisje', quiet: 'Qetësi', friends: 'Me shoqëri' }

// An expandable trace of what the engine actually understood before matching.
// Collapsed by default (a summary line); every step is derived from real
// parsed preferences, not decoration.
function buildSteps (understood = {}, offersConsidered) {
  const steps = ['Lexova kërkesën tënde']
  if (understood.mood && MOOD_LABEL[understood.mood]) steps.push(`Stili: ${MOOD_LABEL[understood.mood]}`)
  if (understood.budgetMax) steps.push(`Buxheti: deri €${understood.budgetMax}`)
  if (understood.destination) steps.push(`Destinacioni: ${understood.destination}`)
  if (understood.longTrip) steps.push('Preferencë: pushim më i gjatë')
  if (offersConsidered) steps.push(`Krahasova ${offersConsidered} oferta reale`)
  return steps
}

export default function ThinkingTrace ({ understood, offersConsidered, ms }) {
  const [open, setOpen] = useState(false)
  const steps = buildSteps(understood, offersConsidered)
  if (steps.length <= 1) return null
  const secs = ms ? (ms / 1000).toFixed(1) : null

  return (
    <div className="pl-think" data-open={open}>
      <button type="button" className="pl-think__head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <ChevronDown size={14} className="pl-think__chev" />
        <span>{secs ? `Mendova për ${secs}s` : 'Si e mendova'}</span>
      </button>
      {open && (
        <ul className="pl-think__steps">
          {steps.map(s => (
            <li key={s}><Check size={13} strokeWidth={2.4} />{s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
