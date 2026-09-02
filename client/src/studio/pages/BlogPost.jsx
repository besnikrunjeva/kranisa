import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Reveal } from '../components/ui.jsx'
import Prose from '../blog/Prose.jsx'
import CompareBlock from '../blog/CompareBlock.jsx'
import LiveOfferTag from '../blog/LiveOfferTag.jsx'
import ThingsToDo from '../components/ThingsToDo.jsx'
import { getPost } from '../blog/loader.js'
import { useLiveOffers, pickDestination } from '../blog/liveOffers.js'
import { destinationPhoto } from '../../lib/destinationPhoto.js'
import { markImgLoaded, onImgLoad } from '../blog/markImgLoaded.js'
import { useI18n } from '../../i18n/I18nContext.jsx'

const COPY = {
  sq: {
    back: 'Të gjitha postimet', notFound: 'Ky postim nuk u gjet.',
    fallback: 'Ky postim ende nuk është përkthyer — po e tregojmë në shqip.',
    current: 'Oferta aktive tani', ctaTitle: 'Gati për të krahasuar?',
    ctaText: 'Shiko të gjitha ofertat e verifikuara ose lër Kranisa AI të zgjedhë për ty.',
    ctaAll: 'Të gjitha ofertat', ctaPlanner: 'Provo Kranisa AI',
    type: { article: 'Artikull', compare: 'Krahasim', guide: 'Udhëzues' }
  },
  en: {
    back: 'All posts', notFound: 'This post was not found.',
    fallback: 'This post isn’t translated yet — showing the Albanian version.',
    current: 'Live offers right now', ctaTitle: 'Ready to compare?',
    ctaText: 'Browse every verified offer, or let Kranisa AI pick for you.',
    ctaAll: 'All offers', ctaPlanner: 'Try Kranisa AI',
    type: { article: 'Article', compare: 'Comparison', guide: 'Guide' }
  }
}

function formatDate (iso, lang) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function upsertMeta (selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value))
  return el
}

function upsertCanonical (href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  return el
}

function restoreHeadValue (selector, attrs, previous) {
  const el = document.head.querySelector(selector)
  if (previous === null) {
    if (el) el.remove()
    return
  }
  upsertMeta(selector, { ...attrs, content: previous })
}

function restoreCanonical (previous) {
  const el = document.head.querySelector('link[rel="canonical"]')
  if (previous === null) {
    if (el) el.remove()
    return
  }
  upsertCanonical(previous)
}

export default function BlogPost () {
  const { slug } = useParams()
  const { lang } = useI18n()
  const t = COPY[lang] || COPY.sq
  const post = getPost(slug, lang)
  const { byCity, loading } = useLiveOffers()

  useEffect(() => {
    if (!post) return
    const meta = post.meta
    const prevTitle = document.title
    const prevDescription = document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? null
    const prevOgTitle = document.head.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? null
    const prevOgDescription = document.head.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? null
    const prevOgType = document.head.querySelector('meta[property="og:type"]')?.getAttribute('content') ?? null
    const prevTwitterCard = document.head.querySelector('meta[name="twitter:card"]')?.getAttribute('content') ?? null
    const prevCanonical = document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null

    const title = meta.seoTitle || `${meta.title} · Kranisa`
    const description = meta.seoDescription || meta.excerpt || ''
    const canonical = `${window.location.origin}/blog/${meta.slug}`

    document.title = title
    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description })
      upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    }
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'article' })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertCanonical(canonical)

    return () => {
      document.title = prevTitle
      restoreHeadValue('meta[name="description"]', { name: 'description' }, prevDescription)
      restoreHeadValue('meta[property="og:title"]', { property: 'og:title' }, prevOgTitle)
      restoreHeadValue('meta[property="og:description"]', { property: 'og:description' }, prevOgDescription)
      restoreHeadValue('meta[property="og:type"]', { property: 'og:type' }, prevOgType)
      restoreHeadValue('meta[name="twitter:card"]', { name: 'twitter:card' }, prevTwitterCard)
      restoreCanonical(prevCanonical)
    }
  }, [post])

  if (!post) {
    return (
      <main className="st-wrap st-wrap--narrow" style={{ paddingTop: 80, paddingBottom: 96 }}>
        <p className="st-lede">{t.notFound}</p>
        <Link to="/blog" className="st-link" style={{ marginTop: 16, display: 'inline-block' }}>← {t.back}</Link>
      </main>
    )
  }

  const { meta, body } = post
  const cover = meta.cover || destinationPhoto(meta.coverKeyword || (meta.destinations && meta.destinations[0]) || meta.title, 1400, 760)
  const destinations = Array.isArray(meta.destinations) ? meta.destinations : []
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}/blog/${meta.slug}` : `/blog/${meta.slug}`
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.seoDescription || meta.excerpt || '',
    datePublished: meta.date,
    dateModified: meta.updated || meta.date,
    author: { '@type': 'Organization', name: 'Kranisa' },
    publisher: { '@type': 'Organization', name: 'Kranisa' },
    mainEntityOfPage: canonical,
    image: [cover],
    inLanguage: lang === 'en' ? 'en' : 'sq'
  }

  return (
    <main className="bl-post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="st-wrap st-wrap--narrow">
        <Reveal index={0}>
          <Link to="/blog" className="bl-post__back"><ArrowLeft size={15} /> {t.back}</Link>
        </Reveal>
        <Reveal index={1}>
          <div className="bl-post__kicker">
            {t.type[meta.type] && <span className="bl-post__type">{t.type[meta.type]}</span>}
            <span className="bl-post__date">{formatDate(meta.date, lang)}</span>
          </div>
        </Reveal>
        <Reveal index={2}><h1 className="bl-post__title">{meta.title}</h1></Reveal>
        {meta.excerpt && <Reveal index={3}><p className="bl-post__lede st-lede">{meta.excerpt}</p></Reveal>}
        {!post.translated && <p className="bl-post__fallback">{t.fallback}</p>}
      </div>

      <Reveal index={4} className="st-wrap st-wrap--narrow">
        <div className="bl-post__cover">
          <img src={cover} alt={meta.title} ref={markImgLoaded} onLoad={onImgLoad} />
        </div>
      </Reveal>

      <div className="st-wrap st-wrap--narrow bl-post__body">
        {meta.type === 'compare' && (
          <CompareBlock sides={meta.sides} verdict={meta.verdict} byCity={byCity} loading={loading} lang={lang} />
        )}

        <Prose>{body}</Prose>

        {meta.type === 'article' && destinations.length > 0 && (
          <section className="bl-current">
            <h2 className="st-h2" style={{ fontSize: '1.4rem' }}>{t.current}</h2>
            <div className="bl-current__grid">
              {destinations.map(name => (
                <div key={name} className="bl-current__row">
                  <span className="bl-current__name">{name}</span>
                  <LiveOfferTag name={name} byCity={byCity} loading={loading} lang={lang} />
                </div>
              ))}
            </div>
          </section>
        )}

        {meta.type === 'guide' && destinations.map(name => {
          const agg = pickDestination(byCity, name)
          return <ThingsToDo key={name} city={name} country={agg ? agg.country : ''} />
        })}
      </div>

      <section className="st-wrap st-wrap--narrow">
        <div className="bl-post__cta">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <div className="bl-post__cta-actions">
            <Link to="/ofertat" className="st-btn st-btn--primary">{t.ctaAll} <ArrowRight size={16} /></Link>
            <Link to="/planner" className="st-link">{t.ctaPlanner} →</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
