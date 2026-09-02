import { useEffect, useState } from 'react'

// Reveals the reply word by word, each word resolving out of a soft blur, with
// a blinking caret while it streams. The reply is already computed (GLM returns
// it whole) — this is a client-side reveal for feel, not true token streaming.
// Only animates when `stream` is set (fresh replies); memory-loaded messages
// and reduced-motion show the full text at once.
const WORD_MS = 26

function prefersReduced () {
  return typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function StreamingText ({ text = '', stream = false, onDone }) {
  const words = text ? text.split(' ') : []
  const animate = stream && !prefersReduced()
  const [count, setCount] = useState(animate ? 0 : words.length)

  useEffect(() => {
    if (count >= words.length) { if (onDone) onDone(); return }
    const t = setTimeout(() => setCount(c => Math.min(words.length, c + 1)), WORD_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, words.length])

  const streaming = count < words.length
  return (
    <p className="pl-text">
      {words.slice(0, count).map((w, i) => (
        <span key={i} className="pl-stream__w">{w} </span>
      ))}
      {streaming && <span className="pl-stream__caret" aria-hidden="true" />}
    </p>
  )
}
