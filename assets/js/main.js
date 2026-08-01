/* ==========================================
   MAIN VANILLA JAVASCRIPT LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP Plugins if available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------
     1. LENIS SMOOTH SCROLLING
     ------------------------------------------ */
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ------------------------------------------
     2. SCROLL PROGRESS BAR
     ------------------------------------------ */
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      if (progressBar) progressBar.style.width = `${progress}%`;
    }

    // Floating WhatsApp FAB visibility
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
      if (window.scrollY > 250) {
        whatsappBtn.classList.add('show');
      } else {
        whatsappBtn.classList.remove('show');
      }
    }
  });

  /* ------------------------------------------
     3. CUSTOM DUAL CURSOR
     ------------------------------------------ */
  const dot = document.querySelector('.custom-cursor-dot');
  const ring = document.querySelector('.custom-cursor-ring');

  if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    function animateCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverables = document.querySelectorAll('a, button, .card-terminal, .project-card, .cert-card, .filter-btn, input, textarea');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ------------------------------------------
     4. BACKGROUND CANVAS ORBS
     ------------------------------------------ */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const orbs = [
      { x: width * 0.2, y: height * 0.3, radius: 280, color: 'rgba(0, 242, 254, 0.08)', vx: 0.2, vy: 0.15 },
      { x: width * 0.8, y: height * 0.6, radius: 320, color: 'rgba(0, 255, 136, 0.07)', vx: -0.15, vy: 0.2 },
      { x: width * 0.5, y: height * 0.8, radius: 240, color: 'rgba(157, 80, 187, 0.06)', vx: 0.2, vy: -0.2 }
    ];

    function drawOrbs() {
      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(7, 9, 14, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(drawOrbs);
    }
    drawOrbs();
  }

  /* ------------------------------------------
     5. MAGNETIC BUTTONS EFFECT
     ------------------------------------------ */
  const magneticElements = document.querySelectorAll('.nav-terminal-btn, .filter-btn, .brand-avatar');
  magneticElements.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.2}px, ${y * 0.2}px, 0) translateY(-2px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });

  /* ------------------------------------------
     6. TYPED.JS HERO ROLE
     ------------------------------------------ */
  const typedTarget = document.querySelector('.typed-role');
  if (typedTarget && typeof Typed !== 'undefined') {
    new Typed('.typed-role', {
      strings: [
        'Software Engineer & Backend Developer',
        'Python & Django Architect',
        'PostgreSQL & Database Engineer',
        'REST API & Cloud Specialist'
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 2200,
      loop: true
    });
  }

  /* ------------------------------------------
     7. AOS (ANIMATE ON SCROLL) INIT
     ------------------------------------------ */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80
    });
  }

  /* ------------------------------------------
     8. VANILLA TILT INIT
     ------------------------------------------ */
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('.card-terminal, .project-card, .terminal-window'), {
      max: 6,
      speed: 400,
      glare: true,
      'max-glare': 0.1,
      scale: 1.01
    });
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
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bar,
          start: 'top 85%'
        }
      });
    });
  } else {
    progressBars.forEach((bar) => {
      bar.style.width = bar.getAttribute('data-percent') || '80%';
    });
  }

  /* ------------------------------------------
     10. PROJECT FILTERING LOGIC
     ------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectItems.forEach((item) => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'flex';
          item.classList.remove('hidden');
        } else {
          item.style.display = 'none';
          item.classList.add('hidden');
        }
      });

      if (typeof AOS !== 'undefined') AOS.refresh();
    });
  });

  /* ------------------------------------------
     11. CERTIFICATE LIGHTBOX MODAL
     ------------------------------------------ */
  const certCards = document.querySelectorAll('.cert-card');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (certCards && lightboxModal && lightboxImg) {
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
      lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
      });
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  /* ------------------------------------------
     12. CONTACT FORM SUBMISSION
     ------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i> EXECUTING...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;

        if (formStatus) {
          formStatus.style.display = 'block';
          formStatus.innerHTML = '<div style="padding: 12px 18px; border-radius: 8px; background: rgba(0, 255, 136, 0.15); border: 1px solid rgba(0, 255, 136, 0.3); color: #00ff88; font-family: var(--font-mono); font-size: 0.88rem;">[SUCCESS] Message transmitted! Mohamed will respond shortly.</div>';
        }

        contactForm.reset();

        setTimeout(() => {
          if (formStatus) formStatus.style.display = 'none';
        }, 5000);
      }, 1200);
    });
  }

  /* ------------------------------------------
     13. ACTIVE NAVIGATION HIGHLIGHTING ON SCROLL
     ------------------------------------------ */
  const sections = document.querySelectorAll('section[id]');
  const terminalNavBtns = document.querySelectorAll('.nav-terminal-btn');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 250;

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
        btn.classList.remove('active');
        if (href === `#${current}`) {
          btn.classList.add('active');
        }
      }
    });
  });
});