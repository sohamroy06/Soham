import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import './HeroScene.css';

// Palette pulled from the site's CSS tokens (--paper, --amber, --void,
// --cosmic). WebGL materials can't read CSS custom properties, so these
// are kept in sync by hand — update both places if the palette changes.
const COLOR_CREAM = '#F6F2E9';
const COLOR_ORANGE = '#E8992E';
const COLOR_NAVY = '#15141F';
const COLOR_COSMIC = '#9FC4EA';

// Breakpoint-driven scene settings: fewer particles and a smaller orbit
// footprint on small screens, both for legibility and for GPU cost.
function getSceneConfig(width) {
  if (width < 480) {
    return { particles: 90, orbitScale: 0.68, fov: 46, parallax: false };
  }
  if (width < 768) {
    return { particles: 160, orbitScale: 0.85, fov: 42, parallax: true };
  }
  return { particles: 260, orbitScale: 1, fov: 38, parallax: true };
}

// Window width, debounced — continuous resize drags shouldn't regenerate
// particle/orbit buffers on every pixel.
function useDebouncedWidth(delay = 150) {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth
  );

  useEffect(() => {
    let timeout;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setWidth(window.innerWidth), delay);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', onResize);
    };
  }, [delay]);

  return width;
}

// Fine-pointer (mouse/trackpad) devices only — parallax is skipped on
// touch both for feel and to avoid extra work on typically weaker GPUs.
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: fine)');
    setFine(mq.matches);
    const onChange = (e) => setFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return fine;
}

/* ---------------------------------------------------------------------
 * Faint drifting star/dust field — replaces the old flat background
 * texture. One Points object (not N meshes), so it's a single draw call.
 * ------------------------------------------------------------------- */
function ParticleField({ count }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const palette = [COLOR_CREAM, COLOR_ORANGE, COLOR_NAVY].map((c) => new THREE.Color(c));
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Loose, flattened sphere of dust around the orbit area.
      const radius = 1.8 + Math.random() * 2.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
      pos[i * 3 + 2] = radius * Math.cos(phi) * 0.55 - 0.5;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  // Ambient drift only — slow enough to never compete with the hero copy.
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.015;
    pointsRef.current.rotation.x += delta * 0.004;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ---------------------------------------------------------------------
 * One tilted elliptical orbit path, drawn as a thin dashed line loop —
 * the 3D successor to the old dashed SVG orbit rings.
 * ------------------------------------------------------------------- */
function OrbitPath({ radiusX, radiusZ, rotation, color = COLOR_NAVY, opacity = 0.32 }) {
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusZ, 0, Math.PI * 2);
    return curve.getPoints(96).map((p) => new THREE.Vector3(p.x, 0, p.y));
  }, [radiusX, radiusZ]);

  return (
    <group rotation={rotation}>
      <Line
        points={points}
        color={color}
        transparent
        opacity={opacity}
        dashed
        dashSize={0.12}
        gapSize={0.1}
        lineWidth={1}
      />
    </group>
  );
}

/* ---------------------------------------------------------------------
 * Small glowing marker that continuously travels one elliptical orbit.
 * The "glow" is a cheap two-layer trick (soft transparent halo behind a
 * solid core) rather than full bloom post-processing, to stay light.
 * ------------------------------------------------------------------- */
function OrbitingBadge({ radiusX, radiusZ, rotation, speed, phase = 0, color = COLOR_ORANGE }) {
  const positionRef = useRef();

  useFrame(({ clock }) => {
    if (!positionRef.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    positionRef.current.position.set(Math.cos(t) * radiusX, 0, Math.sin(t) * radiusZ);
  });

  return (
    <group rotation={rotation}>
      <group ref={positionRef}>
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------------
 * Keeps the camera's FOV in sync with the responsive config. <Canvas>
 * only applies its `camera` prop on first mount, so later fov changes
 * (e.g. crossing the 768px breakpoint) have to be pushed in imperatively.
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
 * Eases the whole scene toward the pointer position for a subtle
 * parallax tilt. No-ops (and never attaches a listener) when disabled.
 * ------------------------------------------------------------------- */
function ParallaxRig({ enabled, children }) {
  const groupRef = useRef();
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return undefined;
    const onPointerMove = (e) => {
      // Normalize to -1..1 across the viewport.
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [enabled]);

  useFrame(() => {
    if (!groupRef.current) return;
    const { x, y } = target.current;
    // Small max offsets — a tilt, not a pan.
    const targetRotY = enabled ? x * 0.12 : 0;
    const targetRotX = enabled ? -y * 0.08 : 0;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ---------------------------------------------------------------------
 * Scene contents: particle field + orbit paths + traveling badge dots.
 * ------------------------------------------------------------------- */
function SceneContents({ config }) {
  const scale = config.orbitScale;
  const deg = THREE.MathUtils.degToRad;

  return (
    <>
      <ResponsiveCamera fov={config.fov} />
      <ParallaxRig enabled={config.parallax}>
        <ParticleField count={config.particles} />

        {/* Flatter, wide ellipse — echoes the original SVG's rx172/ry74 ring. */}
        <OrbitPath
          radiusX={1.65 * scale}
          radiusZ={0.7 * scale}
          rotation={[deg(-24), 0, deg(-6)]}
          color={COLOR_NAVY}
        />
        {/* Taller, near-circular ellipse — echoes the rx132/ry156 ring. */}
        <OrbitPath
          radiusX={1.15 * scale}
          radiusZ={1.3 * scale}
          rotation={[deg(18), deg(10), 0]}
          color={COLOR_COSMIC}
          opacity={0.4}
        />
        {/* Third orbit, steeply tilted for extra depth. */}
        <OrbitPath
          radiusX={1.4 * scale}
          radiusZ={1.0 * scale}
          rotation={[deg(55), deg(-15), 0]}
          color={COLOR_ORANGE}
          opacity={0.22}
        />

        <OrbitingBadge
          radiusX={1.65 * scale}
          radiusZ={0.7 * scale}
          rotation={[deg(-24), 0, deg(-6)]}
          speed={0.35}
        />
        <OrbitingBadge
          radiusX={1.15 * scale}
          radiusZ={1.3 * scale}
          rotation={[deg(18), deg(10), 0]}
          speed={0.5}
          phase={Math.PI}
        />
      </ParallaxRig>
    </>
  );
}

/**
 * HeroScene — react-three-fiber background behind the hero portrait.
 *
 * Replaces the old flat CSS circle + dashed SVG orbit with a small,
 * responsive scene: drifting dust, tilted elliptical orbits, and two
 * orange markers travelling them. Self-contained and inert — it fills
 * its parent, renders behind the portrait photo, and never captures
 * pointer events (see HeroScene.css).
 *
 * Intended to be lazy-loaded from Hero.jsx with a Suspense fallback of
 * the original flat circle, so the Three.js bundle never blocks paint.
 */
export default function HeroScene() {
  const width = useDebouncedWidth();
  const finePointer = useFinePointer();
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  const config = useMemo(() => {
    const base = getSceneConfig(width);
    // Parallax also requires a fine pointer, regardless of breakpoint.
    return { ...base, parallax: base.parallax && finePointer };
  }, [width, finePointer]);

  // Pause rendering entirely once the hero scrolls out of view.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-scene" ref={containerRef} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: config.fov, position: [0, 0, 4.2] }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <SceneContents config={config} />
      </Canvas>
    </div>
  );
}
