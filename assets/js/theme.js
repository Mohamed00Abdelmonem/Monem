// Theme Toggle Module

export function initTheme() {
  const themeBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Default to dark mode as requested, unless user previously selected light
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark'); // Force dark default if no preference

  setTheme(initialTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update button icon if it exists
    if (themeBtn) {
      const icon = themeBtn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
  }
}
