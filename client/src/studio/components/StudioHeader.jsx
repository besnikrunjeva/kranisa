import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui.jsx'
import { useI18n } from '../../i18n/I18nContext.jsx'

const NAV = {
  sq: { planner: 'Kranisa AI', blog: 'Blog', offers: 'Të gjitha ofertat', cta: 'Kërko oferta' },
  en: { planner: 'Kranisa AI', blog: 'Blog', offers: 'All offers', cta: 'Search offers' }
}

// Compact SQ/EN switch. Drives the existing i18n context; today the blog reads
// it, and the rest of the site can adopt it incrementally.
function LangToggle () {
  const { lang, setLang } = useI18n()
  return (
    <div className="st-lang" role="group" aria-label="Language">
      {['sq', 'en'].map(code => (
        <button
          key={code}
          type="button"
          className="st-lang__btn"
          data-active={lang === code}
          onClick={() => setLang(code)}
        >{code.toUpperCase()}</button>
      ))}
    </div>
  )
}

export default function StudioHeader () {
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { lang } = useI18n()
  const nav = NAV[lang] || NAV.sq

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // On the immersive chat, drop the marketing nav, CTA and the language toggle
  // (the AI replies in whatever language you write). Just the brand — the quiet
  // way back. A calm bar suits a chat page.
  const slim = pathname.startsWith('/planner')

  return (
    <header className="st-header" data-scrolled={scrolled} data-slim={slim || undefined}>
      <div className="st-wrap st-header__row">
        <Link to="/" className="st-word">Kranisa<span>.</span></Link>
        {!slim && (
          <nav className="st-nav">
            <Link to="/planner" data-current={pathname === '/planner'}>{nav.planner}</Link>
            <Link to="/blog" data-current={pathname.startsWith('/blog')}>{nav.blog}</Link>
            <Link to="/ofertat" data-current={pathname === '/ofertat'}>{nav.offers}</Link>
            <LangToggle />
            <Button to="/" size="sm">{nav.cta}</Button>
          </nav>
        )}
      </div>
    </header>
  )
}
