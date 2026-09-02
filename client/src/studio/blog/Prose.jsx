import { useMemo } from 'react'
import { marked } from 'marked'

// Renders trusted, in-repo Markdown into the studio's prose type scale.
// Content is authored by the team (never user input), so raw HTML output is
// safe here. External links get sponsored/noopener rel for affiliate hygiene.
marked.setOptions({ gfm: true, breaks: false })

function enhanceLinks (html) {
  return html.replace(/<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener sponsored"')
}

export default function Prose ({ children }) {
  const html = useMemo(() => enhanceLinks(marked.parse(children || '')), [children])
  return <div className="st-prose" dangerouslySetInnerHTML={{ __html: html }} />
}
