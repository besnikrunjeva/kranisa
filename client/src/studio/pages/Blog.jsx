import { useMemo, useState } from 'react'
import { Reveal } from '../components/ui.jsx'
import BlogCard from '../components/BlogCard.jsx'
import { getPosts } from '../blog/loader.js'
import { useI18n } from '../../i18n/I18nContext.jsx'

const COPY = {
  sq: {
    eyebrow: 'Blog',
    title: 'Udhëzues, krahasime dhe çka të presësh',
    lede: 'Si duken destinacionet tani, cilën të zgjedhësh mes dyjave, dhe çka pret verën tjetër — me çmime që përditësohen vetë nga ofertat reale.',
    all: 'Të gjitha', article: 'Artikuj', compare: 'Krahasime', guide: 'Udhëzues',
    empty: 'Së shpejti — postimet e para po vijnë.'
  },
  en: {
    eyebrow: 'Blog',
    title: 'Guides, comparisons and what to expect',
    lede: 'How destinations look now, which to choose between two, and what next summer holds — with prices that keep themselves updated from live offers.',
    all: 'All', article: 'Articles', compare: 'Comparisons', guide: 'Guides',
    empty: 'Coming soon — the first posts are on the way.'
  }
}

const FILTERS = ['all', 'article', 'compare', 'guide']

export default function Blog () {
  const { lang } = useI18n()
  const t = COPY[lang] || COPY.sq
  const [filter, setFilter] = useState('all')

  const posts = useMemo(() => getPosts(lang), [lang])
  const shown = filter === 'all' ? posts : posts.filter(p => p.meta.type === filter)

  return (
    <main className="st-wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
      <header style={{ maxWidth: '46ch' }}>
        <Reveal index={0}><p className="st-eyebrow">{t.eyebrow}</p></Reveal>
        <Reveal index={1}>
          <h1 className="st-display" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginTop: 16 }}>{t.title}</h1>
        </Reveal>
        <Reveal index={2}><p className="st-lede" style={{ marginTop: 18 }}>{t.lede}</p></Reveal>
      </header>

      <Reveal index={3} className="bl-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            className="bl-filter"
            data-active={filter === f}
            onClick={() => setFilter(f)}
          >{t[f]}</button>
        ))}
      </Reveal>

      {shown.length === 0
        ? <p className="st-lede" style={{ marginTop: 40 }}>{t.empty}</p>
        : (
          <div className="bl-grid">
            {shown.map((post, i) => (
              <Reveal key={post.slug} index={i} step={55}>
                <BlogCard post={post} lang={lang} />
              </Reveal>
            ))}
          </div>
        )}
    </main>
  )
}
