import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { projects } from '../data/projects';
import './Work.css';

function Entry({ project, index }) {
  const side = index % 2 === 0 ? 'l' : 'r';
  const nodeTop = `${2 + index * 25.3}%`;

  return (
    <motion.article
      className={`entry entry--${side}`}
      initial={{ opacity: 0, x: side === 'l' ? -44 : 44, y: 16 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <motion.span
        className="entry__node"
        style={{ '--node-top': nodeTop }}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
      />
      <div className="entry__card">
        <div className="entry__meta">
          <span className="mono">{project.year}</span>
          {project.pill && <span className="pill pill--amber">{project.pill}</span>}
        </div>
        <h3 className="entry__title">{project.title}</h3>
        <p className="entry__desc">{project.desc}</p>
        <ul className="entry__tags">
          {project.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <div className="entry__links">
          {project.links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener">[ {l.label} ]</a>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default function Work() {
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.9', 'end 0.6'],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const pathLength = reducedMotion ? 1 : smoothProgress;

  return (
    <section className="work" id="work">
      <div className="section-head">
        <p className="eyebrow">Field log</p>
        <h2 className="section-title">Transmissions from the lab</h2>
        <p className="section-lede">Four builds, four different orbits — exoplanets, markets, cities, and emissions — all run through the same instrument: a model that has to be right, not just clever.</p>
      </div>

      <div className="trajectory" id="trajectory" ref={sectionRef}>
        <svg className="trajectory__svg" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M 50 0 C 10 120, 90 220, 50 340 C 10 460, 90 560, 50 680 C 10 800, 90 900, 50 1000"
            fill="none"
            stroke="#15141F"
            strokeWidth="1.4"
            strokeLinecap="round"
            style={{ pathLength }}
          />
        </svg>

        {projects.map((project, i) => (
          <Entry key={project.title} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
