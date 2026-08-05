(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- intro ----
  const intro = document.getElementById('intro');
  if (intro) {
    document.documentElement.classList.add('intro-lock');
    const clearIntro = () => {
      document.documentElement.classList.remove('intro-lock');
      intro.remove();
    };
    intro.addEventListener('animationend', (e) => {
      if (e.animationName === 'intro-bg-out' || e.animationName === 'intro-fade-out') clearIntro();
    });
    setTimeout(clearIntro, reduceMotion ? 1200 : 2500);
  }

  // ---- mobile menu ----
  const burger = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- scroll reveal ----
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---- trajectory line draw-on-scroll ----
  const path = document.getElementById('trajectoryPath');
  const section = document.getElementById('trajectory');
  if (path && section) {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    if (reduceMotion) {
      path.style.strokeDashoffset = '0';
    } else {
      path.style.strokeDashoffset = `${length}`;

      let ticking = false;
      const update = () => {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height + vh * 0.6;
        const progressed = vh * 0.85 - rect.top;
        let progress = progressed / total;
        progress = Math.min(1, Math.max(0, progress));
        path.style.strokeDashoffset = `${length * (1 - progress)}`;
        ticking = false;
      };
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    }
  }
})();
