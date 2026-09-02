import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import ThemeSwitcher from './ThemeSwitcher.jsx'
import { buttonVariants } from './ui/button.tsx'

// Adapted from 21st.dev's "Footer section" (arihantcodes_1f7b8c4d). The
// original's newsletter signup, social icons, and fake address block were
// placeholder content with nowhere real to go — dropped in favor of the
// site's own tagline, real internal routes, and the "list your agency"
// pitch that was already written in the i18n files but never actually
// rendered anywhere. The dark-mode toggle is kept, now wired to a real
// dark variant of Peak & Route (see :root.dark in index.css).
export default function Footer () {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-wordmark text-xl font-bold text-ink mb-3">Kranisa</p>
            <p className="font-body text-[14px] text-muted-2 max-w-[30ch]">{t('footer.tagline')}</p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-ink mb-4">{t('footer.nav')}</h3>
            <nav className="flex flex-col gap-2.5 font-body text-[14px] text-muted-2">
              <Link to="/" className="w-fit hover:text-primary transition-colors">{t('nav.home')}</Link>
              <Link to="/ofertat" className="w-fit hover:text-primary transition-colors">{t('nav.allOffers')}</Link>
            </nav>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-ink mb-4">{t('agency.headline')}</h3>
            <p className="font-body text-[14px] text-muted-2 mb-4 max-w-[30ch]">{t('agency.body')}</p>
            <a href="mailto:hello@kranisa.al" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              {t('agency.cta')}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
          <p className="font-body text-[13px] text-muted-2">© {year} Kranisa. {t('footer.rights')}</p>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
