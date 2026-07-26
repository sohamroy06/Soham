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

/* ── Hero title line reveal ── */
gsap.to('#hero-title .line', {
    y: '0%',
    opacity: 1,
    duration: 1.1,
    ease: 'power4.out',
    stagger: 0.12,
    delay: 0.5,
});

/* ── Section watermark parallax — big numerals drift slower than scroll ── */
document.querySelectorAll('.section-watermark').forEach((el) => {
    gsap.to(el, {
        y: 60,
        ease: 'none',
        scrollTrigger: {
            trigger: el.closest('section'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
});

/* ── Stat count-up ── */
document.querySelectorAll('.stat-num[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const useComma = el.dataset.format === 'comma';
    const counter = { val: 0 };

    ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
            gsap.to(counter, {
                val: target,
                duration: 1.6,
                ease: 'power2.out',
                onUpdate: () => {
                    let display = decimals > 0 ? counter.val.toFixed(decimals) : Math.round(counter.val).toString();
                    if (useComma) display = Number(display).toLocaleString('en-US');
                    el.textContent = display + suffix;
                },
            });
        },
    });
});

/* ── Staggered timeline card reveal ── */
gsap.set('.tl-card:not(.tl-card--art)', { opacity: 0, y: 36 });
ScrollTrigger.batch('.tl-card:not(.tl-card--art)', {
    start: 'top 85%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
    }),
});

/* ── Art cards slide in from the side their art panel sits on ── */
gsap.set('.tl-art-left', { opacity: 0, x: -48 });
gsap.set('.tl-art-right', { opacity: 0, x: 48 });
ScrollTrigger.batch('.tl-art-left', {
    start: 'top 85%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 }),
});
ScrollTrigger.batch('.tl-art-right', {
    start: 'top 85%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 }),
});

/* ── Magnetic buttons ── */
document.querySelectorAll('.cta-button').forEach((btn) => {
    const moveX = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    const moveY = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        moveX((e.clientX - rect.left - rect.width / 2) * 0.25);
        moveY((e.clientY - rect.top - rect.height / 2) * 0.35);
    });
    btn.addEventListener('mouseleave', () => {
        moveX(0);
        moveY(0);
    });
});

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

/* ── Contact form (Netlify Forms via fetch, stays on-page) ── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const status = document.getElementById('form-status');
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const formData = new FormData(contactForm);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        status.textContent = '';
        status.classList.remove('success', 'error');

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString(),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                status.textContent = "Thanks — I'll get back to you soon.";
                status.classList.add('success');
                contactForm.reset();
            })
            .catch(() => {
                status.textContent = 'Something went wrong — try emailing me directly instead.';
                status.classList.add('error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            });
    });
}