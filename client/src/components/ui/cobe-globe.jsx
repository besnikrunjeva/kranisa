"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

// Same lat/lng -> 3D -> screen-space projection cobe uses internally
// (reverse-engineered from its source) so marker/arc labels can be
// positioned with plain left/top percentages instead of relying on CSS
// Anchor Positioning (position-anchor/anchor()), which only Chrome/Edge
// 125+ support — cobe's own built-in label system uses that API and
// silently renders nothing in Safari/Firefox.
const SPHERE_RADIUS = 0.8

function toVector3([lat, lng]) {
  const r = (lat * Math.PI) / 180
  const a = (lng * Math.PI) / 180 - Math.PI
  const cosR = Math.cos(r)
  return [-cosR * Math.cos(a), Math.sin(r), cosR * Math.sin(a)]
}

function project([x, y, z], phi, theta) {
  const cosT = Math.cos(theta)
  const sinT = Math.sin(theta)
  const cosP = Math.cos(phi)
  const sinP = Math.sin(phi)
  const c = cosP * x + sinP * z
  const s = sinP * sinT * x + cosT * y - cosP * sinT * z
  const facing = -sinP * cosT * x + sinT * y + cosP * cosT * z
  const visible = facing >= 0 || c * c + s * s >= 0.64
  return { x: (c + 1) / 2, y: (-s + 1) / 2, visible }
}

function markerScreenPos(location, phi, theta, markerElevation) {
  const v = toVector3(location)
  const r = SPHERE_RADIUS + markerElevation
  return project([v[0] * r, v[1] * r, v[2] * r], phi, theta)
}

function arcScreenPos(from, to, phi, theta, markerElevation, arcHeight) {
  const a = toVector3(from)
  const b = toVector3(to)
  const sum = [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
  const len = Math.sqrt(sum[0] ** 2 + sum[1] ** 2 + sum[2] ** 2)
  if (len < 0.001) return null
  const k =
    0.25 * (SPHERE_RADIUS + markerElevation) +
    (0.5 * (SPHERE_RADIUS + arcHeight + markerElevation)) / len
  return project([sum[0] * k, sum[1] * k, sum[2] * k], phi, theta)
}

export function Globe({
  markers = [],
  arcs = [],
  className = "",
  markerColor = [0.3, 0.45, 0.85],
  baseColor = [1, 1, 1],
  arcColor = [0.3, 0.45, 0.85],
  glowColor = [0.94, 0.93, 0.91],
  dark = 0,
  mapBrightness = 10,
  markerSize = 0.025,
  markerElevation = 0.01,
  arcWidth = 0.5,
  arcHeight = 0.25,
  speed = 0.003,
  theta = 0.2,
  diffuse = 1.5,
  mapSamples = 16000,
}) {
  const canvasRef = useRef(null)
  const markerLabelRefs = useRef({})
  const arcLabelRefs = useRef({})
  const pointerInteracting = useRef(null)
  const lastPointer = useRef(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const velocity = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      dragOffset.current = { phi: deltaX / 300, theta: deltaY / 1000 }
      const now = Date.now()
      if (lastPointer.current) {
        const dt = Math.max(now - lastPointer.current.t, 1)
        const maxVelocity = 0.15
        velocity.current = {
          phi: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientX - lastPointer.current.x) / dt) * 0.3)
          ),
          theta: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientY - lastPointer.current.y) / dt) * 0.08)
          ),
        }
      }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
      lastPointer.current = null
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe = null
    let animationId
    let phi = 0
    let ro = null
    let cancelled = false

    function updateLabels(currentPhi, currentTheta) {
      for (const m of markers) {
        const el = markerLabelRefs.current[m.id]
        if (!el) continue
        const pos = markerScreenPos(m.location, currentPhi, currentTheta, markerElevation)
        el.style.left = `${pos.x * 100}%`
        el.style.top = `${pos.y * 100}%`
        el.style.opacity = pos.visible ? "1" : "0"
      }
      for (const a of arcs) {
        const el = arcLabelRefs.current[a.id]
        if (!el) continue
        const pos = arcScreenPos(a.from, a.to, currentPhi, currentTheta, markerElevation, arcHeight)
        if (!pos) continue
        el.style.left = `${pos.x * 100}%`
        el.style.top = `${pos.y * 100}%`
        el.style.opacity = pos.visible ? "1" : "0"
      }
    }

    function init() {
      if (cancelled) return
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width,
        height: width,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation,
        markers: markers.map((m) => ({
          location: m.location,
          size: markerSize,
          id: m.id,
        })),
        arcs: arcs.map((a) => ({
          from: a.from,
          to: a.to,
          id: a.id,
        })),
        arcColor,
        arcWidth,
        arcHeight,
        opacity: 0.7,
      })

      function animate() {
        if (!isPausedRef.current) {
          phi += speed
          if (
            Math.abs(velocity.current.phi) > 0.0001 ||
            Math.abs(velocity.current.theta) > 0.0001
          ) {
            phiOffsetRef.current += velocity.current.phi
            thetaOffsetRef.current += velocity.current.theta
            velocity.current.phi *= 0.95
            velocity.current.theta *= 0.95
          }
          const thetaMin = -0.4
          const thetaMax = 0.4
          if (thetaOffsetRef.current < thetaMin) {
            thetaOffsetRef.current += (thetaMin - thetaOffsetRef.current) * 0.1
          } else if (thetaOffsetRef.current > thetaMax) {
            thetaOffsetRef.current += (thetaMax - thetaOffsetRef.current) * 0.1
          }
        }
        const currentPhi = phi + phiOffsetRef.current + dragOffset.current.phi
        const currentTheta = theta + thetaOffsetRef.current + dragOffset.current.theta
        globe.update({
          phi: currentPhi,
          theta: currentTheta,
          dark,
          mapBrightness,
          markerColor,
          baseColor,
          arcColor,
          markerElevation,
          markers: markers.map((m) => ({
            location: m.location,
            size: markerSize,
            id: m.id,
          })),
          arcs: arcs.map((a) => ({
            from: a.from,
            to: a.to,
            id: a.id,
          })),
        })
        updateLabels(currentPhi, currentTheta)
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    // Deferred by a tick so React StrictMode's dev-only phantom
    // mount->cleanup->mount pass never touches the canvas at all.
    const timeoutId = setTimeout(() => {
      if (cancelled) return
      if (canvas.offsetWidth > 0) {
        init()
      } else {
        ro = new ResizeObserver((entries) => {
          if (entries[0]?.contentRect.width > 0) {
            ro.disconnect()
            init()
          }
        })
        ro.observe(canvas)
      }
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      if (ro) ro.disconnect()
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, arcs, markerColor, baseColor, arcColor, glowColor, dark, mapBrightness, markerSize, markerElevation, arcWidth, arcHeight, speed, theta, diffuse, mapSamples])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          ref={(el) => { markerLabelRefs.current[m.id] = el }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, calc(-100% - 10px))",
            padding: "2px 6px",
            background: "#1a1a2e",
            color: "#fff",
            fontFamily: "monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.3s",
          }}
        >
          {m.label}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translate3d(-50%, -1px, 0)",
              border: "5px solid transparent",
              borderTopColor: "#1a1a2e",
            }}
          />
        </div>
      ))}
      {arcs
        .filter((a) => a.label)
        .map((a) => (
          <div
            key={a.id}
            ref={(el) => { arcLabelRefs.current[a.id] = el }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: "translate(-50%, calc(-100% - 10px))",
              padding: "2px 6px",
              background: "#fff",
              color: "#1a1a2e",
              fontFamily: "monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              opacity: 0,
              transition: "opacity 0.3s",
            }}
          >
            {a.label}
            <span
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translate3d(-50%, -1px, 0)",
                border: "5px solid transparent",
                borderTopColor: "#fff",
              }}
            />
          </div>
        ))}
    </div>
  )
}
