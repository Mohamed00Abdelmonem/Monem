/* ==========================================
   MAIN PORTFOLIO ORCHESTRATION
   Lenis + GSAP ScrollTrigger + AwwwardsFX
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------
     1. LENIS SMOOTH SCROLLING
     ------------------------------------------ */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // Smooth anchor scrolling for header inline links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    if (anchor.classList.contains('awwwards-nav__link')) return;
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -84 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ------------------------------------------
     2. AWWWARDS FX INITIALIZATION
     ------------------------------------------ */
  const fx = window.AwwwardsFX;
  const startTerminalStream = fx && fx.prepareTerminalStream ? fx.prepareTerminalStream() : null;

  const playHeroEntrance = () => {
    if (typeof AOS !== 'undefined') AOS.refresh();
    if (typeof startTerminalStream === 'function') startTerminalStream();
    if (typeof gsap === 'undefined') return;
    gsap.from('.hero-stagger', {
      y: 16,
      opacity: 0,
      duration: 0.65,
      stagger: 0.07,
      ease: 'power3.out',
      clearProps: 'transform,opacity'
    });
  };

  if (fx) {
    fx.initDotGrid();
    fx.initLightRays();
    fx.initAwwwardsMenu(() => lenis);
    fx.initScrambleText();
    fx.initPixelReveal();
    fx.initSpotlightCards();
    fx.initPreloader(playHeroEntrance);
  } else {
    playHeroEntrance();
  }

  /* ------------------------------------------
     3. SCROLL PROGRESS BAR & WHATSAPP FAB
     ------------------------------------------ */
  const progressBar = document.getElementById('scroll-progress');
  const whatsappBtn = document.getElementById('whatsapp-btn');

  window.addEventListener(
    'scroll',
    () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && progressBar) {
        progressBar.style.width = `${(window.scrollY / totalHeight) * 100}%`;
      }
      if (whatsappBtn) {
        whatsappBtn.classList.toggle('show', window.scrollY > 250);
      }
    },
    { passive: true }
  );

  /* ------------------------------------------
     4. CUSTOM DUAL CURSOR
     ------------------------------------------ */
  const dot = document.querySelector('.custom-cursor-dot');
  const ring = document.querySelector('.custom-cursor-ring');

  if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    window.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      },
      { passive: true }
    );

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const hoverables = document.querySelectorAll(
      'a, button, .card-terminal, .project-card, .cert-card, .filter-btn, .awwwards-menu-btn'
    );
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ------------------------------------------
     5. MAGNETIC MICRO-INTERACTION
     ------------------------------------------ */
  document.querySelectorAll('.filter-btn, .terminal-social-btn, .cv-pill-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.14}px, ${y * 0.14}px, 0) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ------------------------------------------
     6. TYPED.JS HERO ROLE
     ------------------------------------------ */
  if (document.querySelector('.typed-role') && typeof Typed !== 'undefined') {
    new Typed('.typed-role', {
      strings: [
        'Software Engineer & Backend Developer',
        'Python & Django Systems Architect',
        'PostgreSQL & REST API Specialist',
        'Docker & Cloud Infrastructure Engineer'
      ],
      typeSpeed: 42,
      backSpeed: 24,
      backDelay: 2200,
      loop: true
    });
  }

  /* ------------------------------------------
     7. AOS & VANILLA TILT
     ------------------------------------------ */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      once: true,
      offset: 20
    });
    window.addEventListener('load', () => AOS.refresh());
  }

  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('.terminal-window'), {
      max: 2.5,
      speed: 500,
      glare: true,
      'max-glare': 0.06,
      scale: 1.005
    });
  }

  /* ------------------------------------------
     8. ANIMATED STAT COUNTERS
     ------------------------------------------ */
  const statEls = document.querySelectorAll('.stat-number[data-count]');
  if (statEls.length && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10) || 0;
          const suffix = el.dataset.suffix || '';
          const duration = 1100;
          const start = performance.now();

          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target + suffix;
          };
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    statEls.forEach((el) => statObserver.observe(el));
  }

  /* ------------------------------------------
     9. SKILLS PROGRESS FILL ON SCROLL
     ------------------------------------------ */
  const progressBars = document.querySelectorAll('.progress-fill');
  if (progressBars.length > 0 && typeof ScrollTrigger !== 'undefined') {
    progressBars.forEach((bar) => {
      const targetWidth = bar.getAttribute('data-percent') || '80%';
      gsap.to(bar, {
        width: targetWidth,
        duration: 1.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bar,
          start: 'top 88%'
        }
      });
    });
  } else {
    progressBars.forEach((bar) => {
      bar.style.width = bar.getAttribute('data-percent') || '80%';
    });
  }

  /* ------------------------------------------
     10. PROJECTS SWIPER SLIDER & FILTERING
     ------------------------------------------ */
  if (typeof Swiper !== 'undefined' && document.querySelector('.projects-swiper')) {
    const projectsSwiper = new Swiper('.projects-swiper', {
      slidesPerView: 1,
      spaceBetween: 18,
      grabCursor: true,
      navigation: {
        nextEl: '.project-swiper-next',
        prevEl: '.project-swiper-prev'
      },
      pagination: {
        el: '.project-swiper-pagination',
        type: 'fraction'
      },
      breakpoints: {
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.projects-swiper .swiper-slide');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        projectItems.forEach((item) => {
          const category = item.getAttribute('data-category');
          item.style.display = filter === 'all' || category === filter ? 'flex' : 'none';
        });

        projectsSwiper.update();
        projectsSwiper.slideTo(0);
        if (typeof AOS !== 'undefined') AOS.refresh();
      });
    });
  }

  /* ------------------------------------------
     11. CERTIFICATE LIGHTBOX MODAL
     ------------------------------------------ */
  const certCards = document.querySelectorAll('.cert-card');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (certCards.length && lightboxModal && lightboxImg) {
    certCards.forEach((card) => {
      card.addEventListener('click', () => {
        const imgSrc = card.getAttribute('data-img');
        if (imgSrc) {
          lightboxImg.src = imgSrc;
          lightboxModal.classList.add('active');
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => lightboxModal.classList.remove('active'));
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  /* ------------------------------------------
     12. ACTIVE NAVIGATION HIGHLIGHTING ON SCROLL
     ------------------------------------------ */
  const sections = document.querySelectorAll('section[id]');
  const terminalNavBtns = document.querySelectorAll('.nav-terminal-btn');

  window.addEventListener(
    'scroll',
    () => {
      let current = '';
      const scrollPosition = window.scrollY + 220;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });

      terminalNavBtns.forEach((btn) => {
        const href = btn.getAttribute('href');
        if (href && href.startsWith('#')) {
          btn.classList.toggle('active', href === `#${current}`);
        }
      });
    },
    { passive: true }
  );
});
