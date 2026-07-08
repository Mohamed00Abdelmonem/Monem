// Animations & Interactions Module

export function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Run once
      }
    });
  }, revealOptions);

  reveals.forEach(el => revealObserver.observe(el));
}

export function initAnimatedCounters() {
  const stats = document.querySelectorAll('.stat-value[data-target]');

  const statsOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetValue = parseInt(target.getAttribute('data-target'));
        const suffix = target.getAttribute('data-suffix') || '';

        let startTime = null;
        const duration = 2000; // 2 seconds

        const animateCounter = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;

          // Easing logic (easeOutExpo)
          const easeProgress = progress < duration
            ? 1 - Math.pow(2, -10 * progress / duration)
            : 1;

          const currentValue = Math.floor(easeProgress * targetValue);
          target.innerText = currentValue + suffix;

          if (progress < duration) {
            requestAnimationFrame(animateCounter);
          } else {
            target.innerText = targetValue + suffix;
          }
        };

        requestAnimationFrame(animateCounter);
        observer.unobserve(target); // Run once
      }
    });
  }, statsOptions);

  stats.forEach(el => statsObserver.observe(el));
}
