import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Clock, ShieldCheck } from 'lucide-react'
import { Button, Reveal } from '../components/ui.jsx'
import SearchBar from '../components/SearchBar.jsx'
import PlannerPromo from '../components/PlannerPromo.jsx'
import OfferCard from '../components/OfferCard.jsx'
import { SkeletonGrid } from '../components/States.jsx'
import { FAQS } from '../data.js'
import { adaptOffer } from '../adapt.js'
import { listAllOffers } from '../../api/offers.js'
import { listPopularDestinations } from '../../api/destinations.js'
import { destinationPhoto } from '../../lib/destinationPhoto.js'

function PopularTile ({ dest, index }) {
  const [city, country] = (dest.name || '').split(', ')
  return (
    <Reveal index={index} step={45} as={Link} to={`/rezultatet?destinationId=${dest.id}`} className="st-card" style={{ display: 'block' }}>
      <div className="st-card__media" style={{ aspectRatio: '3 / 4' }}>
        <img className="st-card__img" src={destinationPhoto(dest.name, 500, 650)} alt={city || dest.name} loading="lazy" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.6), transparent 55%)' }} />
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14, color: '#fff' }}>
          {country && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>{country}</div>}
          <div style={{ fontFamily: 'var(--st-serif)', fontSize: '1.3rem', fontWeight: 500, letterSpacing: '-0.01em', marginTop: 2 }}>{city || dest.name}</div>
        </div>
      </div>
    </Reveal>
  )
}

const TRUST = [
  { icon: BadgeCheck, title: 'Vetëm oferta reale', body: 'Çdo ofertë verifikohet me dorë përpara se të publikohet.' },
  { icon: Clock, title: 'Çmime të freskëta', body: 'Sheh sa kohë më parë është verifikuar çdo çmim.' },
  { icon: ShieldCheck, title: 'Pa komision', body: 'Rezervon dhe paguan direkt me agjencinë. Kranisa është falas.' }
]

export default function Home () {
  const [offers, setOffers] = useState(null)
  const [popular, setPopular] = useState([])

  useEffect(() => {
    listAllOffers()
      .then(list => {
        const adapted = list.map(adaptOffer).sort((a, b) => a.freshHours - b.freshHours)
        setOffers(adapted.slice(0, 6))
      })
      .catch(() => setOffers([]))
    listPopularDestinations(6).then(setPopular).catch(() => {})
  }, [])

  return (
    <main>
      {/* Hero */}
      <section className="st-wrap" style={{ paddingTop: 64, paddingBottom: 8 }}>
        <div className="st-hero">
          <div>
            <Reveal index={0}><p className="st-eyebrow">Kosovë · Shqipëri · Oferta pushimesh</p></Reveal>
            <Reveal index={1}>
              <h1 className="st-display" style={{ fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', marginTop: 18, maxWidth: '15ch' }}>
                Të gjitha ofertat e agjencive, <em>në një vend.</em>
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="st-lede" style={{ marginTop: 20, maxWidth: '46ch' }}>
                Krahaso çmime, data dhe destinacione nga agjencitë e udhëtimit — pa hapur dhjetë faqe Facebook.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal index={3} style={{ marginTop: 36, width: '100%', position: 'relative', zIndex: 20 }}>
          <SearchBar />
        </Reveal>
        <Reveal index={4} style={{ marginTop: 18, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="st-verified" style={{ fontSize: 12.5 }}>Falas · pa regjistrim · lidhu direkt me agjencinë</span>
          <Link to="/ofertat" className="st-link" style={{ fontSize: 13 }}>Shfleto çdo ofertë →</Link>
        </Reveal>
      </section>

      {/* Popular */}
      {popular.length > 0 && (
        <section className="st-wrap" style={{ marginTop: 88 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
            <h2 className="st-h2">Destinacione popullore</h2>
            <Link to="/ofertat" className="st-link" style={{ fontSize: 14 }}>Të gjitha →</Link>
          </div>
          <div className="st-grid st-home-popular" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {popular.map((d, i) => <PopularTile key={d.id} dest={d} index={i} />)}
          </div>
        </section>
      )}

      {/* Planner showcase */}
      <PlannerPromo />

      {/* Trust */}
      <section className="st-wrap" style={{ marginTop: 96 }}>
        <div className="st-home-trust" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, borderTop: '1px solid var(--st-line)', borderBottom: '1px solid var(--st-line)', padding: '44px 0' }}>
          {TRUST.map(({ icon: Icon, title, body }) => (
            <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Icon size={22} strokeWidth={1.6} color="var(--st-accent)" />
              <h3 style={{ fontFamily: 'var(--st-serif)', fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</h3>
              <p className="st-lede" style={{ fontSize: 14.5 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newest offers */}
      <section className="st-wrap" style={{ marginTop: 96 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
          <div>
            <p className="st-eyebrow">Të shtuara së fundmi</p>
            <h2 className="st-h2" style={{ marginTop: 8 }}>Ofertat më të reja</h2>
          </div>
          <Link to="/ofertat" className="st-link" style={{ fontSize: 14 }}>Shiko të gjitha →</Link>
        </div>
        {offers === null
          ? <SkeletonGrid count={6} />
          : (
            <div className="st-grid">
              {offers.map((o, i) => (
                <Reveal key={o.id} index={i} step={55}><OfferCard offer={o} tag={i === 0 ? 'Më e freskët' : undefined} /></Reveal>
              ))}
            </div>
          )}
      </section>

      {/* FAQ */}
      <section className="st-wrap st-wrap--narrow" style={{ marginTop: 104 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="st-eyebrow">Pyetje të shpeshta</p>
          <h2 className="st-h2" style={{ marginTop: 10 }}>Gjithçka që duhet të dish</h2>
        </div>
        <div className="st-home-faq" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 48px' }}>
          {FAQS.map(f => (
            <div key={f.q}>
              <h3 style={{ fontFamily: 'var(--st-serif)', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 8 }}>{f.q}</h3>
              <p className="st-lede" style={{ fontSize: 14.5 }}>{f.a}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Button to="/ofertat" size="lg">Shfleto ofertat <ArrowRight size={16} /></Button>
        </div>
      </section>
    </main>
  )
}
