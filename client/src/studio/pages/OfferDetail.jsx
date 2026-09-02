import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Moon, UtensilsCrossed, ShieldCheck, Clock } from 'lucide-react'
import { Button, Stars, Reveal } from '../components/ui.jsx'
import { Empty } from '../components/States.jsx'
import { adaptOffer } from '../adapt.js'
import { getOffer } from '../../api/offers.js'
import ThingsToDo from '../components/ThingsToDo.jsx'
import ContactAgency from '../components/ContactAgency.jsx'

function Detail ({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--st-accent-wash)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon size={17} strokeWidth={1.7} color="var(--st-accent)" />
      </div>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--st-faint)' }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  )
}

export default function OfferDetail () {
  const { id } = useParams()
  const [offer, setOffer] = useState(undefined) // undefined = loading, null = not found

  useEffect(() => {
    setOffer(undefined)
    getOffer(id)
      .then(o => setOffer(adaptOffer(o)))
      .catch(() => setOffer(null))
  }, [id])

  if (offer === undefined) {
    return (
      <main className="st-wrap" style={{ paddingTop: 28, paddingBottom: 40 }}>
        <div className="st-skel" style={{ aspectRatio: '21 / 9', borderRadius: 'var(--st-r-lg)' }} />
        <div className="st-skel" style={{ height: 40, width: '40%', borderRadius: 8, marginTop: 32 }} />
      </main>
    )
  }

  if (offer === null) {
    return (
      <main className="st-wrap" style={{ paddingTop: 48, paddingBottom: 40 }}>
        <Empty title="Oferta nuk u gjet" body="Mund të ketë skaduar ose është hequr nga kërkimi." cta={{ to: '/ofertat', label: 'Shiko të gjitha ofertat' }} />
      </main>
    )
  }

  return (
    <main className="st-wrap" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <Link to="/ofertat" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--st-muted)', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginBottom: 22 }}>
        <ArrowLeft size={16} /> Kthehu te ofertat
      </Link>

      <Reveal index={0}>
        <div style={{ borderRadius: 'var(--st-r-lg)', overflow: 'hidden', aspectRatio: '21 / 9', background: 'var(--st-paper-2)' }}>
          <img src={offer.image} alt={offer.destination} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.15) contrast(1.02)' }} />
        </div>
      </Reveal>

      <div className="st-detail" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 44, marginTop: 36, alignItems: 'start' }}>
        <Reveal index={1} style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--st-muted)' }}>{offer.agency}</span>
              <Stars count={offer.stars} size={15} />
            </div>
            <h1 className="st-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', marginTop: 8 }}>{offer.destination}</h1>
            {offer.country && <p className="st-lede" style={{ marginTop: 6 }}>{offer.country}</p>}
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--st-serif)', fontSize: '1.2rem', fontWeight: 500, marginBottom: 18 }}>Detajet e udhëtimit</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <Detail icon={CalendarDays} label="Datat" value={`${offer.from} – ${offer.to}`} />
              <Detail icon={Moon} label="Kohëzgjatja" value={`${offer.nights} netë`} />
              <Detail icon={UtensilsCrossed} label="Ushqimi" value={offer.board} />
              {offer.verified && <Detail icon={Clock} label="Verifikuar" value={offer.verified} />}
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--st-accent-wash)', color: 'var(--st-accent)', borderRadius: 'var(--st-r-pill)', padding: '9px 16px', fontSize: 13, fontWeight: 600, width: 'fit-content' }}>
            <ShieldCheck size={16} /> Ofertë e verifikuar nga Kranisa
          </div>

          <div id="kontakto" style={{ scrollMarginTop: 96 }}>
            <h2 style={{ fontFamily: 'var(--st-serif)', fontSize: '1.2rem', fontWeight: 500, marginBottom: 14 }}>Kontakto agjencinë</h2>
            <ContactAgency match={offer} defaultOpen />
            {offer.externalLink && (
              <a className="st-link" href={offer.externalLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 14, fontSize: 13 }}>
                Shiko ofertën origjinale →
              </a>
            )}
          </div>
        </Reveal>

        <Reveal index={2} className="st-detail__buy" style={{ position: 'sticky', top: 96, background: 'var(--st-card)', border: '1px solid var(--st-line)', borderRadius: 'var(--st-r-lg)', padding: 24 }}>
          <div className="st-price st-num" style={{ fontSize: '2.1rem' }}>{offer.price} {offer.currency}</div>
          <div className="st-lede" style={{ fontSize: 13, marginTop: 2 }}>për person</div>
          <div style={{ margin: '20px 0' }} className="st-hr" />
          <Button href="#kontakto" variant="primary" size="lg" className="st-btn--block">
            Kontakto agjencinë
          </Button>
          <p className="st-lede" style={{ fontSize: 12.5, marginTop: 14, lineHeight: 1.55 }}>
            Të lidh direkt me {offer.agency}. Kranisa nuk ndërhyn në pagesë — vetëm të ndihmon të krahasosh.
          </p>
        </Reveal>
      </div>

      <ThingsToDo city={offer.destination} country={offer.country} />
    </main>
  )
}
