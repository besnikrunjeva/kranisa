import { Link } from 'react-router-dom'
import { destinationPhoto } from '../../lib/destinationPhoto.js'
import { markImgLoaded, onImgLoad } from '../blog/markImgLoaded.js'

const TYPE_LABEL = {
  sq: { article: 'Artikull', compare: 'Krahasim', guide: 'Udhëzues' },
  en: { article: 'Article', compare: 'Comparison', guide: 'Guide' }
}

function coverFor (meta) {
  if (meta.cover) return meta.cover
  const seed = meta.coverKeyword || (Array.isArray(meta.destinations) ? meta.destinations[0] : '') || meta.title
  return destinationPhoto(seed, 700, 460)
}

function formatDate (iso, lang) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogCard ({ post, lang = 'sq' }) {
  const { meta } = post
  const type = (TYPE_LABEL[lang] || TYPE_LABEL.sq)[meta.type] || null
  return (
    <Link to={`/blog/${meta.slug}`} className="bl-card">
      <div className="bl-card__media">
        <img className="bl-card__img" src={coverFor(meta)} alt={meta.title} loading="lazy" ref={markImgLoaded} onLoad={onImgLoad} />
        {type && <span className="bl-card__type">{type}</span>}
      </div>
      <div className="bl-card__body">
        <h3 className="bl-card__title">{meta.title}</h3>
        {meta.excerpt && <p className="bl-card__excerpt">{meta.excerpt}</p>}
        <div className="bl-card__meta">
          <span>{formatDate(meta.date, lang)}</span>
        </div>
      </div>
    </Link>
  )
}
