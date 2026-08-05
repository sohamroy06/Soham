import { motion } from 'framer-motion';
import './Contact.css';

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact__blob" aria-hidden="true"></div>
      <p className="eyebrow eyebrow--light">Transmission window open</p>
      <motion.h2
        className="contact__headline"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      >
        Building something that needs<br />an extra pair of hands?
      </motion.h2>
      <a className="contact__email" href="mailto:sohamroy20sr@gmail.com">sohamroy20sr@gmail.com</a>
      <div className="contact__socials">
        <a href="https://github.com/sohamroy06" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.linkedin.com/in/soham-roy-8a664a320/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="/assets/Soham_Roy_CV.pdf" download>Résumé</a>
      </div>
    </section>
  );
}
