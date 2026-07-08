// Command Palette Module

export function initCommandPalette() {
  const overlay = document.getElementById('cmd-palette-overlay');
  const input = document.getElementById('cmd-input');
  const resultsContainer = document.getElementById('cmd-results');

  if (!overlay || !input || !resultsContainer) return;

  // Predefined commands/links
  const commands = [
    { title: 'Home', section: 'home', icon: 'fas fa-home' },
    { title: 'Experience', section: 'experience', icon: 'fas fa-briefcase' },
    { title: 'Products', section: 'products', icon: 'fas fa-box-open' },
    { title: 'Expertise', section: 'expertise', icon: 'fas fa-laptop-code' },
    { title: 'Architecture', section: 'architecture', icon: 'fas fa-network-wired' },
    { title: 'Tech Stack', section: 'stack', icon: 'fas fa-layer-group' },
    { title: 'Projects Gallery', section: 'projects', icon: 'fas fa-images' },
    { title: 'Contact', section: 'contact', icon: 'fas fa-envelope' },
    { title: 'Toggle Dark/Light Mode', action: 'toggle-theme', icon: 'fas fa-adjust' },
    { title: 'Download CV', action: 'download-cv', icon: 'fas fa-file-download' },
    { title: 'GitHub Profile', link: 'https://github.com/Mohamed00Abdelmonem', icon: 'fab fa-github' }
  ];

  let selectedIndex = 0;
  let filteredCommands = [...commands];

  // Open/Close logic
  function togglePalette(show) {
    if (show) {
      overlay.classList.add('active');
      input.value = '';
      filterCommands('');
      setTimeout(() => input.focus(), 50);
    } else {
      overlay.classList.remove('active');
      input.blur();
    }
  }

  // Keyboard shortcut listener
  document.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const isActive = overlay.classList.contains('active');
      togglePalette(!isActive);
    }

    // Escape to close
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      togglePalette(false);
    }
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) togglePalette(false);
  });

  // Render logic
  function renderResults() {
    resultsContainer.innerHTML = '';

    if (filteredCommands.length === 0) {
      resultsContainer.innerHTML = '<div class="cmd-item" style="justify-content:center;">No results found</div>';
      return;
    }

    filteredCommands.forEach((cmd, index) => {
      const item = document.createElement('div');
      item.className = `cmd-item ${index === selectedIndex ? 'selected' : ''}`;
      item.innerHTML = `<i class="${cmd.icon}"></i> <span>${cmd.title}</span>`;

      // Mouse enter sets selected index
      item.addEventListener('mouseenter', () => {
        selectedIndex = index;
        renderResults();
      });

      // Click executes
      item.addEventListener('click', () => executeCommand(cmd));

      resultsContainer.appendChild(item);
    });
  }

  // Filter logic
  function filterCommands(query) {
    const q = query.toLowerCase();
    filteredCommands = commands.filter(cmd => cmd.title.toLowerCase().includes(q));
    selectedIndex = 0;
    renderResults();
  }

  input.addEventListener('input', (e) => filterCommands(e.target.value));

  // Navigation logic
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % filteredCommands.length;
      renderResults();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
      renderResults();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  });

  function executeCommand(cmd) {
    togglePalette(false);

    if (cmd.section) {
      const section = document.getElementById(cmd.section);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    } else if (cmd.action === 'toggle-theme') {
      const themeBtn = document.getElementById('theme-toggle');
      if (themeBtn) themeBtn.click();
    } else if (cmd.action === 'download-cv') {
      // Logic to trigger CV download
      window.open('assets/certificate/cv.pdf', '_blank');
    } else if (cmd.link) {
      window.open(cmd.link, '_blank');
    }
  }
}
