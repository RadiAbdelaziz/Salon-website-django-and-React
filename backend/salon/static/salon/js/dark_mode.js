/**
 * Dark Mode Toggle Functionality
 * Handles theme switching and persistence
 */

(function() {
    'use strict';

    // Dark mode configuration
    const DARK_MODE_KEY = 'glammy-dark-mode';
    const DARK_CLASS = 'dark';
    
    // Theme toggle button selector
    const TOGGLE_BUTTON_SELECTOR = '#themeToggle';
    
    // Initialize dark mode functionality
    function initDarkMode() {
        // Get the toggle button
        const toggleButton = document.querySelector(TOGGLE_BUTTON_SELECTOR);
        
        if (!toggleButton) {
            console.warn('Dark mode toggle button not found - this is normal if the button is not present on this page');
            return;
        }

        // Apply saved theme on page load
        applySavedTheme();
        
        // Add click event listener
        toggleButton.addEventListener('click', toggleTheme);
        
        // Add keyboard support
        toggleButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
        
        // Update button text and aria-label
        updateToggleButton();
    }

    // Toggle between light and dark themes
    function toggleTheme() {
        const root = document.documentElement;
        const isDark = root.classList.contains(DARK_CLASS);
        
        if (isDark) {
            root.classList.remove(DARK_CLASS);
            localStorage.setItem(DARK_MODE_KEY, 'light');
        } else {
            root.classList.add(DARK_CLASS);
            localStorage.setItem(DARK_MODE_KEY, 'dark');
        }
        
        // Update button text and aria-label
        updateToggleButton();
        
        // Dispatch custom event for other scripts
        const event = new CustomEvent('themeChanged', {
            detail: { isDark: !isDark }
        });
        document.dispatchEvent(event);
    }

    // Apply saved theme from localStorage
    function applySavedTheme() {
        const savedTheme = localStorage.getItem(DARK_MODE_KEY);
        const root = document.documentElement;
        
        // Check system preference if no saved theme
        if (!savedTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add(DARK_CLASS);
                localStorage.setItem(DARK_MODE_KEY, 'dark');
            } else {
                root.classList.remove(DARK_CLASS);
                localStorage.setItem(DARK_MODE_KEY, 'light');
            }
        } else if (savedTheme === 'dark') {
            root.classList.add(DARK_CLASS);
        } else {
            root.classList.remove(DARK_CLASS);
        }
    }

    // Update toggle button text and accessibility
    function updateToggleButton() {
        const toggleButton = document.querySelector(TOGGLE_BUTTON_SELECTOR);
        if (!toggleButton) {
            // Button not found, this is normal on pages without the toggle
            return;
        }
        
        const isDark = document.documentElement.classList.contains(DARK_CLASS);
        const rtlOnly = toggleButton.querySelector('.rtl-only');
        const ltrOnly = toggleButton.querySelector('.ltr-only');
        
        if (isDark) {
            // Currently dark, show light mode option
            if (rtlOnly) rtlOnly.textContent = 'الوضع الفاتح';
            if (ltrOnly) ltrOnly.textContent = 'Light';
            toggleButton.setAttribute('aria-label', 'Switch to light mode');
            toggleButton.setAttribute('title', 'Switch to light mode');
        } else {
            // Currently light, show dark mode option
            if (rtlOnly) rtlOnly.textContent = 'الوضع الداكن';
            if (ltrOnly) ltrOnly.textContent = 'Dark';
            toggleButton.setAttribute('aria-label', 'Switch to dark mode');
            toggleButton.setAttribute('title', 'Switch to dark mode');
        }
    }

    // Listen for system theme changes
    function watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', function(e) {
            // Only apply system theme if no user preference is saved
            const savedTheme = localStorage.getItem(DARK_MODE_KEY);
            if (!savedTheme) {
                const root = document.documentElement;
                if (e.matches) {
                    root.classList.add(DARK_CLASS);
                } else {
                    root.classList.remove(DARK_CLASS);
                }
                updateToggleButton();
            }
        });
    }

    // Smooth transition between themes
    function enableSmoothTransitions() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: background-color 0.3s ease, 
                           color 0.3s ease, 
                           border-color 0.3s ease, 
                           box-shadow 0.3s ease !important;
            }
            
            /* Disable transitions during initial load */
            .no-transitions * {
                transition: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // Remove no-transitions class after a short delay
        setTimeout(() => {
            document.documentElement.classList.remove('no-transitions');
        }, 100);
    }

    // Add accessibility improvements
    function enhanceAccessibility() {
        const toggleButton = document.querySelector(TOGGLE_BUTTON_SELECTOR);
        if (!toggleButton) {
            // Button not found, this is normal on pages without the toggle
            return;
        }
        
        // Ensure button is focusable
        toggleButton.setAttribute('tabindex', '0');
        toggleButton.setAttribute('role', 'button');
        
        // Add focus styles
        const focusStyle = document.createElement('style');
        focusStyle.textContent = `
            #themeToggle:focus {
                outline: 2px solid var(--accent-color);
                outline-offset: 2px;
            }
            
            #themeToggle:focus:not(:focus-visible) {
                outline: none;
            }
        `;
        document.head.appendChild(focusStyle);
    }

    // Initialize everything when DOM is ready
    function init() {
        // Add no-transitions class initially
        document.documentElement.classList.add('no-transitions');
        
        // Initialize dark mode
        initDarkMode();
        
        // Watch for system theme changes
        watchSystemTheme();
        
        // Enable smooth transitions
        enableSmoothTransitions();
        
        // Enhance accessibility
        enhanceAccessibility();
        
        console.log('Dark mode functionality initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export functions for external use
    window.DarkMode = {
        toggle: toggleTheme,
        isDark: () => document.documentElement.classList.contains(DARK_CLASS),
        setTheme: (theme) => {
            const root = document.documentElement;
            if (theme === 'dark') {
                root.classList.add(DARK_CLASS);
                localStorage.setItem(DARK_MODE_KEY, 'dark');
            } else {
                root.classList.remove(DARK_CLASS);
                localStorage.setItem(DARK_MODE_KEY, 'light');
            }
            updateToggleButton();
        },
        getTheme: () => localStorage.getItem(DARK_MODE_KEY) || 'light'
    };

})();
