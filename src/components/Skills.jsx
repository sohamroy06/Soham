import { motion } from 'framer-motion';
import { domains, skillClusters } from '../data/skills';
import './Skills.css';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function Skills() {
  return (
    <section className="skills" id="skills">
      <div className="section-head">
        <p className="eyebrow">Instrumentation</p>
        <h2 className="section-title">What's in the toolkit</h2>
      </div>

      <motion.div
        className="skills__domains"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {domains.map((d) => (
          <span className="domain-pill" key={d}>✦ {d}</span>
        ))}
      </motion.div>

      <div className="skills__grid">
        {skillClusters.map((cluster, i) => (
          <motion.div
            className="cluster"
            key={cluster.label}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <h3 className="cluster__label">{cluster.label}</h3>
            <div className="cluster__tags">
              {cluster.tags.map((t) => <span key={t}>{t}</span>)}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
