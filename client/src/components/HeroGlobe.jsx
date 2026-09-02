import { useEffect, useState } from 'react'
import { Globe } from './ui/cobe-globe.jsx'

// Original demo markers/arcs, unchanged — only the colors below are
// customized to the active theme's tokens.
const markers = [
  { id: 'sf', location: [37.7595, -122.4367], label: 'San Francisco' },
  { id: 'nyc', location: [40.7128, -74.006], label: 'New York' },
  { id: 'tokyo', location: [35.6762, 139.6503], label: 'Tokyo' },
  { id: 'london', location: [51.5074, -0.1278], label: 'London' },
  { id: 'sydney', location: [-33.8688, 151.2093], label: 'Sydney' },
  { id: 'capetown', location: [-33.9249, 18.4241], label: 'Cape Town' },
  { id: 'dubai', location: [25.2048, 55.2708], label: 'Dubai' },
  { id: 'paris', location: [48.8566, 2.3522], label: 'Paris' },
  { id: 'saopaulo', location: [-23.5505, -46.6333], label: 'São Paulo' },
]

const arcs = [
  { id: 'sf-tokyo', from: [37.7595, -122.4367], to: [35.6762, 139.6503], label: 'SF → Tokyo' },
  { id: 'nyc-london', from: [40.7128, -74.006], to: [51.5074, -0.1278], label: 'NYC → London' },
]

const FALLBACK = { baseColor: '#e5e7eb', markerColor: '#3b82f6', arcColor: '#6b7280', glowColor: '#ffffff' }

function hexToRgb01 (hex) {
  const clean = (hex || '').trim().replace('#', '')
  if (clean.length !== 6) return [1, 1, 1]
  return [0, 2, 4].map(i => parseInt(clean.slice(i, i + 2), 16) / 255)
}

// Reads the live token values off :root rather than hardcoding a color set
// per theme, so this stays correct for light mode, the dark variant, and
// any future theme swap.
function readGlobeColors () {
  const style = getComputedStyle(document.documentElement)
  const pick = (varName, fallback) => hexToRgb01(style.getPropertyValue(varName) || fallback)
  return {
    // border/muted-2 stay a legible mid-gray in both themes — surface-2 and
    // secondary (used previously) both collapse to near-black in dark mode,
    // making the sphere and arcs nearly invisible against the dark bg.
    baseColor: pick('--color-border', FALLBACK.baseColor),
    markerColor: pick('--color-primary', FALLBACK.markerColor),
    arcColor: pick('--color-muted-2', FALLBACK.arcColor),
    glowColor: pick('--color-bg', FALLBACK.glowColor)
  }
}

const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export default function HeroGlobe ({ className = '' }) {
  const [colors, setColors] = useState(readGlobeColors)
  // The globe's idle auto-rotation is a slow, persistent oscillation — the
  // kind of ambient motion prefers-reduced-motion exists to stop. When set,
  // freeze the spin (the sphere still renders, just doesn't rotate on its own).
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia?.(REDUCE_MOTION_QUERY).matches ?? false
  )

  useEffect(() => {
    const sync = () => setColors(readGlobeColors())
    window.addEventListener('kranisa-theme-change', sync)

    const mq = window.matchMedia?.(REDUCE_MOTION_QUERY)
    const onChange = e => setReduceMotion(e.matches)
    mq?.addEventListener('change', onChange)

    return () => {
      window.removeEventListener('kranisa-theme-change', sync)
      mq?.removeEventListener('change', onChange)
    }
  }, [])

  return (
    <Globe
      className={className}
      markers={markers}
      arcs={arcs}
      dark={0}
      baseColor={colors.baseColor}
      markerColor={colors.markerColor}
      arcColor={colors.arcColor}
      glowColor={colors.glowColor}
      mapBrightness={7}
      markerSize={0.05}
      speed={reduceMotion ? 0 : 0.0025}
    />
  )
}
