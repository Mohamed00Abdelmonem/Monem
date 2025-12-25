document.addEventListener('DOMContentLoaded', () => {
    // Hide the loading spinner when the page is fully loaded
    const spinner = document.getElementById('loading-spinner');
    spinner.style.opacity = '0';
    setTimeout(() => {
        spinner.style.display = 'none';
    }, 500);

    // Add a little entrance animation to the stats when scrolling
    const cards = document.querySelectorAll('.stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

    // Floating WhatsApp Button scroll listener
    window.addEventListener("scroll", () => {
      const btn = document.getElementById("whatsapp-btn");
      if (window.scrollY > 200) {
        btn.classList.add("show");
      } else {
        btn.classList.remove("show");
      }
    });

    // Welcome audio/speech logic
    const playBtn = document.getElementById('play-welcome');
    let welcomePlayed = false;
    let audioUnlocked = false;

    function removeWelcomeListeners() {
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    }

    function onFirstGesture() {
      // First user gesture should unlock audio; then try playing
      unlockAudio().then(() => tryPlayWelcome());
      removeWelcomeListeners();
    }

    function unlockAudio() {
      return new Promise((resolve) => {
        if (audioUnlocked) return resolve();
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return resolve();
          const ctx = new AudioCtx();
          ctx.resume().then(() => {
            // play a tiny silent buffer to unlock audio on some browsers
            try {
              const src = ctx.createBufferSource();
              const buffer = ctx.createBuffer(1, 1, 22050);
              src.buffer = buffer;
              src.connect(ctx.destination);
              src.start(0);
            } catch (e) {
              // ignore
            }
            audioUnlocked = true;
            setTimeout(resolve, 50);
          }).catch(() => resolve());
        } catch (e) {
          resolve();
        }
      });
    }

    function fallbackToAudio() {
      const audio = document.getElementById('welcome-audio');
      if (audio) {
        audio.currentTime = 0;
        audio.play().then(() => {
          welcomePlayed = true;
          if (playBtn) playBtn.style.display = 'none';
          removeWelcomeListeners();
        }).catch((err) => {
          console.warn('Audio playback blocked or failed:', err);
          if (playBtn) playBtn.style.display = 'inline-block';
        });
      } else {
        if (playBtn) playBtn.style.display = 'inline-block';
      }
    }

    function tryPlayWelcome() {
      if (welcomePlayed) return;
      // Ensure audio is unlocked first
      unlockAudio().then(() => {
        // Prefer SpeechSynthesis, but listen for errors/timeout and fall back to audio file
        if ('speechSynthesis' in window) {
          try {
            // const utter = new SpeechSynthesisUtterance('Welcome to my portfolio');
            utter.lang = 'en-US';
            utter.rate = 1;
            utter.onend = () => {
              welcomePlayed = true;
              if (playBtn) playBtn.style.display = 'none';
              removeWelcomeListeners();
            };
            utter.onerror = (e) => {
              console.warn('SpeechSynthesis error:', e);
              fallbackToAudio();
            };
            speechSynthesis.cancel();
            speechSynthesis.speak(utter);
            // If nothing is heard within a short time, attempt fallback
            setTimeout(() => {
              if (!welcomePlayed && !speechSynthesis.speaking) {
                fallbackToAudio();
              }
            }, 1000);
            return;
          } catch (e) {
            console.warn('SpeechSynthesis exception:', e);
          }
        }
        // Fallback to audio file
        fallbackToAudio();
      });
    }

    // Try to play on load; if blocked, wait for first gesture or button click
    tryPlayWelcome();
    window.addEventListener('click', onFirstGesture, { once: true });
    window.addEventListener('keydown', onFirstGesture, { once: true });

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        unlockAudio().then(() => tryPlayWelcome());
      });
      // ensure button is visible on load in case autoplay blocked
      playBtn.style.display = 'inline-block';
    }
});