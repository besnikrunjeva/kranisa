import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Switch } from './ui/switch.tsx'

const STORAGE_KEY = 'kranisa-color-scheme'

function getInitialDark () {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored === 'dark'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

// Real light/dark toggle (see the :root.dark block in index.css) — sets a
// `dark` class on <html> and remembers the choice.
export default function ThemeSwitcher () {
  const [isDark, setIsDark] = useState(getInitialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
    // HeroGlobe reads CSS vars into JS for its WebGL colors, which can't
    // just pick up a CSS cascade change on their own — nudge it to resync.
    window.dispatchEvent(new Event('kranisa-theme-change'))
  }, [isDark])

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-2" />
      <Switch checked={isDark} onCheckedChange={setIsDark} aria-label="Toggle dark mode" />
      <Moon className="h-4 w-4 text-muted-2" />
    </div>
  )
}
