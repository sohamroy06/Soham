import { useReducedMotion } from 'framer-motion';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import Work from './components/Work';
import Skills from './components/Skills';
import Log from './components/Log';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useIntroSequence } from './hooks/useIntroSequence';

export default function App() {
  const reducedMotion = useReducedMotion();
  const { introDone, finishIntro } = useIntroSequence(reducedMotion);

  return (
    <>
      <Intro visible={!introDone} reducedMotion={reducedMotion} onDone={finishIntro} />

      <div className="grain" aria-hidden="true" />

      <a className="skip-link" href="#main">Skip to content</a>

      <Nav />

      <main id="main">
        <Hero reducedMotion={reducedMotion} />
        <Ticker />
        <Work />
        <Skills />
        <Log />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
