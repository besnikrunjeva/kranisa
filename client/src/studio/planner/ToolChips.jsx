import { Search, SlidersHorizontal, Timer } from 'lucide-react'

const MOOD_LABEL = { beach: 'Plazh', city: 'Qytet', family: 'Familje', escape: 'Arratisje', quiet: 'Qetësi', friends: 'Me shoqëri' }

// Compact "what the engine did" chips under a reply — the inline tool-call
// labels from the reference, made truthful: real offer count, real filters,
// real latency.
export default function ToolChips ({ offersConsidered, understood = {}, ms }) {
  const chips = []
  if (offersConsidered) chips.push({ icon: Search, text: `Kërkova ${offersConsidered} oferta` })
  const filter = understood.mood ? MOOD_LABEL[understood.mood] : (understood.budgetMax ? `≤ €${understood.budgetMax}` : null)
  if (filter) chips.push({ icon: SlidersHorizontal, text: `Filtrova: ${filter}` })
  if (ms) chips.push({ icon: Timer, text: `${(ms / 1000).toFixed(1)}s` })
  if (!chips.length) return null

  return (
    <div className="pl-toolchips">
      {chips.map(({ icon: Icon, text }) => (
        <span key={text} className="pl-toolchip"><Icon size={12} strokeWidth={2} />{text}</span>
      ))}
    </div>
  )
}
