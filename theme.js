// Material 3 Enhanced Theme Management
class Material3ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themeToggle = null;
    this.init();
  }

  init() {
    this.createThemeToggle();
    this.loadTheme();
    this.setupEventListeners();
    this.applyTheme();
  }

  createThemeToggle() {
    this.themeToggle = document.createElement('button');
    this.themeToggle.className = 'theme-toggle';
    this.themeToggle.setAttribute('aria-label', 'Toggle theme');
    this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    
    // Insert the theme toggle before the hamburger button
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
      hamburger.parentNode.insertBefore(this.themeToggle, hamburger);
    }
  }

  loadTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('kofc-theme');
    
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine initial theme
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else if (systemPrefersDark) {
      this.currentTheme = 'dark';
    } else {
      this.currentTheme = 'light';
    }
  }

  setupEventListeners() {
    // Theme toggle click
    this.themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });

    // System theme change detection
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('kofc-theme')) {
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.applyTheme();
        this.updateToggleIcon();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    // Add theme transition class to body for smooth transitions
    document.body.classList.add('theme-transition');
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.updateToggleIcon();
    this.saveTheme();
    this.animateThemeChange();
  }

  applyTheme() {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark');
    
    // Add new theme class
    root.classList.add(`theme-${this.currentTheme}`);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', this.currentTheme);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor();
  }

  updateToggleIcon() {
    const icon = this.themeToggle.querySelector('i');
    if (this.currentTheme === 'dark') {
      icon.className = 'fas fa-sun';
      this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      icon.className = 'fas fa-moon';
      this.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  updateMetaThemeColor() {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Set theme color based on current theme
    if (this.currentTheme === 'dark') {
      metaThemeColor.content = '#141218'; // Dark background
    } else {
      metaThemeColor.content = '#FFFBFE'; // Light background
    }
  }

  saveTheme() {
    localStorage.setItem('kofc-theme', this.currentTheme);
  }

  animateThemeChange() {
    // Add animation class
    document.body.classList.add('theme-changing');
    
    // Remove animation class after transition completes
    setTimeout(() => {
      document.body.classList.remove('theme-changing');
    }, 300);
  }

  // Public method to get current theme
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Public method to set theme programmatically
  setTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      this.currentTheme = theme;
      this.applyTheme();
      this.updateToggleIcon();
      this.saveTheme();
    }
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new Material3ThemeManager();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Material3ThemeManager;
} 