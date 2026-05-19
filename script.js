/* ══════════════════════════════════════════
   script.js — Soham Roy Portfolio
   Lenis smooth scroll + parallax + reveals
══════════════════════════════════════════ */

/* ── Lenis smooth scroll ── */
const lenis = new Lenis({
    lerp: 0.075,
    smoothWheel: true,
    syncTouch: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ── Progress bar ── */
const progressBar = document.getElementById('progress');
lenis.on('scroll', ({ progress }) => {
    progressBar.style.width = (progress * 100) + '%';
});

/* ── Nav scroll state ── */
const nav = document.querySelector('nav');
lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 60);
});

/* ── Photo parallax — figure "rises" gently as you scroll ── */
const heroPhoto = document.querySelector('.hero-photo');
if (heroPhoto) {
    gsap.to(heroPhoto, {
        y: -55,                  /* moves up 55px over the scroll distance */
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,         /* ties movement 1:1 to scroll position */
        }
    });
}

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.08,
    rootMargin: '0px 0px -48px 0px',
});

revealEls.forEach(el => observer.observe(el));

/* ── Smooth anchor nav ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    });
});
/* ── Active nav on scroll ── */
const navSections = document.querySelectorAll('section[id]');
const navAnchors  = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navAnchors.forEach(a => a.classList.remove('active'));
            const match = document.querySelector(
                `.nav-links a[href="#${entry.target.id}"]`
            );
            if (match) match.classList.add('active');
        }
    });
}, {
    rootMargin: '-40% 0px -55% 0px',  /* triggers when section is ~middle of viewport */
    threshold: 0
});

navSections.forEach(s => navObserver.observe(s));