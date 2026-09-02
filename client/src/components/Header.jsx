import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { cn } from '../lib/utils.js'
import LanguageToggle from './LanguageToggle.jsx'
import { Button, buttonVariants } from './ui/button.tsx'
import { MenuToggleIcon } from './ui/menu-toggle-icon.jsx'
import { useScroll } from './ui/use-scroll.js'

// Adapted from 21st.dev's "Header 2" (sshahaider) — the scroll-based
// floating-pill styling and mobile drawer are kept, the wordmark/nav/CTAs
// are swapped for Kranisa's own. Rendered once in App.jsx so every page
// shares it instead of each page duplicating its own top bar.
export default function Header () {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const scrolled = useScroll(10)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 mx-auto mt-8 w-full max-w-5xl border-b border-transparent md:rounded-full md:border md:transition-all md:ease-out',
        {
          'bg-card/95 supports-[backdrop-filter]:bg-card/80 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow-sm': scrolled && !open,
          'bg-card/95': open
        }
      )}
    >
      <nav className={cn('flex h-16 w-full items-center justify-between px-5 md:h-14 md:transition-all md:ease-out', { 'md:px-3': scrolled })}>
        <Link to="/" className="font-wordmark text-[1.5rem] font-bold text-ink shrink-0">
          Kranisa
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/ofertat" className={buttonVariants({ variant: 'outline' })}>
            {t('nav.allOffers')}
          </Link>
          <LanguageToggle />
          <Link to="/admin/login" className={buttonVariants({ variant: 'outline' })}>
            {t('nav.admin')}
          </Link>
        </div>

        <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
          <MenuToggleIcon open={open} className="size-6" duration={300} />
        </Button>
      </nav>

      <div
        aria-hidden={!open}
        className={cn(
          'bg-card/95 fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-border md:hidden',
          'transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          open ? 'opacity-100 translate-y-0' : 'pointer-events-none -translate-y-2 opacity-0'
        )}
      >
        <div className="flex h-full w-full flex-col justify-between gap-y-2 p-4">
          <div className="grid gap-y-2">
            <Link
              to="/ofertat"
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: 'ghost', className: 'justify-start' })}
            >
              {t('nav.allOffers')}
            </Link>
          </div>
          <div className="flex flex-col items-center gap-4">
            <LanguageToggle />
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: 'outline', className: 'w-full' })}
            >
              {t('nav.admin')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
