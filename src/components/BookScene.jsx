import React, { useRef, useEffect, useCallback, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  // Sticky floating layer: pins for 100vh, takes no horizontal flow space,
  // and never intercepts pointer events so the section text below stays usable.
  stickyLayer: {
    position: 'sticky',
    top: 0,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 5,
  },
  canvas: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  vignette: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.35) 100%)',
    pointerEvents: 'none',
    zIndex: 4,
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function norm(p, lo, hi) { return clamp((p - lo) / (hi - lo), 0, 1) }
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

// ─── Animation story ──────────────────────────────────────────────────────────
//
//  ACT 1  p 0.00 → 0.20   DROP IN
//         Book falls from y=+4 down to y=0.
//         Settles centre-right (x=0.6), slight entry tilt clears on landing.
//
//  ACT 2  p 0.20 → 0.55   FULL FLIP — Section 1
//         Book stays centre-right, does ONE complete Y rotation (0 → 2π).
//         Front cover → spine → back cover → spine → front cover.
//
//  ACT 3  p 0.55 → 0.70   SLIDE LEFT
//         Translates x: 0.6 → -1.4 while rotation continues.
//         Section 1 fades out, Section 2 fades in.
//
//  ACT 4  p 0.70 → 1.00   Section 2
//         Book stays left, completes another half-turn (2π → 3π).

function getTargets(p) {


  // ── X position ──
  let x
  if (p < 0.55) {
    x = 0.6
  } else if (p <= 0.70) {
    x = lerp(0.6, -1.4, ease(norm(p, 0.55, 0.70)))
  } else if (p < 0.85) {
    x = -1.4
  } else {
    // Return to center above the final quote
    x = lerp(-1.4, 0.0, ease(norm(p, 0.85, 1.00)))
  }

  // ── Y position ──
  // Drop in from above during ACT 1, then a subtle bob, then return to vertical center (y = 0.0)
  let y
  if (p < 0.20) {
    y = lerp(4.0, 0.0, ease(norm(p, 0.00, 0.20)))
  } else if (p < 0.85) {
    y = Math.sin(p * Math.PI * 3) * 0.12
  } else {
    // Return to y = 0.0 (vertical center) so it sits between the poem and quote
    y = lerp(Math.sin(0.85 * Math.PI * 3) * 0.12, 1.40, ease(norm(p, 0.85, 1.00)))
  }

  // ── Rotation Y — continuous scroll-driven flip ──
  let rotY
  if (p < 0.20) {
    rotY = lerp(0.5, 0.0, ease(norm(p, 0.00, 0.20)))
  } else if (p <= 0.55) {
    rotY = lerp(0.0, Math.PI * 2, norm(p, 0.20, 0.55))
  } else if (p <= 0.85) {
    rotY = Math.PI * 2 + lerp(0.0, Math.PI * 2, norm(p, 0.55, 0.85))
  } else {
    // Complete the rotation with an additional 90 degrees (Math.PI * 2.5 total spin in this segment) to face cover directly forward
    rotY = Math.PI * 4 + lerp(0.0, Math.PI * 2.5, norm(p, 0.85, 1.00))
  }

  // ── Rotation X / Z — perfectly upright/vertical with clear visibility of the front cover ──
  const rotX = 0.0
  const rotZ = 0.0

  return { x, y, rotX, rotY, rotZ }
}

// ─── 3D model setup ───────────────────────────────────────────────────────────

function setupInner(node, scene) {
  if (!node || !scene) return

  let meshCount = 0
  scene.traverse((c) => { if (c.isMesh) meshCount++ })
  if (!meshCount) { console.error('[Book] no meshes'); return }

  // Reset before measuring
  node.scale.set(1, 1, 1)
  node.position.set(0, 0, 0)
  node.rotation.set(0, 0, 0)

  // Measure natural bounding box
  const box = new THREE.Box3().setFromObject(node)
  const size = new THREE.Vector3()
  box.getSize(size)
  if (!size.x && !size.y && !size.z) { console.error('[Book] zero bbox'); return }

  // Scale to a consistent display size
  node.scale.setScalar(1.5 / Math.max(size.x, size.y, size.z))

  // Re-measure after scaling and re-centre
  const box2 = new THREE.Box3().setFromObject(node)
  const center = new THREE.Vector3()
  box2.getCenter(center)
  node.position.set(-center.x, -center.y, -center.z)

  // ── Orientation fix ──
  // Rotate on X, Y, and Z to make the front cover face the camera directly and stand upright
  node.rotation.x = Math.PI / 2
  node.rotation.y = -Math.PI / 2
  node.rotation.z = Math.PI / 2

  scene.traverse((c) => {
    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true }
  })
  console.log('%c[Book] setup done', 'color:lime')
}

// ─── Book model ───────────────────────────────────────────────────────────────

function BookModel({ progressRef }) {
  const groupRef   = useRef()
  const innerRef   = useRef()
  const setupDone  = useRef(false)
  const lastP      = useRef(0)

  const gltfResult = useGLTF('./models/deathnote.glb')

  const { scene } = gltfResult || {}

  const innerCb = useCallback((node) => {
    innerRef.current = node
    if (node && scene && !setupDone.current) {
      setupDone.current = true
      setupInner(node, scene)
    }
  }, [scene])

  useEffect(() => {
    if (innerRef.current && scene && !setupDone.current) {
      setupDone.current = true
      setupInner(innerRef.current, scene)
    }
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return

    const p = progressRef.current
    const t = getTargets(p)
    const g = groupRef.current

    // Use a tighter lerp factor so the book tracks the scroll closely
    const lf = 0.12

    g.position.x = THREE.MathUtils.lerp(g.position.x, t.x,    lf)
    g.position.y = THREE.MathUtils.lerp(g.position.y, t.y,    lf)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, t.rotX, lf)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, t.rotY, lf)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, t.rotZ, lf)

    lastP.current = p
  })

  if (!scene) return null

  return (
    <group ref={groupRef} position={[0.6, 4, 0]}>
      <group ref={innerCb}><primitive object={scene} /></group>
    </group>
  )
}

// ─── Lights ───────────────────────────────────────────────────────────────────

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffe5ec" />
      {/* Front-face key light - warm rosy champagne */}
      <directionalLight position={[0, 6, 5]}   intensity={2.5} color="#fff0f3" castShadow />
      {/* Back-face fill — soft warm light */}
      <directionalLight position={[0, 6, -5]}  intensity={2.0} color="#ffe3e8" />
      {/* Romantic magical gold rim from the left */}
      <directionalLight position={[-4, 3, -1]} intensity={0.8} color="#d4af37" />
      {/* Warm rose point light — front side */}
      <pointLight position={[2, 3,  4]} intensity={1.2} color="#f0a6ca" distance={14} />
      {/* Sweet warm gold point light — back side */}
      <pointLight position={[2, 3, -4]} intensity={0.9} color="#ffd3e8" distance={12} />
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BookScene() {
  const progressRef = useRef(0)

  useEffect(() => {
    const root = document.getElementById('book-scroll-root')
    if (!root) { console.error('[BookScene] #book-scroll-root not found'); return }

    // Book progress is derived directly from native scroll geometry.
    // NOTE: we deliberately do NOT use a ScrollTrigger here. Hero pins for
    // innerHeight*8, which fully consumes a #book-scroll-root ScrollTrigger's
    // range (it reports a stuck progress=1). This native calc stays accurate.
    const onScroll = () => {
      const scrolled = window.scrollY - root.offsetTop
      const total    = root.offsetHeight - window.innerHeight
      if (total > 0) progressRef.current = clamp(scrolled / total, 0, 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Sticky floating book layer. It pins for 100vh at the top of
  // #book-scroll-root and floats OVER the section content that follows
  // in normal document flow. pointerEvents:none so the book never blocks
  // interaction with the text beneath it.
  return (
    <div style={styles.stickyLayer}>
      <Canvas
        style={styles.canvas}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <Lights />
        <Suspense fallback={null}>
          <BookModel progressRef={progressRef} />
        </Suspense>
        <Environment preset="night" />
      </Canvas>

      <div style={styles.vignette} />
    </div>
  )
}

useGLTF.preload('./models/deathnote.glb')