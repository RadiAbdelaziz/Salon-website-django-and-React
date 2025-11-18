/**
 * Mobile Enhancements for Django Admin
 * Advanced mobile-specific JavaScript functionality
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initMobileEnhancements();
    });

    function initMobileEnhancements() {
        // Initialize mobile navigation
        initMobileNavigation();
        
        // Initialize responsive tables
        initResponsiveTables();
        
        // Initialize touch interactions
        initTouchInteractions();
        
        // Initialize form enhancements
        initFormEnhancements();
        
        // Initialize accessibility features
        initAccessibilityFeatures();
        
        // Initialize performance optimizations
        initPerformanceOptimizations();
    }

    function initMobileNavigation() {
        // Create mobile header if it doesn't exist
        createMobileHeader();
        
        // Create sidebar overlay
        createSidebarOverlay();
        
        // Initialize mobile menu functionality
        initMobileMenu();
        
        // Handle window resize
        handleWindowResize();
    }

    function createMobileHeader() {
        if (window.innerWidth < 768 && !document.querySelector('.mobile-header')) {
            const header = document.createElement('div');
            header.className = 'mobile-header';
            header.innerHTML = `
                <button class="mobile-menu-btn" aria-label="Toggle navigation menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div class="mobile-logo">
                    <img src="/static/logo-05.png" alt="Glammy Logo" style="height: 32px;">
                </div>
                <div class="mobile-actions">
                    <button class="mobile-search-btn" aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            document.body.insertBefore(header, document.body.firstChild);
        }
    }

    function createSidebarOverlay() {
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }
    }

    function initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.sidebar, .nav-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', function(e) {
                e.preventDefault();
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

            // Close sidebar on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeSidebar();
                }
            });
        }
    }

    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar, .nav-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
            
            // Update ARIA attributes
            const isOpen = sidebar.classList.contains('open');
            sidebar.setAttribute('aria-hidden', !isOpen);
            overlay.setAttribute('aria-hidden', !isOpen);
        }
    }

    function closeSidebar() {
        const sidebar = document.querySelector('.sidebar, .nav-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            
            // Update ARIA attributes
            sidebar.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    function handleWindowResize() {
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (window.innerWidth >= 768) {
                    closeSidebar();
                }
                
                // Recreate mobile header if needed
                if (window.innerWidth < 768 && !document.querySelector('.mobile-header')) {
                    createMobileHeader();
                    initMobileMenu();
                }
            }, 250);
        });
    }

    function initResponsiveTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(function(table) {
            // Wrap table in responsive container
            wrapTableInResponsiveContainer(table);
            
            // Add scroll indicators
            addScrollIndicators(table);
            
            // Add mobile card view option
            addMobileCardView(table);
        });
    }

    function wrapTableInResponsiveContainer(table) {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    }

    function addScrollIndicators(table) {
        const wrapper = table.parentElement;
        if (wrapper.classList.contains('table-responsive')) {
            // Add scroll indicators
            const leftIndicator = document.createElement('div');
            leftIndicator.className = 'scroll-indicator scroll-indicator-left';
            leftIndicator.innerHTML = '←';
            leftIndicator.setAttribute('aria-hidden', 'true');
            wrapper.appendChild(leftIndicator);

            const rightIndicator = document.createElement('div');
            rightIndicator.className = 'scroll-indicator scroll-indicator-right';
            rightIndicator.innerHTML = '→';
            rightIndicator.setAttribute('aria-hidden', 'true');
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

    function addMobileCardView(table) {
        if (window.innerWidth < 768) {
            const wrapper = table.parentElement;
            if (wrapper.classList.contains('table-responsive')) {
                // Create card view toggle
                const toggle = document.createElement('button');
                toggle.className = 'card-view-toggle';
                toggle.innerHTML = 'Card View';
                toggle.style.cssText = `
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    padding: 0.5rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    cursor: pointer;
                    z-index: 10;
                `;
                
                wrapper.style.position = 'relative';
                wrapper.appendChild(toggle);
                
                // Toggle between table and card view
                toggle.addEventListener('click', function() {
                    toggleCardView(table, wrapper);
                });
            }
        }
    }

    function toggleCardView(table, wrapper) {
        const isCardView = wrapper.classList.contains('card-view');
        
        if (isCardView) {
            // Switch to table view
            wrapper.classList.remove('card-view');
            table.style.display = 'table';
            wrapper.querySelector('.card-view-toggle').innerHTML = 'Card View';
        } else {
            // Switch to card view
            wrapper.classList.add('card-view');
            table.style.display = 'none';
            wrapper.querySelector('.card-view-toggle').innerHTML = 'Table View';
            
            // Create card view if it doesn't exist
            if (!wrapper.querySelector('.card-view-container')) {
                createCardView(table, wrapper);
            }
        }
    }

    function createCardView(table, wrapper) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-view-container';
        
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(function(row) {
            const card = document.createElement('div');
            card.className = 'table-card';
            
            const cells = row.querySelectorAll('td');
            const headers = table.querySelectorAll('th');
            
            let cardContent = '<div class="table-card-header">';
            cardContent += `<div class="table-card-title">${cells[0]?.textContent || ''}</div>`;
            cardContent += '<div class="table-card-actions">';
            cardContent += '<button class="btn btn-sm">Edit</button>';
            cardContent += '<button class="btn btn-sm">Delete</button>';
            cardContent += '</div></div>';
            
            cardContent += '<div class="table-card-body">';
            for (let i = 1; i < cells.length; i++) {
                if (headers[i]) {
                    cardContent += `<div class="table-card-field">`;
                    cardContent += `<div class="table-card-label">${headers[i].textContent}</div>`;
                    cardContent += `<div class="table-card-value">${cells[i]?.textContent || ''}</div>`;
                    cardContent += `</div>`;
                }
            }
            cardContent += '</div>';
            
            card.innerHTML = cardContent;
            cardContainer.appendChild(card);
        });
        
        wrapper.appendChild(cardContainer);
    }

    function initTouchInteractions() {
        // Add touch feedback to interactive elements
        const interactiveElements = document.querySelectorAll('.btn, .nav-link, .dropdown-toggle, .page-link');
        
        interactiveElements.forEach(function(element) {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });

            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
        });

        // Prevent zoom on double tap for buttons
        interactiveElements.forEach(function(element) {
            element.addEventListener('touchend', function(e) {
                e.preventDefault();
            });
        });

        // Add swipe gestures for mobile navigation
        initSwipeGestures();
    }

    function initSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        document.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Swipe left to open sidebar
            if (diffX > 50 && Math.abs(diffY) < 100 && startX < 50) {
                const sidebar = document.querySelector('.sidebar, .nav-sidebar');
                if (sidebar && !sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            }
            
            // Swipe right to close sidebar
            if (diffX < -50 && Math.abs(diffY) < 100) {
                const sidebar = document.querySelector('.sidebar, .nav-sidebar');
                if (sidebar && sidebar.classList.contains('open')) {
                    closeSidebar();
                }
            }
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

        // Add focus management for mobile
        initFocusManagement();
    }

    function initFocusManagement() {
        // Trap focus in mobile sidebar when open
        const sidebar = document.querySelector('.sidebar, .nav-sidebar');
        if (sidebar) {
            const focusableElements = sidebar.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            sidebar.addEventListener('keydown', function(e) {
                if (sidebar.classList.contains('open')) {
                    if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === firstFocusable) {
                                lastFocusable.focus();
                                e.preventDefault();
                            }
                        } else {
                            if (document.activeElement === lastFocusable) {
                                firstFocusable.focus();
                                e.preventDefault();
                            }
                        }
                    }
                }
            });
        }
    }

    function initPerformanceOptimizations() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(function(img) {
            imageObserver.observe(img);
        });

        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                // Update scroll indicators
                const tables = document.querySelectorAll('.table-responsive');
                tables.forEach(function(table) {
                    const wrapper = table;
                    const leftIndicator = wrapper.querySelector('.scroll-indicator-left');
                    const rightIndicator = wrapper.querySelector('.scroll-indicator-right');
                    
                    if (leftIndicator && rightIndicator) {
                        updateScrollIndicators(wrapper, leftIndicator, rightIndicator);
                    }
                });
            }, 100);
        });

        // Optimize touch events
        let touchTimeout;
        document.addEventListener('touchstart', function() {
            clearTimeout(touchTimeout);
        });

        document.addEventListener('touchend', function() {
            touchTimeout = setTimeout(function() {
                // Clean up touch states
                const touchElements = document.querySelectorAll('.touch-active, .touch-focus');
                touchElements.forEach(function(element) {
                    element.classList.remove('touch-active', 'touch-focus');
                });
            }, 150);
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
    window.MobileEnhancements = {
        init: initMobileEnhancements,
        toggleSidebar: toggleSidebar,
        closeSidebar: closeSidebar,
        toggleCardView: function(table) {
            const wrapper = table.parentElement;
            if (wrapper.classList.contains('table-responsive')) {
                toggleCardView(table, wrapper);
            }
        }
    };

})();
