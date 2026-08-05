import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
// Side-effect import: registers <ringLineMaterial>, <dustMaterial> and
// <nodeGlowMaterial> as JSX intrinsics via @react-three/fiber's extend().
import './heroSceneShaders';
import './HeroScene.css';

const deg = THREE.MathUtils.degToRad;

/* =======================================================================
 * Device tiers — perf, not just CSS breakpoints. Combines viewport width,
 * CPU core count, pointer coarseness and prefers-reduced-motion so a
 * touch tablet at 900px doesn't get treated like a desktop, and a small
 * reduced-motion window still gets a calm, static-ish rendering.
 * ===================================================================== */
function computeTier() {
  if (typeof window === 'undefined') return 'high';
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return 'reduced';

  const width = window.innerWidth;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;

  if (width < 480 || (coarse && cores <= 4)) return 'low';
  if (width < 1024 || cores <= 4) return 'medium';
  return 'high';
}

const TIER_SETTINGS = {
  reduced: { near: 40, far: 0, ringSeg: 90, wobble: 0, bloom: false, parallax: false, scrollFx: false, dpr: [1, 1.5], fov: 40, scale: 0.85 },
  low: { near: 55, far: 0, ringSeg: 90, wobble: 0.4, bloom: false, parallax: false, scrollFx: true, dpr: [1, 1.5], fov: 46, scale: 0.7 },
  medium: { near: 75, far: 90, ringSeg: 130, wobble: 0.8, bloom: true, parallax: true, scrollFx: true, dpr: [1, 2], fov: 42, scale: 0.88 },
  high: { near: 110, far: 170, ringSeg: 170, wobble: 1, bloom: true, parallax: true, scrollFx: true, dpr: [1, 2], fov: 38, scale: 1 },
};

function useDeviceTier() {
  const [tier, setTier] = useState(computeTier);

  useEffect(() => {
    let timeout;
    const recompute = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setTier(computeTier()), 150);
    };
    window.addEventListener('resize', recompute);
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMq.addEventListener('change', recompute);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', recompute);
      reducedMq.removeEventListener('change', recompute);
    };
  }, []);

  return TIER_SETTINGS[tier];
}

// Flat ellipse point cloud (XZ plane, Y=0) plus a normalized angle per
// vertex — the angle feeds the ring shader's noise sampling.
function buildEllipsePoints(radiusX, radiusZ, segments) {
  const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusZ, 0, Math.PI * 2);
  const pts = curve.getPoints(segments);
  const positions = new Float32Array(pts.length * 3);
  const angles = new Float32Array(pts.length);
  pts.forEach((p, i) => {
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = p.y;
    angles[i] = i / pts.length;
  });
  return { positions, angles };
}

/* ---------------------------------------------------------------------
 * One drifting dust layer. Two of these (near/far) stacked give real
 * depth via layered parallax: different particle sizes, different
 * pointer-parallax amplitude, different radial spread.
 * ------------------------------------------------------------------- */
function DustLayer({ count, spreadMin, spreadMax, zBias, size, drift, opacity, parallaxAmount, pointerDampedRef }) {
  const groupRef = useRef();
  const matRef = useRef();

  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = spreadMin + Math.random() * (spreadMax - spreadMin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      pos[i * 3 + 2] = r * Math.cos(phi) * 0.6 + zBias;
      seed[i] = Math.random();
    }
    return [pos, seed];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, spreadMin, spreadMax, zBias]);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uTime = clock.getElapsedTime();
    if (groupRef.current && pointerDampedRef) {
      const p = pointerDampedRef.current;
      groupRef.current.position.x = p.x * parallaxAmount * 0.5;
      groupRef.current.position.y = -p.y * parallaxAmount * 0.3;
    }
  });

  if (count === 0) return null;

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aSeed" count={count} array={seeds} itemSize={1} />
        </bufferGeometry>
        <dustMaterial
          ref={matRef}
          uSize={size}
          uDrift={drift}
          uOpacity={opacity}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ---------------------------------------------------------------------
 * One tilted elliptical ring, drawn as a wobbly dashed-feeling wireframe
 * loop (wobble comes from the shader, not the geometry).
 * ------------------------------------------------------------------- */
function Ring({ radiusX, radiusZ, rotation, color, opacity, amplitude, segments }) {
  const { positions, angles } = useMemo(
    () => buildEllipsePoints(radiusX, radiusZ, segments),
    [radiusX, radiusZ, segments]
  );
  const matRef = useRef();
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uTime = clock.getElapsedTime();
  });

  return (
    <group rotation={rotation}>
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aAngle" count={angles.length} array={angles} itemSize={1} />
        </bufferGeometry>
        <ringLineMaterial
          ref={matRef}
          uColor={new THREE.Color(color)}
          uOpacity={opacity}
          uAmplitude={amplitude}
          transparent
          depthWrite={false}
        />
      </lineLoop>
    </group>
  );
}

/* ---------------------------------------------------------------------
 * A glowing marker travelling one of the rings. Speed is a base angular
 * velocity plus two incommensurate sine terms — cheap, organic-feeling
 * jitter so the orbit reads as observed rather than mechanically looped.
 * ------------------------------------------------------------------- */
function OrbitingNode({ radiusX, radiusZ, rotation, speed, phase, wobbleAmount }) {
  const posRef = useRef();

  useFrame(({ clock }) => {
    if (!posRef.current) return;
    const t = clock.getElapsedTime();
    const jitter = (Math.sin(t * 0.9 + phase) * 0.05 + Math.sin(t * 1.7 + phase * 2)) * 0.02 * wobbleAmount;
    const angle = t * speed + phase + jitter;
    posRef.current.position.set(
      Math.cos(angle) * radiusX,
      Math.sin(angle * 1.3) * 0.05 * wobbleAmount,
      Math.sin(angle) * radiusZ
    );
  });

  return (
    <group rotation={rotation}>
      <group ref={posRef}>
        <Billboard>
          <mesh>
            <planeGeometry args={[0.34, 0.34]} />
            <nodeGlowMaterial
              uColor={new THREE.Color('#E8992E')}
              uIntensity={1.3}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------------
 * The armillary sphere itself: three tilted rings, a wireframe core, and
 * two travelling markers, all inside one rig that eases toward the
 * pointer + scroll position (damped, not snapped) with a constant slow
 * auto-spin underneath so it's alive even before anyone moves the mouse.
 * ------------------------------------------------------------------- */
function InstrumentRig({ tier, pointerDampedRef, scrollDampedRef }) {
  const rigRef = useRef();
  const coreRef = useRef();
  const { scale, ringSeg, wobble } = tier;

  const ring1 = { radiusX: 1.7 * scale, radiusZ: 0.75 * scale, rotation: [deg(-22), 0, deg(-8)] };
  const ring2 = { radiusX: 1.2 * scale, radiusZ: 1.35 * scale, rotation: [deg(20), deg(14), 0] };
  const ring3 = { radiusX: 1.45 * scale, radiusZ: 1.0 * scale, rotation: [deg(58), deg(-16), 0] };

  useFrame(({ clock }, delta) => {
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.06;
    if (!rigRef.current) return;
    const t = clock.getElapsedTime();
    const p = pointerDampedRef.current;
    const s = scrollDampedRef.current;
    const autoSpin = t * 0.025;
    rigRef.current.rotation.y = autoSpin + p.x * 0.18 + s * 1.1;
    rigRef.current.rotation.x = -p.y * 0.1 + s * 0.15;
  });

  return (
    <group ref={rigRef}>
      <Ring {...ring1} color="#15141F" opacity={0.55} amplitude={0.035 * wobble} segments={ringSeg} />
      <Ring {...ring2} color="#9FC4EA" opacity={0.5} amplitude={0.03 * wobble} segments={ringSeg} />
      <Ring {...ring3} color="#E8992E" opacity={0.28} amplitude={0.025 * wobble} segments={ringSeg} />

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.26 * scale, 1]} />
        <meshBasicMaterial color="#15141F" wireframe transparent opacity={0.45} />
      </mesh>

      <OrbitingNode {...ring1} speed={0.3} phase={0} wobbleAmount={wobble} />
      <OrbitingNode {...ring2} speed={0.42} phase={Math.PI * 0.6} wobbleAmount={wobble} />
    </group>
  );
}

/* ---------------------------------------------------------------------
 * Keeps the camera FOV synced to the current tier (Canvas only applies
 * its `camera` prop once, on mount).
 * ------------------------------------------------------------------- */
function ResponsiveCamera({ fov }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, fov]);
  return null;
}

/* ---------------------------------------------------------------------
 * Scene root: owns the damped pointer/scroll signals (physical easing,
 * not raw snapping) and assembles dust + instrument + Bloom.
 * ------------------------------------------------------------------- */
function SceneContents({ tier, heroSectionRef }) {
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerDamped = useRef({ x: 0, y: 0 });
  const scrollTarget = useRef(0);
  const scrollDamped = useRef(0);

  // Pointer parallax — fine-pointer devices only, enforced by the tier
  // (touch/coarse pointers never enable tier.parallax).
  useEffect(() => {
    if (!tier.parallax) return undefined;
    const onMove = (e) => {
      pointerTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerTarget.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [tier.parallax]);

  // Scroll progress through the hero section, 0 at top → 1 once
  // scrolled roughly one hero-height past.
  useEffect(() => {
    if (!tier.scrollFx) return undefined;
    let ticking = false;
    const update = () => {
      ticking = false;
      const node = heroSectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      scrollTarget.current = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, [tier.scrollFx, heroSectionRef]);

  // Damping happens once, here, per frame — every consumer downstream
  // (dust layers, instrument rig) reads the same eased signal and just
  // scales it by its own depth-appropriate amount.
  useFrame(() => {
    pointerDamped.current.x += (pointerTarget.current.x - pointerDamped.current.x) * 0.06;
    pointerDamped.current.y += (pointerTarget.current.y - pointerDamped.current.y) * 0.06;
    scrollDamped.current += (scrollTarget.current - scrollDamped.current) * 0.05;
  });

  return (
    <>
      <ResponsiveCamera fov={tier.fov} />

      <DustLayer
        count={tier.far}
        spreadMin={2.3}
        spreadMax={3.7}
        zBias={-2.4}
        size={26}
        drift={0.35}
        opacity={0.32}
        parallaxAmount={0.35}
        pointerDampedRef={pointerDamped}
      />
      <DustLayer
        count={tier.near}
        spreadMin={1.3}
        spreadMax={2.3}
        zBias={0.6}
        size={40}
        drift={0.6}
        opacity={0.55}
        parallaxAmount={1}
        pointerDampedRef={pointerDamped}
      />

      <InstrumentRig tier={tier} pointerDampedRef={pointerDamped} scrollDampedRef={scrollDamped} />

      {tier.bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.9} intensity={0.7} mipmapBlur radius={0.6} />
        </EffectComposer>
      )}
    </>
  );
}

/**
 * HeroScene — the hero portrait's background instrument.
 *
 * A low-poly wireframe armillary sphere (three tilted, noise-wobbled
 * rings + wireframe core) with two glowing markers travelling its rings,
 * set in a soft GPU-noise-driven dust field. Responds to pointer position
 * (fine-pointer devices only) and scroll depth with damped easing, not
 * raw sine loops. Fully self-contained: absolutely positioned behind the
 * portrait photo, never intercepts pointer events, and is meant to be
 * lazy-loaded from Hero.jsx with a flat-circle Suspense fallback.
 *
 * Device tiers (viewport width + CPU cores + pointer coarseness +
 * prefers-reduced-motion) control particle counts, ring resolution,
 * whether Bloom postprocessing mounts at all, and capped DPR — real perf
 * degradation, not just CSS breakpoints. Rendering fully pauses via
 * IntersectionObserver once the hero scrolls out of view.
 */
export default function HeroScene() {
  const tier = useDeviceTier();
  const containerRef = useRef(null);
  const heroSectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    heroSectionRef.current = containerRef.current?.closest('.hero') ?? null;
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.01,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-scene" ref={containerRef} aria-hidden="true">
      <Canvas
        dpr={tier.dpr}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        camera={{ fov: tier.fov, position: [0, 0, 4.2] }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <SceneContents tier={tier} heroSectionRef={heroSectionRef} />
      </Canvas>
    </div>
  );
}
