// Theme toggle with persistence
(function() {
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.textContent = root.classList.contains('dark') ? '🌙' : '☀️';
    // Notify listeners (e.g., chart) of theme change
    try { document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } })); } catch (_) {}
  }

  function init() {
    try {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = stored || (prefersDark ? 'dark' : 'light');
      applyTheme(theme);
    } catch (_) {}

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        const theme = isDark ? 'dark' : 'light';
        try { localStorage.setItem('theme', theme); } catch (_) {}
        const icon = document.getElementById('theme-toggle-icon');
        if (icon) icon.textContent = isDark ? '🌙' : '☀️';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Emit initial theme event on load for components that need it
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  } catch (_) {}
})();
