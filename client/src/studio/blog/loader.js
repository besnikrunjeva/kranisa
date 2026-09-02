// Build-time file-based blog. Every Markdown file under content/blog/ is read
// as a raw string at build (Vite import.meta.glob), parsed, and indexed by
// slug. Posts are bilingual: `slug.sq.md` + `slug.en.md` are two variants of
// one post. Publishing a post = adding files + a deploy; no backend, no DB.
import { parseFrontmatter } from './frontmatter.js'

const FILES = import.meta.glob('../../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

const NAME_RE = /\/([^/]+)\.(sq|en)\.md$/

// slug -> { sq?: Post, en?: Post }
const INDEX = new Map()

for (const [path, raw] of Object.entries(FILES)) {
  const m = path.match(NAME_RE)
  if (!m) continue
  const [, slug, lang] = m
  const { meta, body } = parseFrontmatter(raw)
  if (meta.__invalid) continue
  const post = { slug, lang, meta: { ...meta, slug, lang }, body }
  const entry = INDEX.get(slug) || {}
  entry[lang] = post
  INDEX.set(slug, entry)
}

function resolve (entry, lang) {
  if (!entry) return null
  const chosen = entry[lang] || entry.sq || entry.en
  if (!chosen) return null
  // Flag when we fell back to another language so the UI can note it.
  return { ...chosen, translated: Boolean(entry[lang]) }
}

// All posts for a language, newest first. Falls back per-post to whatever
// translation exists so nothing silently disappears.
export function getPosts (lang = 'sq') {
  return [...INDEX.values()]
    .map(entry => resolve(entry, lang))
    .filter(Boolean)
    .sort((a, b) => String(b.meta.date).localeCompare(String(a.meta.date)))
}

export function getPost (slug, lang = 'sq') {
  return resolve(INDEX.get(slug), lang)
}

export function getPostLangs (slug) {
  const entry = INDEX.get(slug)
  return entry ? Object.keys(entry) : []
}
