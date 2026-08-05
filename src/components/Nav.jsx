import { useState } from 'react';
import './Nav.css';

const links = [
  { href: '#work', label: 'Work' },
  { href: '#skills', label: 'Skills' },
  { href: '#log', label: 'Log' },
  { href: '#contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav" id="top">
      <div className="nav__inner">
        <a className="nav__logo" href="#top" aria-label="Soham Roy, home">
          <svg className="nav__logo-mark" width="26" height="26" viewBox="0 0 100 100" aria-hidden="true">
            <ellipse cx="50" cy="50" rx="38" ry="17" fill="none" stroke="currentColor" strokeWidth="6" transform="rotate(-20 50 50)" />
            <circle cx="50" cy="50" r="9" fill="currentColor" />
          </svg>
          <span>Soham Roy</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <div className="nav__actions">
          <a className="btn btn--pill btn--dark" href="/assets/Soham_Roy_CV.pdf" download>
            Download CV <span aria-hidden="true">↓</span>
          </a>
          <button
            className="nav__burger"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobileMenu"
            onClick={() => setOpen((o) => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <div className={`nav__mobile${open ? ' is-open' : ''}`} id="mobileMenu">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <a className="btn btn--pill btn--dark" href="/assets/Soham_Roy_CV.pdf" download onClick={() => setOpen(false)}>
          Download CV ↓
        </a>
      </div>
    </header>
  );
}
