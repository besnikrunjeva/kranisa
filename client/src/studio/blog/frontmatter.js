// Blog posts are Markdown files with a leading JSON metadata block:
//
//   <!--meta
//   { "type": "compare", "title": "…", "sides": [ … ] }
//   -->
//   Markdown body starts here…
//
// JSON (not YAML) so structured fields like `sides` nest natively with no
// YAML dependency, and the HTML-comment fence never collides with Markdown's
// own `---` horizontal rules. Content is authored in-repo and fully trusted.

const META_RE = /^\s*<!--meta\s*([\s\S]*?)-->\s*/

export function parseFrontmatter (raw = '') {
  const match = raw.match(META_RE)
  if (!match) {
    return { meta: {}, body: raw.trim() }
  }
  let meta = {}
  try {
    meta = JSON.parse(match[1])
  } catch (err) {
    // A malformed post shouldn't take down the whole blog — surface it in the
    // console and treat the post as bodyless so the loader can skip it.
    console.error('[blog] invalid meta JSON:', err.message)
    meta = { __invalid: true }
  }
  const body = raw.slice(match[0].length).trim()
  return { meta, body }
}
