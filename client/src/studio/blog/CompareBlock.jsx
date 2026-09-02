import { Check, X } from 'lucide-react'
import LiveOfferTag from './LiveOfferTag.jsx'

const T = {
  sq: { best: 'Më e mira për', verdict: 'Vendimi' },
  en: { best: 'Best for', verdict: 'The verdict' }
}

// Side-by-side "X vs X" layout for compare posts. The editorial judgement
// (tagline, best-for, pros/cons, verdict) is authored in the post's meta;
// the price row underneath each side is live.
export default function CompareBlock ({ sides = [], verdict, byCity, loading, lang = 'sq' }) {
  const t = T[lang] || T.sq
  if (sides.length < 2) return null

  return (
    <section className="bl-compare">
      <div className="bl-compare__grid">
        {sides.slice(0, 2).map((side, i) => (
          <article key={side.name} className="bl-compare__side" style={{ '--d': `${i * 70}ms` }}>
            <header className="bl-compare__head">
              <h3 className="bl-compare__name">{side.name}</h3>
              {side.tagline && <p className="bl-compare__tagline">{side.tagline}</p>}
            </header>

            <LiveOfferTag name={side.name} byCity={byCity} loading={loading} lang={lang} />

            {side.best && (
              <p className="bl-compare__best"><span>{t.best}</span> {side.best}</p>
            )}

            {Array.isArray(side.pros) && side.pros.length > 0 && (
              <ul className="bl-compare__list bl-compare__list--pro">
                {side.pros.map(p => <li key={p}><Check size={15} strokeWidth={2.2} />{p}</li>)}
              </ul>
            )}
            {Array.isArray(side.cons) && side.cons.length > 0 && (
              <ul className="bl-compare__list bl-compare__list--con">
                {side.cons.map(c => <li key={c}><X size={15} strokeWidth={2.2} />{c}</li>)}
              </ul>
            )}
          </article>
        ))}
      </div>

      {verdict && (
        <div className="bl-compare__verdict">
          <span className="bl-compare__verdict-label">{t.verdict}</span>
          <p>{verdict}</p>
        </div>
      )}
    </section>
  )
}
