import { SearchX } from 'lucide-react'
import { Button } from './ui.jsx'

export function OfferSkeleton () {
  return (
    <div className="st-card" style={{ pointerEvents: 'none' }}>
      <div className="st-card__media st-skel" style={{ borderRadius: 0 }} />
      <div className="st-card__body">
        <div className="st-skel" style={{ height: 12, width: '40%', borderRadius: 6 }} />
        <div className="st-skel" style={{ height: 20, width: '65%', borderRadius: 6, marginTop: 4 }} />
        <div className="st-skel" style={{ height: 12, width: '80%', borderRadius: 6, marginTop: 4 }} />
        <div className="st-card__foot">
          <div className="st-skel" style={{ height: 22, width: 70, borderRadius: 6 }} />
          <div className="st-skel" style={{ height: 12, width: 60, borderRadius: 6 }} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid ({ count = 6, cols = 'repeat(3, 1fr)' }) {
  return (
    <div className="st-grid" style={{ gridTemplateColumns: cols }}>
      {Array.from({ length: count }, (_, i) => <OfferSkeleton key={i} />)}
    </div>
  )
}

export function Empty ({ title, body, cta }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', border: '1px solid var(--st-line)', borderRadius: 'var(--st-r-lg)', background: 'var(--st-card)' }}>
      <div style={{ width: 52, height: 52, margin: '0 auto 16px', borderRadius: 14, background: 'var(--st-paper-2)', display: 'grid', placeItems: 'center' }}>
        <SearchX size={22} color="var(--st-muted)" />
      </div>
      <h3 style={{ fontFamily: 'var(--st-serif)', fontSize: '1.3rem', fontWeight: 500 }}>{title}</h3>
      {body && <p className="st-lede" style={{ marginTop: 8, maxWidth: '42ch', marginInline: 'auto', fontSize: 14.5 }}>{body}</p>}
      {cta && <div style={{ marginTop: 20 }}><Button to={cta.to}>{cta.label}</Button></div>}
    </div>
  )
}
