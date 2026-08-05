import { AnimatePresence, motion } from 'framer-motion';
import './Intro.css';

export default function Intro({ visible, reducedMotion, onDone }) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="intro"
          aria-hidden="true"
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.4 : 0.55, ease: 'easeInOut' }}
        >
          <motion.div
            className="intro__scope"
            initial={{ opacity: 0, scale: 0.55 }}
            animate={
              reducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: [0, 1, 1, 0], scale: [0.55, 1, 1, 48] }
            }
            transition={
              reducedMotion
                ? { duration: 0.3 }
                : { duration: 1.9, times: [0, 0.22, 0.45, 1], ease: ['easeOut', 'linear', 'easeIn'] }
            }
          >
            <span className="intro__ring intro__ring--1" />
            <span className="intro__ring intro__ring--2" />
            <span className="intro__ring intro__ring--3" />
            <span className="intro__crosshair intro__crosshair--h" />
            <span className="intro__crosshair intro__crosshair--v" />
            <span className="intro__glint" />
          </motion.div>

          <motion.p
            className="intro__label"
            initial={{ opacity: 0 }}
            animate={{ opacity: reducedMotion ? 1 : [0, 1, 1, 0] }}
            transition={{ duration: reducedMotion ? 0.3 : 1.1, times: [0, 0.3, 0.7, 1] }}
          >
            ALIGNING TELESCOPE&hellip;
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
