/* ==========================================
   AWWWARDS PACK FX MODULE
   Curated & Adapted from Awwwards Pack:
   - Hero/5: Curved SVG Curtain Preloader
   - Background/1: WebGL Volumetric Light Rays
   - Background/10: Physics Interactive Dot Grid
   - Navigation/2: 3D Expanding Pill Menu
   - Text/4: Scramble Text Reveal & Hover
   - Hover/3: Pixelated Image Shimmer Reveal
   ========================================== */

(function (global) {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------
     1. CURVED SVG CURTAIN PRELOADER (Hero/5)
     ------------------------------------------ */
  function initPreloader(onRevealComplete) {
    const preloader = document.getElementById('js-preloader');
    const wordText = document.getElementById('js-word-text');
    const wordEl = document.getElementById('js-word');
    const path = document.getElementById('js-path');

    if (!preloader || !wordText || !wordEl || !path || typeof gsap === 'undefined' || prefersReducedMotion) {
      if (preloader) preloader.style.display = 'none';
      if (typeof onRevealComplete === 'function') onRevealComplete();
      return;
    }

    const words = ['Hello', 'السلام عليكم', 'Python', 'Django', 'Monem.'];
    let finished = false;

    const getPaths = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      return {
        initialPath: `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + 240} 0 ${h} L0 0`,
        targetPath: `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`
      };
    };

    path.setAttribute('d', getPaths().initialPath);
    wordText.textContent = words[0];

    gsap.to(wordEl, { opacity: 0.92, duration: 0.35, delay: 0.08, ease: 'power2.out' });

    let idx = 0;
    const cycleWords = () => {
      if (finished || idx >= words.length - 1) return;
      const delay = idx === 0 ? 0.34 : 0.14;
      gsap.delayedCall(delay, () => {
        if (finished) return;
        idx += 1;
        wordText.textContent = words[idx];
        cycleWords();
      });
    };
    cycleWords();

    const finishPreloader = () => {
      if (finished) return;
      finished = true;
      const { targetPath } = getPaths();

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          preloader.style.display = 'none';
          if (typeof onRevealComplete === 'function') onRevealComplete();
        }
      });

      tl.to(wordEl, { opacity: 0, y: -14, duration: 0.28 }, 0);
      tl.to(preloader, { yPercent: -100, duration: 0.72 }, 0.08);
      tl.to(path, { attr: { d: targetPath }, duration: 0.72 }, 0.08);
    };

    // Click anywhere on preloader to skip immediately
    preloader.addEventListener('click', finishPreloader, { once: true });
    gsap.delayedCall(1.18, finishPreloader);
  }

  /* ------------------------------------------
     2. WEBGL VOLUMETRIC LIGHT RAYS (Background/1)
     ------------------------------------------ */
  function initLightRays() {
    if (prefersReducedMotion) return;
    const container = document.querySelector('.light-rays');
    if (!container) return;

    const hexToRgb = (hex) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m
        ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
        : [0.22, 0.74, 0.97];
    };

    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' }) ||
      canvas.getContext('experimental-webgl', { alpha: true });

    if (!gl) return;
    container.appendChild(canvas);

    const vert = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const frag = `precision highp float;
      uniform float iTime;
      uniform vec2  iResolution;
      uniform vec2  rayPos;
      uniform vec2  rayDir;
      uniform vec3  raysColor;
      uniform float raysSpeed;
      uniform float lightSpread;
      uniform float rayLength;
      uniform float fadeDistance;
      uniform vec2  mousePos;
      uniform float mouseInfluence;

      float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
        vec2 sourceToCoord = coord - raySource;
        vec2 dirNorm = normalize(sourceToCoord);
        float cosAngle = dot(dirNorm, rayRefDirection);
        float spreadFactor = pow(max(cosAngle, 0.0), 1.0 / max(lightSpread, 0.001));
        float distance = length(sourceToCoord);
        float maxDistance = iResolution.x * rayLength;
        float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
        float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.35, 1.0);
        float baseStrength = clamp(
          (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
          (0.30 + 0.20 * cos(-cosAngle * seedB + iTime * speed)),
          0.0, 1.0
        );
        return baseStrength * lengthFalloff * fadeFalloff * spreadFactor;
      }

      void main() {
        vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
        vec2 finalRayDir = rayDir;
        if (mouseInfluence > 0.0) {
          vec2 mouseScreenPos = mousePos * iResolution.xy;
          finalRayDir = normalize(mix(rayDir, normalize(mouseScreenPos - rayPos), mouseInfluence));
        }
        float r1 = rayStrength(rayPos, finalRayDir, coord, 34.2, 20.1, 1.3 * raysSpeed);
        float r2 = rayStrength(rayPos, finalRayDir, coord, 21.4, 17.5, 0.95 * raysSpeed);
        float intensity = r1 * 0.45 + r2 * 0.35;
        float brightness = 1.0 - (coord.y / iResolution.y);
        vec3 col = raysColor * intensity * (0.25 + brightness * 0.75);
        gl_FragColor = vec4(col, clamp(intensity * 0.85, 0.0, 1.0));
      }
    `;

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    };

    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'iTime');
    const uRes = gl.getUniformLocation(program, 'iResolution');
    const uRayPos = gl.getUniformLocation(program, 'rayPos');
    const uRayDir = gl.getUniformLocation(program, 'rayDir');
    const uColor = gl.getUniformLocation(program, 'raysColor');
    const uSpeed = gl.getUniformLocation(program, 'raysSpeed');
    const uSpread = gl.getUniformLocation(program, 'lightSpread');
    const uLen = gl.getUniformLocation(program, 'rayLength');
    const uFade = gl.getUniformLocation(program, 'fadeDistance');
    const uMouse = gl.getUniformLocation(program, 'mousePos');
    const uMouseInf = gl.getUniformLocation(program, 'mouseInfluence');

    const rgb = hexToRgb(container.dataset.color || '#38bdf8');
    gl.uniform3fv(uColor, new Float32Array(rgb));
    gl.uniform1f(uSpeed, parseFloat(container.dataset.speed || '0.75'));
    gl.uniform1f(uSpread, parseFloat(container.dataset.spread || '0.65'));
    gl.uniform1f(uLen, parseFloat(container.dataset.length || '2.4'));
    gl.uniform1f(uFade, parseFloat(container.dataset.fade || '1.1'));
    gl.uniform1f(uMouseInf, parseFloat(container.dataset.mouse || '0.12'));

    let w = 1;
    let h = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, Math.floor(container.clientWidth * dpr));
      h = Math.max(1, Math.floor(container.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: 0.5, y: 0.4 };
    const smooth = { x: 0.5, y: 0.4 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX / Math.max(1, window.innerWidth);
      mouse.y = e.clientY / Math.max(1, window.innerHeight);
    }, { passive: true });

    const loop = (t) => {
      smooth.x = smooth.x * 0.92 + mouse.x * 0.08;
      smooth.y = smooth.y * 0.92 + mouse.y * 0.08;
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, w, h);
      gl.uniform2f(uRayPos, w * 0.5, -0.18 * h);
      gl.uniform2f(uRayDir, 0, 1);
      gl.uniform2f(uMouse, smooth.x, smooth.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ------------------------------------------
     3. PHYSICS INTERACTIVE DOT GRID (Background/10)
     ------------------------------------------ */
  function initDotGrid() {
    const root = document.querySelector('[data-dot-grid]');
    if (!root) return;

    const canvas = root.querySelector('.dot-grid__canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dotSize = parseFloat(root.dataset.dotSize || '2.4');
    const gap = parseFloat(root.dataset.gap || '26');
    const proximity = parseFloat(root.dataset.proximity || '135');
    const shockRadius = parseFloat(root.dataset.shockRadius || '220');
    const shockStrength = parseFloat(root.dataset.shockStrength || '4.2');
    const resistance = parseFloat(root.dataset.resistance || '720');
    const returnDuration = parseFloat(root.dataset.returnDuration || '1.35');

    const baseRgb = { r: 24, g: 34, b: 54 };
    const activeRgb = { r: 56, g: 189, b: 248 };

    const dots = [];
    const pointer = { x: -9999, y: -9999, lastX: 0, lastY: 0, lastTime: 0 };
    let w = 1;
    let h = 1;
    const proxSq = proximity * proximity;
    let circlePath = null;

    const buildGrid = () => {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (window.Path2D) {
        circlePath = new Path2D();
        circlePath.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
      }

      const cell = dotSize + gap;
      const cols = Math.floor((w + gap) / cell);
      const rows = Math.floor((h + gap) / cell);
      const startX = (w - (cell * cols - gap)) / 2 + dotSize / 2;
      const startY = (h - (cell * rows - gap)) / 2 + dotSize / 2;

      dots.length = 0;
      for (let yy = 0; yy < rows; yy++) {
        for (let xx = 0; xx < cols; xx++) {
          dots.push({
            cx: startX + xx * cell,
            cy: startY + yy * cell,
            xOffset: 0,
            yOffset: 0,
            vx: 0,
            vy: 0
          });
        }
      }
    };

    buildGrid();
    window.addEventListener('resize', buildGrid);

    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', (e) => {
        const now = performance.now();
        const dt = Math.max(8, now - pointer.lastTime);
        const vx = ((e.clientX - pointer.lastX) / dt) * 16;
        const vy = ((e.clientY - pointer.lastY) / dt) * 16;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.lastX = e.clientX;
        pointer.lastY = e.clientY;
        pointer.lastTime = now;

        const speed = Math.hypot(vx, vy);
        if (speed > 6) {
          for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            const dx = d.cx - pointer.x;
            const dy = d.cy - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < proxSq && distSq > 1) {
              const dist = Math.sqrt(distSq);
              const factor = (1 - dist / proximity) * 0.45;
              d.vx += vx * factor;
              d.vy += vy * factor;
            }
          }
        }
      }, { passive: true });

      window.addEventListener('click', (e) => {
        const cx = e.clientX;
        const cy = e.clientY;
        const shockSq = shockRadius * shockRadius;
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          const dx = d.cx - cx;
          const dy = d.cy - cy;
          const dsq = dx * dx + dy * dy;
          if (dsq < shockSq && dsq > 0.1) {
            const dist = Math.sqrt(dsq);
            const push = (1 - dist / shockRadius) * shockStrength * 45;
            d.vx += (dx / dist) * push;
            d.vy += (dy / dist) * push;
          }
        }
      }, { passive: true });
    }

    let last = performance.now();
    const tick = (now) => {
      const dtMs = Math.min(32, now - last);
      last = now;
      const dt = dtMs / 1000;

      ctx.clearRect(0, 0, w, h);

      const omega = 8 / Math.max(0.05, returnDuration);
      const k = omega * omega;
      const c = 2 * omega;
      const drag = Math.exp(-dtMs / Math.max(60, resistance));

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        dot.vx += (-k * dot.xOffset - c * dot.vx) * dt;
        dot.vy += (-k * dot.yOffset - c * dot.vy) * dt;
        dot.vx *= drag;
        dot.vy *= drag;
        dot.xOffset += dot.vx * dt;
        dot.yOffset += dot.vy * dt;

        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;
        const dx = dot.cx - pointer.x;
        const dy = dot.cy - pointer.y;
        const dsq = dx * dx + dy * dy;

        let style = `rgb(${baseRgb.r},${baseRgb.g},${baseRgb.b})`;
        if (dsq <= proxSq) {
          const t = 1 - Math.sqrt(dsq) / proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          style = `rgb(${r},${g},${b})`;
        }

        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = style;
        if (circlePath) {
          ctx.fill(circlePath);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (!prefersReducedMotion) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  /* ------------------------------------------
     4. AWWWARDS EXPANDING PILL MENU (Navigation/2)
     ------------------------------------------ */
  function initAwwwardsMenu(getLenis) {
    const menuPanel = document.getElementById('menuPanel');
    const btnSlider = document.getElementById('btnSlider');
    const nav = document.getElementById('awwwardsNav');
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.querySelectorAll('.awwwards-nav__link');
    const footerLinks = document.querySelectorAll('.awwwards-nav__footer-link');

    if (!menuPanel || !btnSlider || !nav || !menuBtn || typeof gsap === 'undefined') return;

    let isOpen = false;
    const isCompactViewport = () => window.innerWidth < 540;

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.inOut' }
    });

    tl.to(menuPanel, {
      width: () => (isCompactViewport() ? Math.min(310, window.innerWidth - 28) : 340),
      height: 410,
      top: -6,
      right: -6,
      borderRadius: 18,
      duration: 0.65
    });

    tl.to(btnSlider, { top: '-100%', duration: 0.45 }, 0);
    tl.add(() => nav.classList.add('nav--visible'), 0.16);

    tl.set(
      navLinks,
      {
        opacity: 0,
        rotateX: 85,
        y: 38,
        x: -12,
        transformPerspective: 300,
        transformOrigin: 'bottom'
      },
      0
    );

    tl.to(
      navLinks,
      {
        opacity: 1,
        rotateX: 0,
        y: 0,
        x: 0,
        duration: 0.52,
        ease: 'back.out(1.2)',
        stagger: 0.06
      },
      0.28
    );

    tl.set(footerLinks, { opacity: 0, y: 12 }, 0);
    tl.to(
      footerLinks,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.06
      },
      0.45
    );

    tl.eventCallback('onReverseComplete', () => {
      nav.classList.remove('nav--visible');
    });

    const closeMenu = () => {
      if (!isOpen) return;
      isOpen = false;
      menuBtn.setAttribute('aria-expanded', 'false');
      tl.reverse();
    };

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) tl.play();
      else tl.reverse();
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        closeMenu();
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const lenis = typeof getLenis === 'function' ? getLenis() : null;
            if (lenis) lenis.scrollTo(target, { offset: -84 });
            else target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !menuPanel.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });
  }

  /* ------------------------------------------
     5. SCRAMBLE TEXT EFFECT (Text/4 & Text/1)
     ------------------------------------------ */
  function scrambleElement(el, durationMs = 460) {
    if (prefersReducedMotion || !el) return;
    const original = el.dataset.scrambleText || el.textContent;
    el.dataset.scrambleText = original;

    const glyphs = '.:/\\_-<>01+*#';
    const start = performance.now();

    if (el._scrambleRaf) cancelAnimationFrame(el._scrambleRaf);

    const step = (now) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const revealed = Math.floor(progress * original.length);
      let out = '';

      for (let i = 0; i < original.length; i++) {
        const ch = original[i];
        if (ch === ' ' || i < revealed) {
          out += ch;
        } else {
          out += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      }

      el.textContent = out;
      if (progress < 1) {
        el._scrambleRaf = requestAnimationFrame(step);
      } else {
        el.textContent = original;
      }
    };

    el._scrambleRaf = requestAnimationFrame(step);
  }

  function initScrambleText() {
    const items = document.querySelectorAll('[data-scramble]');
    if (!items.length) return;

    items.forEach((el) => {
      el.dataset.scrambleText = el.textContent;
      el.addEventListener('mouseenter', () => scrambleElement(el, 420));
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              scrambleElement(entry.target, 520);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      items.forEach((el) => io.observe(el));
    }
  }

  /* ------------------------------------------
     6. PIXELATED IMAGE SHIMMER REVEAL (Hover/3)
     ------------------------------------------ */
  function initPixelReveal() {
    if (prefersReducedMotion || typeof gsap === 'undefined') return;
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const gridSize = 7;
    const pixelSize = 100 / gridSize;
    const frames = document.querySelectorAll('[data-pixelated-reveal]');

    frames.forEach((frame) => {
      const grid = document.createElement('div');
      grid.className = 'pixel-reveal__grid';
      const pixels = [];

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const cell = document.createElement('div');
          cell.className = 'pixel-reveal__cell';
          cell.style.width = `${pixelSize}%`;
          cell.style.height = `${pixelSize}%`;
          cell.style.left = `${c * pixelSize}%`;
          cell.style.top = `${r * pixelSize}%`;
          grid.appendChild(cell);
          pixels.push(cell);
        }
      }

      frame.appendChild(grid);

      const card = frame.closest('.project-card') || frame;
      let delayed;

      const triggerShimmer = () => {
        gsap.killTweensOf(pixels);
        if (delayed) delayed.kill();

        gsap.set(pixels, { display: 'none', opacity: 0.9 });
        gsap.to(pixels, {
          display: 'block',
          duration: 0,
          stagger: { each: 0.24 / pixels.length, from: 'random' }
        });

        delayed = gsap.delayedCall(0.24, () => {
          gsap.to(pixels, {
            display: 'none',
            duration: 0,
            stagger: { each: 0.22 / pixels.length, from: 'random' }
          });
        });
      };

      card.addEventListener('mouseenter', triggerShimmer);
    });
  }

  /* ------------------------------------------
     7. SPOTLIGHT RADIAL CARD GLOW
     ------------------------------------------ */
  function initSpotlightCards() {
    const cards = document.querySelectorAll('.card-terminal, .project-card');
    cards.forEach((card) => {
      card.addEventListener(
        'mousemove',
        (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
        },
        { passive: true }
      );
    });
  }

  /* ------------------------------------------
     8. TERMINAL BULLETS LIVE STREAMING
     ------------------------------------------ */
  function prepareTerminalStream() {
    const items = Array.from(document.querySelectorAll('.terminal-bullet-item'));
    if (!items.length || prefersReducedMotion) return () => {};

    const prepared = items.map((item) => {
      const textEl = item.querySelector('.terminal-bullet-text');
      const fullText = (textEl ? textEl.textContent : '').replace(/\s+/g, ' ').trim();
      if (textEl) {
        const h = textEl.offsetHeight;
        if (h > 0) textEl.style.minHeight = `${h}px`;
        textEl.textContent = '';
      }
      item.classList.add('is-pending');
      return { item, textEl, fullText };
    });

    let started = false;

    return function startTerminalStream() {
      if (started) return;
      started = true;

      let lineIdx = 0;

      const streamNextLine = () => {
        if (lineIdx >= prepared.length) return;
        const { item, textEl, fullText } = prepared[lineIdx];
        lineIdx += 1;

        if (!textEl) {
          streamNextLine();
          return;
        }

        item.classList.remove('is-pending');
        item.classList.add('is-streaming');

        const caret = document.createElement('span');
        caret.className = 'stream-caret';
        const textNode = document.createTextNode('');
        textEl.textContent = '';
        textEl.appendChild(textNode);
        textEl.appendChild(caret);

        let charIdx = 0;
        const step = () => {
          charIdx = Math.min(fullText.length, charIdx + 2);
          textNode.nodeValue = fullText.slice(0, charIdx);

          if (charIdx < fullText.length) {
            setTimeout(step, 18);
          } else {
            caret.remove();
            textEl.style.minHeight = '';
            item.classList.remove('is-streaming');
            item.classList.add('is-done');
            setTimeout(streamNextLine, 90);
          }
        };

        step();
      };

      setTimeout(streamNextLine, 160);
    };
  }

  global.AwwwardsFX = {
    initPreloader,
    initLightRays,
    initDotGrid,
    initAwwwardsMenu,
    initScrambleText,
    initPixelReveal,
    initSpotlightCards,
    prepareTerminalStream,
    scrambleElement
  };
})(window);
