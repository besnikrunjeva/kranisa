import { Link } from 'react-router-dom'

export default function StudioFooter () {
  const year = new Date().getFullYear()
  return (
    <footer className="st-footer">
      <div className="st-wrap">
        <div className="st-footer__grid">
          <div className="st-footer__col">
            <div className="st-word" style={{ fontSize: '1.5rem' }}>Kranisa<span>.</span></div>
            <p className="st-lede" style={{ marginTop: 12, maxWidth: '32ch', fontSize: 14 }}>
              Të gjitha ofertat e agjencive të Kosovës dhe Shqipërisë, në një vend — pa hapur dhjetë faqe.
            </p>
          </div>
          <div className="st-footer__col">
            <h4>Faqet</h4>
            <Link to="/">Ballina</Link>
            <Link to="/ofertat">Të gjitha ofertat</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/planner">Kranisa AI</Link>
          </div>
          <div className="st-footer__col">
            <h4>Për agjencitë</h4>
            <p className="st-lede" style={{ maxWidth: '30ch', fontSize: 14, marginBottom: 12 }}>
              Ke një agjenci? Listo ofertat e tua falas.
            </p>
            <a className="st-link" href="mailto:hello@kranisa.al">Na shkruaj →</a>
          </div>
        </div>
        <div className="st-footer__base">
          <span>© {year} Kranisa. Të gjitha të drejtat e rezervuara.</span>
          <span style={{ color: 'var(--st-faint)' }}>Kosovë · Shqipëri</span>
        </div>
      </div>
    </footer>
  )
}
