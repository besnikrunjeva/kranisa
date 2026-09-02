import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

// Homepage showcase for the Kranisa AI. A dark band that echoes the
// Planner's own surface, with a static mock conversation that explains the
// feature at a glance. Motion: a one-time staggered reveal (explanatory),
// no looping — all reduced-motion guarded in CSS.
export default function PlannerPromo () {
  return (
    <section className="st-wrap pp-wrap">
      <div className="pp">
        <div className="pp__glow" aria-hidden="true" />

        <div className="pp__grid">
          <div className="pp__copy">
            <span className="pp__badge"><Sparkles size={13} /> Kranisa AI</span>
            <h2 className="pp__title">Nuk di ku të shkosh? <em>Pyet Kranisa-n.</em></h2>
            <p className="pp__lede">
              Përshkruaj pushimin që ke në mendje — vend, stil a buxhet — dhe Planeri
              të gjen ofertat që përputhen, nga inventari real.
            </p>
            <div className="pp__actions">
              <Link to="/planner" className="pp__cta">Provo Planner-in <ArrowRight size={16} /></Link>
              <span className="pp__hint">Falas · bazuar në oferta reale</span>
            </div>
          </div>

          <div className="pp__preview" aria-hidden="true">
            <div className="pp__msg pp__msg--ai" style={{ '--d': '60ms' }}>
              <span className="pp__avatar"><Sparkles size={12} /></span>
              <span className="pp__bubble">Përshëndetje 👋 Ç’kërkon këtë herë?</span>
            </div>
            <div className="pp__msg pp__msg--me" style={{ '--d': '150ms' }}>
              <span className="pp__bubble pp__bubble--me">Plazh nën €450</span>
            </div>
            <div className="pp__msg pp__msg--ai" style={{ '--d': '260ms' }}>
              <span className="pp__avatar"><Sparkles size={12} /></span>
              <span className="pp__bubble">
                Vlorë bie më së miri.
                <span className="pp__offer">
                  <strong>Vlorë</strong>
                  <em>96% përputhje</em>
                  <small>3 netë · nga €199</small>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
