import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Heart } from 'lucide-react'

// One button, every pressable surface in the studio. Scale-on-press +
// custom ease-out come straight from the Emil skill; variants keep the
// palette restrained (accent earns attention by being rare).
export function Button ({ variant = 'primary', size, to, href, className = '', children, ...props }) {
  const cls = [
    'st-btn',
    `st-btn--${variant}`,
    size ? `st-btn--${size}` : '',
    className
  ].filter(Boolean).join(' ')

  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>
  if (href) return <a href={href} className={cls} {...props}>{children}</a>
  return <button className={cls} {...props}>{children}</button>
}

// Staggered entrance. Present-on-load elements rise + fade; pass an index
// for the 40–60ms cascade the skill prescribes (kept short so it never
// feels slow, and it never blocks interaction).
export function Reveal ({ index = 0, step = 55, as: As = 'div', className = '', style, children, ...props }) {
  return (
    <As
      className={`st-rise ${className}`}
      style={{ animationDelay: `${index * step}ms`, ...style }}
      {...props}
    >
      {children}
    </As>
  )
}

export function Stars ({ count = 0, size = 13 }) {
  return (
    <span className="st-stars" aria-label={`${count} yje`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          stroke="var(--st-accent)"
          fill={i < count ? 'var(--st-accent)' : 'none'}
        />
      ))}
    </span>
  )
}

export function HeartButton () {
  const [on, setOn] = useState(false)
  return (
    <button
      type="button"
      className="st-heart"
      data-on={on}
      aria-label="Ruaj ofertën"
      aria-pressed={on}
      onClick={e => { e.preventDefault(); setOn(v => !v) }}
    >
      <Heart size={16} strokeWidth={2} fill={on ? 'var(--st-accent)' : 'none'} />
    </button>
  )
}
