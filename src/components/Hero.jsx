import { lazy, Suspense } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './Hero.css';

// Three.js is a heavy bundle — load it only once the browser needs it,
// never as part of the initial hero paint.
const HeroScene = lazy(() => import('./HeroScene'));

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

export default function Hero({ reducedMotion }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 120, damping: 16 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 120, damping: 16 });

  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <section className="hero">
      <motion.div
        className="hero__blob hero__blob--blush"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, 30, 0], y: [0, -24, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="hero__blob hero__blob--cosmic"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, 30, 0], y: [0, -24, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: -8 }}
      />

      <div className="hero__inner">
        <div className="hero__rail" aria-label="Social links">
          <a href="https://github.com/sohamroy06" target="_blank" rel="noopener" aria-label="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.014c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.531 2.341 1.089 2.91.833.092-.647.35-1.089.636-1.34-2.221-.253-4.556-1.113-4.556-4.952 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.696-4.566 4.944.359.31.678.921.678 1.856 0 1.339-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.013C22 6.484 17.522 2 12 2Z" fill="currentColor" /></svg>
          </a>
          <a href="https://www.linkedin.com/in/soham-roy-8a664a320/" target="_blank" rel="noopener" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.94 8.5H3.56V20.5H6.94V8.5ZM5.25 3.5C4.15 3.5 3.34 4.32 3.34 5.34C3.34 6.35 4.13 7.17 5.22 7.17H5.24C6.36 7.17 7.15 6.35 7.15 5.34C7.13 4.32 6.36 3.5 5.25 3.5ZM20.66 13.5C20.66 10.36 18.99 8.9 16.77 8.9C14.99 8.9 14.19 9.88 13.74 10.57V8.5H10.36C10.4 9.48 10.36 20.5 10.36 20.5H13.74V13.9C13.74 13.55 13.76 13.2 13.86 12.95C14.14 12.25 14.78 11.53 15.85 11.53C17.25 11.53 17.28 12.85 17.28 14.02V20.5H20.66V13.5Z" fill="currentColor" /></svg>
          </a>
          <a href="mailto:sohamroy20sr@gmail.com" aria-label="Email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6.5C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" stroke="currentColor" strokeWidth="1.6" /><path d="m4 6.5 8 6.5 8-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <span className="hero__rail-line" aria-hidden="true"></span>
        </div>

        <motion.div
          className="hero__portrait-col"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div
            className="hero__portrait-wrap"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 900 }}
          >
            {/* 3D observatory scene (particles + orbiting badges) behind the
                photo. Falls back to the original flat circle while the
                Three.js bundle is still loading. */}
            <Suspense fallback={<div className="hero__portrait-blob" aria-hidden="true" />}>
              <HeroScene />
            </Suspense>
            <motion.img
              className="hero__portrait"
              src="/assets/soham_roy.png"
              alt="Portrait of Soham Roy"
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            />
            <div className="hero__badge">
              <svg viewBox="0 0 200 200" className="hero__badge-ring" aria-hidden="true">
                <defs>
                  <path id="badgePath" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
                </defs>
                <text fontSize="11.5" letterSpacing="2" fill="#15141F">
                  <textPath href="#badgePath" startOffset="0%">OPEN TO ML RESEARCH ROLES ✦ OPEN TO ML RESEARCH ROLES ✦ </textPath>
                </text>
              </svg>
              <span className="hero__badge-dot"></span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero__text"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.p className="eyebrow" variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}>
            Field notes from a small observatory in Jaipur
          </motion.p>
          <motion.h1 className="hero__name" variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}>
            Soham<br /><span className="hero__name-outline">Roy</span>
          </motion.h1>
          <motion.p className="hero__role" variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}>
            ML ENGINEER <span aria-hidden="true">//</span> ASTROPHYSICS DATA <span aria-hidden="true">//</span> MLOPS
          </motion.p>
          <motion.p className="hero__tagline" variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}>
            &ldquo;I fell in love with the feeling of making something useful exist where nothing existed before.&rdquo;
          </motion.p>
          <motion.div className="hero__ctas" variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}>
            <a className="btn btn--pill btn--dark" href="/assets/Soham_Roy_CV.pdf" download>Download CV <span aria-hidden="true">↓</span></a>
            <a className="btn btn--pill btn--ghost" href="#work">View transmissions <span aria-hidden="true">→</span></a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
