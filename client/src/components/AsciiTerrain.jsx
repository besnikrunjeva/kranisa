import { useEffect, useRef } from 'react'

// Animated ASCII topographic field for the hero background.
// Value-noise contour bands rendered as monospace glyphs, colored a
// single solid dark brown across the canvas, drifting slowly (never
// scrolling/flickering — this should read as terrain, not Matrix rain).
// Masked so the center stays clear for the headline and search form.
//
// Layered on top: a slow-cycling "route" — a single plane icon hops
// between destinations, tracing a dashed flight-path arc as it flies.
// At departure the name briefly dips (fades + shrinks) as the plane
// grows in over the same spot — a crossfade "pseudo-morph", not true
// shape interpolation — then the name recovers to full visibility once
// the plane has visibly split off and is on its way. The mirror happens
// on arrival: the plane dissolves into the name as it lands. Each name,
// once first revealed, stays visible permanently once the plane has
// moved on — only the transient icon travels; it's never duplicated at
// a name the plane has already left.
//
// Two stacked canvases, not one: the terrain is expensive to redraw
// (thousands of cells of noise + fillText) so it only redraws every
// FRAME_INTERVAL — fine for something meant to feel like slow ambient
// drift. But the plane and its line are actual motion, and tying them to
// that same ~6fps throttle made them visibly step rather than glide.
// They get their own canvas, redrawn every animation frame.

const RAMP = [' ', '·', '.', ':', '+', '=', '*', '#', '%']
const INK = '#6B3A1E' // espresso
const CELL = 9
const TERRAIN_FRAME_INTERVAL = 150 // ms between terrain redraws — slow organic drift, not per-frame
const NOISE_SCALE = 0.07
const BANDS = 7

// Real-feeling beach destinations, positioned in the corners/edges where
// the mask keeps the terrain strongest — never near the center where the
// headline and search form sit.
const WAYPOINTS = [
  { name: 'ANTALYA', x: 0.06, y: 0.15 },
  { name: 'HURGHADA', x: 0.94, y: 0.15 },
  { name: 'DUBROVNIK', x: 0.95, y: 0.5 },
  { name: 'BODRUM', x: 0.92, y: 0.85 },
  { name: 'CRETE', x: 0.08, y: 0.85 },
  { name: 'SANTORINI', x: 0.05, y: 0.5 }
]
const SEGMENT_DURATION = 5.5 // seconds per name-to-name hop

function makeHash (seed) {
  return function hash (ix, iy) {
    // 32-bit integer mixing via Math.imul — plain `*` here would exceed
    // float64's safe-integer range and quietly lose entropy, producing a
    // visibly regular/gridded pattern instead of organic noise.
    let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 2654435761)
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    h = h ^ (h >>> 16)
    return (h >>> 0) / 4294967295
  }
}

function makeNoise2D (seed) {
  const hash = makeHash(seed)
  const smooth = a => a * a * (3 - 2 * a)
  return function noise2D (x, y) {
    const x0 = Math.floor(x); const y0 = Math.floor(y)
    const sx = smooth(x - x0); const sy = smooth(y - y0)
    const n00 = hash(x0, y0); const n10 = hash(x0 + 1, y0)
    const n01 = hash(x0, y0 + 1); const n11 = hash(x0 + 1, y0 + 1)
    const ix0 = n00 + (n10 - n00) * sx
    const ix1 = n01 + (n11 - n01) * sx
    return ix0 + (ix1 - ix0) * sy
  }
}

function makeFbm (seed) {
  const a = makeNoise2D(seed)
  const b = makeNoise2D(seed + 101)
  return (x, y) => a(x, y) * 0.65 + b(x * 2.13, y * 2.13) * 0.35
}

function smoothstep (edge0, edge1, x) {
  const cl = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return cl * cl * (3 - 2 * cl)
}

function quadPoint (p0, p1, control, tt) {
  const u = 1 - tt
  return {
    x: u * u * p0.x + 2 * u * tt * control.x + tt * tt * p1.x,
    y: u * u * p0.y + 2 * u * tt * control.y + tt * tt * p1.y
  }
}

// Small dart-shaped plane silhouette, drawn pointing along +x before
// rotation. Used both as the stationary marker beside a revealed name and
// as the marker travelling the route — same icon, so it reads as one
// plane departing and arriving rather than two different marks.
function drawPlaneIcon (ctx, x, y, angle, size, alpha) {
  if (alpha <= 0.01) return
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalAlpha = alpha
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.moveTo(size, 0)
  ctx.lineTo(-size * 0.6, size * 0.45)
  ctx.lineTo(-size * 0.25, 0)
  ctx.lineTo(-size * 0.6, -size * 0.45)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// Ellipse mask: fully clear through the headline/search area, strongest
// toward the left/right edges and bottom corners, faint at the top corners.
const MASK =
  'radial-gradient(ellipse 68% 58% at 50% 42%, transparent 0%, transparent 32%, black 74%, black 100%)'

export default function AsciiTerrain ({ className = '' }) {
  const wrapRef = useRef(null)
  const terrainCanvasRef = useRef(null)
  const routeCanvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const terrainCanvas = terrainCanvasRef.current
    const routeCanvas = routeCanvasRef.current
    if (!wrap || !terrainCanvas || !routeCanvas) return

    const terrainCtx = terrainCanvas.getContext('2d')
    const routeCtx = routeCanvas.getContext('2d')
    const fbm = makeFbm(4021)
    const noiseHash = makeHash(5591)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let lastTerrainT = 0
    let lastRouteT = 0
    // once a destination's name has faded in, it stays lit — this only
    // ever grows (never reset), so revealed names persist across hops
    // instead of fading out again when the plane moves on
    const revealed = new Array(WAYPOINTS.length).fill(0)

    function sizeCanvas (canvas, ctx) {
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function resize () {
      const rect = wrap.getBoundingClientRect()
      width = Math.ceil(rect.width)
      height = Math.ceil(rect.height)
      sizeCanvas(terrainCanvas, terrainCtx)
      sizeCanvas(routeCanvas, routeCtx)
      cols = Math.ceil(width / CELL) + 1
      rows = Math.ceil(height / CELL) + 1
      terrainCtx.font = '8px "Geist Mono", ui-monospace, SFMono-Regular, monospace'
      terrainCtx.textBaseline = 'top'

      // setting canvas.width/height clears the buffer as a side effect —
      // repaint immediately so a resize never leaves a blank frame sitting
      // until the next animation tick (which may be paused, e.g. hidden tab)
      renderTerrain(lastTerrainT)
      renderRoute(lastRouteT)
    }

    function renderTerrain (t) {
      lastTerrainT = t
      const ctx = terrainCtx
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = INK

      const driftX = Math.sin(t * 0.05) * 1.6
      const driftY = Math.cos(t * 0.04) * 1.2
      const flickerBucket = Math.floor(t * 2)
      // sample from distance-to-center rather than raw column: organic
      // noise has no reason to balance out left vs right on its own, so
      // mirroring guarantees both sides read with the same weight instead
      // of leaving it to chance which side the denser patches land on
      const midCol = cols / 2

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const mirroredCol = Math.abs(col - midCol)
          const n = fbm(mirroredCol * NOISE_SCALE + driftX, row * NOISE_SCALE + driftY)
          const bands = n * BANDS
          const frac = bands - Math.floor(bands)
          const toEdge = Math.min(frac, 1 - frac)
          const contour = 1 - toEdge * 2
          const density = Math.max(0, Math.min(1, contour * 0.78 + n * 0.22))
          const idx = Math.floor(density * RAMP.length)
          if (idx <= 0) continue
          const ch = RAMP[Math.min(idx, RAMP.length - 1)]

          const isFlicker = noiseHash(Math.round(mirroredCol), row + flickerBucket) > 0.985
          const alpha = isFlicker ? 0.4 : 0.14 + density * 0.14

          ctx.globalAlpha = Math.min(1, alpha)
          ctx.fillText(ch, col * CELL, row * CELL)
        }
      }

      ctx.globalAlpha = 1
    }

    function drawLabel (waypoint, alpha, scale = 1) {
      if (alpha <= 0.01) return
      const ctx = routeCtx
      const px = waypoint.x * width
      const py = waypoint.y * height
      const onLeft = waypoint.x < 0.5
      const iconGap = 12 // px between icon center and text edge
      // the icon (and the line converging on it) sit exactly at the
      // waypoint's own y — an incoming/outgoing line can approach from any
      // angle depending on where the other end of the hop is, so a text
      // row sharing that same y can end up with the line drawn straight
      // through it. Push the text to its own row, toward canvas center,
      // so it's still clearly "attached" to the icon without sitting on
      // the line's convergence point.
      const textOffsetY = waypoint.y <= 0.5 ? 14 : -14
      const anchorX = px + (onLeft ? iconGap : -iconGap)
      const anchorY = py + textOffsetY

      ctx.save()
      ctx.globalAlpha = alpha * 0.85
      ctx.fillStyle = INK
      ctx.font = '600 11px "Geist Mono", ui-monospace, SFMono-Regular, monospace'
      ctx.textAlign = onLeft ? 'left' : 'right'
      ctx.textBaseline = 'middle'
      if (scale !== 1) {
        // scale around the text's own anchor point, not the canvas origin
        ctx.translate(anchorX, anchorY)
        ctx.scale(scale, scale)
        ctx.translate(-anchorX, -anchorY)
      }
      ctx.fillText(waypoint.name, anchorX, anchorY)
      ctx.restore()
    }

    // Phase timeline within one SEGMENT_DURATION (5.5s):
    //  0.0 – 0.8  reveal-from   (first-ever appearance only)
    //  0.8 – 1.1  depart-dip    name fades+shrinks, plane fades+grows in, both at `from`
    //  1.1 – 1.4  depart-recover name fades back in (plane already fully formed, still parked)
    //  1.4 – 3.0  fly           plane travels the arc
    //  3.0 – 3.3  arrive-merge  plane fades+shrinks into the `to` name as it lands
    //  3.3 – 5.5  hold
    const DEPART_DIP_START = 0.8
    const DEPART_DIP_END = 1.1
    const DEPART_RECOVER_END = 1.4
    const FLY_START = 1.4
    const FLY_END = 3.0
    const ARRIVE_END = 3.3

    function renderRoute (t) {
      lastRouteT = t
      const ctx = routeCtx
      ctx.clearRect(0, 0, width, height)

      const segmentIndex = Math.floor(t / SEGMENT_DURATION) % WAYPOINTS.length
      const st = t % SEGMENT_DURATION
      const from = WAYPOINTS[segmentIndex]
      const toIndex = (segmentIndex + 1) % WAYPOINTS.length
      const to = WAYPOINTS[toIndex]

      const revealFrom = smoothstep(0, 0.8, st)
      const departDip = smoothstep(DEPART_DIP_START, DEPART_DIP_END, st)
      const departRecover = smoothstep(DEPART_DIP_END, DEPART_RECOVER_END, st)
      const lineProgress = smoothstep(FLY_START, FLY_END, st)
      const arriveMerge = smoothstep(FLY_END, ARRIVE_END, st)

      // was `to` already an established destination before this hop even
      // started? Only a genuinely first-ever arrival gets the "grows out
      // of nothing" treatment — a repeat visit shouldn't make an already-
      // known name vanish and re-materialize every time the plane swings
      // back through it
      const toWasRevealed = revealed[toIndex] > 0.001

      // names only ever brighten, never dim over time — a hop that has
      // already played (earlier in this loop, or a previous loop) keeps
      // its destinations fully lit rather than replaying their fade-in.
      // Departure never un-reveals `from` for the future either, only
      // its *displayed* alpha dips momentarily below (see fromAlpha).
      revealed[segmentIndex] = Math.max(revealed[segmentIndex], revealFrom)
      revealed[toIndex] = Math.max(revealed[toIndex], arriveMerge)

      const fromPx = { x: from.x * width, y: from.y * height }
      const toPx = { x: to.x * width, y: to.y * height }
      const midX = (fromPx.x + toPx.x) / 2
      const midY = (fromPx.y + toPx.y) / 2
      const arcHeight = Math.min(Math.hypot(toPx.x - fromPx.x, toPx.y - fromPx.y) * 0.18, 50)
      const control = { x: midX, y: midY - arcHeight }
      // heading used for the parked/emerging plane too, so it appears to
      // depart facing this way and arrive still facing it
      const routeAngle = Math.atan2(toPx.y - fromPx.y, toPx.x - fromPx.x)

      if (lineProgress > 0.001) {
        ctx.save()
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = INK
        ctx.lineWidth = 1
        ctx.setLineDash([4, 3])
        ctx.beginPath()
        const steps = 24
        for (let i = 0; i <= steps; i++) {
          const tt = (i / steps) * lineProgress
          const p = quadPoint(fromPx, toPx, control, tt)
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()
        ctx.restore()
      }

      // all revealed destination names, permanently — except `from` and
      // `to`, which get their own dip/merge alpha+scale below instead of
      // the flat persisted value
      for (let i = 0; i < WAYPOINTS.length; i++) {
        if (i === segmentIndex || i === toIndex) continue
        drawLabel(WAYPOINTS[i], revealed[i])
      }

      // `from`: dips out (1 → 0) as the plane solidifies over it, then
      // recovers back to full — the city name doesn't actually vanish,
      // it just yields the spot briefly while its plane spawns
      const dipFactor = st < DEPART_DIP_END ? (1 - departDip) : departRecover
      const fromAlpha = revealed[segmentIndex] * dipFactor
      const fromScale = 1 - 0.15 * departDip * (1 - departRecover)
      drawLabel(from, fromAlpha, fromScale)

      // `to`: a repeat destination is already established and just sits
      // there normally — only a genuine first-ever arrival gets the
      // grow-in-from-nothing treatment, timed with the plane's landing
      if (toWasRevealed) {
        drawLabel(to, revealed[toIndex])
      } else if (arriveMerge > 0.001) {
        const toScale = 0.85 + 0.15 * arriveMerge
        drawLabel(to, arriveMerge, toScale)
      }

      // the plane: grows in at `from` during depart-dip, sits fully
      // formed through depart-recover, flies, then shrinks away into
      // `to` during arrive-merge. Never drawn once fully merged/landed —
      // that moment is when the destination name takes over completely.
      const emergeSize = 5 * (0.35 + 0.65 * departDip)
      if (st < DEPART_DIP_END) {
        drawPlaneIcon(ctx, fromPx.x, fromPx.y, routeAngle, emergeSize, departDip)
      } else if (st < FLY_START) {
        drawPlaneIcon(ctx, fromPx.x, fromPx.y, routeAngle, 5, 1)
      } else if (lineProgress < 1) {
        const tip = quadPoint(fromPx, toPx, control, lineProgress)
        const tail = quadPoint(fromPx, toPx, control, Math.max(0, lineProgress - 0.02))
        const heading = Math.atan2(tip.y - tail.y, tip.x - tail.x)
        drawPlaneIcon(ctx, tip.x, tip.y, heading, 6, 1)
      } else if (arriveMerge < 1) {
        const dissolveSize = 6 * (1 - 0.5 * arriveMerge)
        drawPlaneIcon(ctx, toPx.x, toPx.y, routeAngle, dissolveSize, 1 - arriveMerge)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let frameId
    let lastTerrainDraw = 0
    const start = performance.now()

    function loop (now) {
      const t = (now - start) / 1000
      if (now - lastTerrainDraw >= TERRAIN_FRAME_INTERVAL) {
        lastTerrainDraw = now
        renderTerrain(t)
      }
      renderRoute(t) // every frame — this is actual motion, not ambient drift
      frameId = requestAnimationFrame(loop)
    }

    if (!reduceMotion) frameId = requestAnimationFrame(loop)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      ro.disconnect()
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      <canvas ref={terrainCanvasRef} className="absolute inset-0" />
      <canvas ref={routeCanvasRef} className="absolute inset-0" />
    </div>
  )
}
