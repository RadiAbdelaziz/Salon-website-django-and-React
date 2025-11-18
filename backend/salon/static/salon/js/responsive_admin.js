/**
 * Responsive Admin Dashboard JavaScript
 * Handles mobile navigation and responsive interactions
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initResponsiveAdmin();
    });

    function initResponsiveAdmin() {
        // Initialize mobile navigation
        initMobileNavigation();
        
        // Initialize responsive tables
        initResponsiveTables();
        
        // Initialize touch interactions
        initTouchInteractions();
        
        // Initialize responsive charts
        initResponsiveCharts();
        
        // Initialize form enhancements
        initFormEnhancements();
        
        // Initialize accessibility features
        initAccessibilityFeatures();
    }

    function initMobileNavigation() {
        // Create mobile menu button if it doesn't exist
        if (!document.querySelector('.mobile-menu-btn')) {
            const header = document.querySelector('.main-header, .topbar, header');
            if (header) {
                const menuBtn = document.createElement('button');
                menuBtn.className = 'mobile-menu-btn';
                menuBtn.innerHTML = '☰';
                menuBtn.setAttribute('aria-label', 'Toggle navigation menu');
                header.insertBefore(menuBtn, header.firstChild);
            }
        }

        // Create sidebar overlay if it doesn't exist
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        // Handle mobile menu toggle
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.sidebar, .nav-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', function() {
                toggleSidebar();
            });

            overlay.addEventListener('click', function() {
                closeSidebar();
            });

            // Close sidebar when clicking outside
            document.addEventListener('click', function(e) {
                if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                    closeSidebar();
                }
            });
        }

        function toggleSidebar() {
            if (sidebar) {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
                document.body.classList.toggle('sidebar-open');
            }
        }

        function closeSidebar() {
            if (sidebar) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.body.classList.remove('sidebar-open');
            }
        }

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                closeSidebar();
            }
        });
    }

    function initResponsiveTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(function(table) {
            // Wrap table in responsive container if not already wrapped
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }

            // Add horizontal scroll indicator for mobile
            if (window.innerWidth < 768) {
                addScrollIndicator(table);
            }
        });

        function addScrollIndicator(table) {
            const wrapper = table.parentElement;
            if (wrapper.classList.contains('table-responsive')) {
                wrapper.style.position = 'relative';
                
                // Add scroll indicators
                const leftIndicator = document.createElement('div');
                leftIndicator.className = 'scroll-indicator scroll-indicator-left';
                leftIndicator.innerHTML = '←';
                wrapper.appendChild(leftIndicator);

                const rightIndicator = document.createElement('div');
                rightIndicator.className = 'scroll-indicator scroll-indicator-right';
                rightIndicator.innerHTML = '→';
                wrapper.appendChild(rightIndicator);

                // Update indicators on scroll
                wrapper.addEventListener('scroll', function() {
                    updateScrollIndicators(wrapper, leftIndicator, rightIndicator);
                });

                // Initial update
                updateScrollIndicators(wrapper, leftIndicator, rightIndicator);
            }
        }

        function updateScrollIndicators(wrapper, leftIndicator, rightIndicator) {
            const scrollLeft = wrapper.scrollLeft;
            const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

            leftIndicator.style.display = scrollLeft > 0 ? 'block' : 'none';
            rightIndicator.style.display = scrollLeft < maxScroll ? 'block' : 'none';
        }
    }

    function initTouchInteractions() {
        // Add touch-friendly interactions
        const buttons = document.querySelectorAll('.btn, .nav-link, .dropdown-toggle');
        buttons.forEach(function(button) {
            button.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });

            button.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
        });

        // Prevent zoom on double tap for buttons
        buttons.forEach(function(button) {
            button.addEventListener('touchend', function(e) {
                e.preventDefault();
            });
        });
    }

    function initResponsiveCharts() {
        const charts = document.querySelectorAll('.chart-container, canvas');
        
        charts.forEach(function(chart) {
            // Make charts responsive
            if (chart.tagName === 'CANVAS') {
                const container = chart.parentElement;
                if (!container.classList.contains('chart-container')) {
                    container.classList.add('chart-container');
                }
            }
        });

        // Handle chart resize on window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // Trigger chart resize if Chart.js is available
                if (window.Chart) {
                    Chart.helpers.each(Chart.instances, function(chart) {
                        chart.resize();
                    });
                }
            }, 250);
        });
    }

    function initFormEnhancements() {
        // Enhance form inputs for mobile
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(function(input) {
            // Prevent zoom on focus for iOS
            if (input.type === 'text' || input.type === 'email' || input.type === 'password') {
                input.addEventListener('focus', function() {
                    if (window.innerWidth < 768) {
                        this.style.fontSize = '16px';
                    }
                });
            }

            // Add touch-friendly focus states
            input.addEventListener('touchstart', function() {
                this.classList.add('touch-focus');
            });

            input.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-focus');
                }, 150);
            });
        });

        // Enhance form validation for mobile
        const forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                const requiredFields = form.querySelectorAll('[required]');
                let hasErrors = false;

                requiredFields.forEach(function(field) {
                    if (!field.value.trim()) {
                        field.classList.add('error');
                        hasErrors = true;
                    } else {
                        field.classList.remove('error');
                    }
                });

                if (hasErrors) {
                    e.preventDefault();
                    // Scroll to first error
                    const firstError = form.querySelector('.error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus();
                    }
                }
            });
        });
    }

    function initAccessibilityFeatures() {
        // Add keyboard navigation for mobile menu
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }

        // Add skip links for screen readers
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s ease;
        `;

        skipLink.addEventListener('focus', function() {
            this.style.top = '6px';
        });

        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add ARIA labels for mobile interactions
        const interactiveElements = document.querySelectorAll('.btn, .nav-link, .dropdown-toggle');
        interactiveElements.forEach(function(element) {
            if (!element.getAttribute('aria-label')) {
                const text = element.textContent.trim();
                if (text) {
                    element.setAttribute('aria-label', text);
                }
            }
        });
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = function() {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Export functions for external use
    window.ResponsiveAdmin = {
        init: initResponsiveAdmin,
        toggleSidebar: function() {
            const sidebar = document.querySelector('.sidebar, .nav-sidebar');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        },
        closeSidebar: function() {
            const sidebar = document.querySelector('.sidebar, .nav-sidebar');
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        }
    };

})();
