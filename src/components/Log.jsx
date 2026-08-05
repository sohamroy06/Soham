import { motion } from 'framer-motion';
import { achievements, education, experience } from '../data/log';
import './Log.css';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

function renderDesc(desc) {
  if (typeof desc === 'string') return desc;
  return desc.map((part, i) =>
    typeof part === 'string'
      ? <span key={i}>{part}</span>
      : <a key={i} href={part.href} target="_blank" rel="noopener">{part.text}</a>
  );
}

export default function Log() {
  return (
    <section className="log" id="log">
      <div className="section-head">
        <p className="eyebrow">Log entries</p>
        <h2 className="section-title">Experience &amp; recognition</h2>
      </div>

      <div className="log__grid">
        <motion.div
          className="log__col"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h3 className="log__heading">Experience &amp; leadership</h3>
          {experience.map((item) => (
            <div className="log-item" key={item.role}>
              <div className="log-item__top">
                <span className="log-item__role">{item.role}</span>
                <span className="mono">{item.year}</span>
              </div>
              <p className="log-item__org">{item.org}</p>
              <p className="log-item__desc">{renderDesc(item.desc)}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="log__col"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h3 className="log__heading">Achievements</h3>
          <ul className="badges">
            {achievements.map((a) => (
              <li className="badge" key={a}><span className="badge__mark">✦</span> {a}</li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        className="log__education"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <h3 className="log__heading">Education</h3>
        <div className="edu-strip">
          {education.map((e) => (
            <div className="edu-item" key={e.role}>
              <span className="mono">{e.year}</span>
              <p className="edu-item__role">{e.role}</p>
              <p className="edu-item__org">{e.org} <b>{e.stat}</b></p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
