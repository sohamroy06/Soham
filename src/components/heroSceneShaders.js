import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Ashima Arts' classic 3D simplex noise (public-domain-style GLSL, used
// verbatim across the three.js community). Organic, continuous, cheap
// enough to sample per-vertex every frame — this is what replaces "perfect
// sine loops" with movement that reads as hand-drawn/hand-tuned rather
// than mechanical.
const noiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

/* ---------------------------------------------------------------------
 * RingLineMaterial — the armillary sphere's rings. Each vertex carries a
 * normalized angle (aAngle) used to sample low-frequency noise, so the
 * ellipse wobbles like hand-drawn linework instead of sitting as a rigid
 * geometric curve. Amplitude is scaled by uAmplitude so lower device
 * tiers can flatten the wobble to near-zero without changing geometry.
 * ------------------------------------------------------------------- */
export const RingLineMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#15141F'),
    uOpacity: 0.5,
    uAmplitude: 0.03,
  },
  /* glsl */ `
    attribute float aAngle;
    uniform float uTime;
    uniform float uAmplitude;
    ${noiseGLSL}
    void main() {
      vec3 pos = position;
      vec3 radial = normalize(vec3(position.x, 0.0, position.z) + 1e-4);
      float n = snoise(vec3(aAngle * 2.5, uTime * 0.12, 0.0));
      pos += radial * n * uAmplitude;
      pos.y += snoise(vec3(aAngle * 4.0, uTime * 0.09, 12.0)) * uAmplitude * 0.6;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    void main() {
      gl_FragColor = vec4(uColor, uOpacity);
    }
  `
);

/* ---------------------------------------------------------------------
 * DustMaterial — the drifting dust/data-point field. Motion comes purely
 * from per-particle GPU noise (no group rotation), so the field feels
 * like ambient fluid drift rather than a spinning ring of points.
 * ------------------------------------------------------------------- */
export const DustMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 34,
    uDrift: 0.5,
    uOpacity: 0.5,
    uColorA: new THREE.Color('#F6F2E9'),
    uColorB: new THREE.Color('#9FC4EA'),
    uColorC: new THREE.Color('#E8992E'),
  },
  /* glsl */ `
    attribute float aSeed;
    varying float vSeed;
    uniform float uTime;
    uniform float uDrift;
    uniform float uSize;
    ${noiseGLSL}
    void main() {
      vSeed = aSeed;
      vec3 pos = position;
      float t = uTime * 0.06;
      pos.x += snoise(vec3(position.x * 0.6, position.y * 0.6, t + aSeed * 10.0)) * uDrift;
      pos.y += snoise(vec3(position.y * 0.6, position.z * 0.6, t + aSeed * 10.0 + 5.0)) * uDrift;
      pos.z += snoise(vec3(position.z * 0.6, position.x * 0.6, t + aSeed * 10.0 + 9.0)) * uDrift * 0.6;
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = uSize * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* glsl */ `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform float uOpacity;
    varying float vSeed;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float alpha = smoothstep(0.5, 0.0, d);
      vec3 color = mix(uColorA, uColorB, step(0.4, vSeed));
      color = mix(color, uColorC, step(0.82, vSeed));
      gl_FragColor = vec4(color, alpha * uOpacity);
    }
  `
);

/* ---------------------------------------------------------------------
 * NodeGlowMaterial — soft radial glow sprite for the two orbiting
 * "measurement" markers. Pushes bright core pixels past 1.0 so Bloom's
 * luminance threshold has something distinct to latch onto, keeping the
 * bloom localized to these markers rather than washing the whole scene.
 * ------------------------------------------------------------------- */
export const NodeGlowMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#E8992E'),
    uIntensity: 1.3,
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv - 0.5;
      float d = length(uv) * 2.0;
      float glow = smoothstep(1.0, 0.0, d);
      float core = smoothstep(0.22, 0.0, d);
      vec3 color = uColor * (glow * 0.7 + core * 1.6) * uIntensity;
      gl_FragColor = vec4(color, glow);
    }
  `
);

// Registers <ringLineMaterial>, <dustMaterial>, <nodeGlowMaterial> as JSX
// intrinsics for react-three-fiber. Importing this module (even without
// named imports) is enough to run this side effect.
extend({ RingLineMaterial, DustMaterial, NodeGlowMaterial });
