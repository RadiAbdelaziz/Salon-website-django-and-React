/**
 * Glámmy Salon - Unfold Admin Theme JavaScript Enhancements
 * Adds interactive effects and animations for the Glámmy brand
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Add a small delay to ensure all elements are rendered
        setTimeout(function() {
            initGlammyEnhancements();
            initBackgroundEffects();
            // Guard: ensure function exists before calling
            if (typeof initInteractiveElements === 'function') {
                initInteractiveElements();
            }
            initRTLSupport();
        }, 100);
    });
    
    /**
     * Initialize Glámmy-specific enhancements
     */
    function initGlammyEnhancements() {
        // Add sparkle effects to important elements
        addSparkleEffects();
        
        // Enhance form interactions
        enhanceFormInteractions();
        
        // Add smooth transitions
        addSmoothTransitions();
        
        // Initialize glitter effects
        initGlitterEffects();
    }
    
    /**
     * Add sparkle effects to logo and important buttons
     */
    function addSparkleEffects() {
        // Add sparkle to logo
        const logo = document.querySelector('.logo, .site-title, .brand');
        if (!logo) return;
        if (logo) {
            logo.classList.add('sparkle');
            
            // Add dynamic sparkle on hover
            logo.addEventListener('mouseenter', function() {
                this.style.textShadow = '0 0 20px rgba(212, 175, 55, 0.8), 0 2px 4px rgba(0, 0, 0, 0.3)';
            });
            
            logo.addEventListener('mouseleave', function() {
                this.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
            });
        }
        
        // Add sparkle to primary buttons
        const primaryButtons = document.querySelectorAll('.btn-primary, .button-primary');
        if (primaryButtons.length === 0) return;
        primaryButtons.forEach(function(button) {
            button.addEventListener('mouseenter', function() {
                this.classList.add('glammy-glitter');
            });
            
            button.addEventListener('mouseleave', function() {
                this.classList.remove('glammy-glitter');
            });
        });
    }
    
    /**
     * Initialize background effects
     */
    function initBackgroundEffects() {
        // Check if we're on login page or admin dashboard
        const isLoginPage = document.body.classList.contains('login') || 
                           !!document.querySelector('.login-form, .auth-form');
        const isAdminPage = document.body.classList.contains('admin') || 
                           !!document.querySelector('.admin-interface');
        
        if (isLoginPage) {
            document.body.classList.add('login-page');
            enhanceLoginPage();
        }
        
        if (isAdminPage) {
            document.body.classList.add('admin-page');
            enhanceAdminPage();
        }
        
        // Add responsive background handling
        handleResponsiveBackground();
    }
    
    /**
     * Enhance login page with special effects
     */
    function enhanceLoginPage() {
        const loginForm = document.querySelector('.login-form, .auth-form, form');
        if (!loginForm) return;
        
        if (!loginForm.classList.contains('glammy-enhanced')) {
            loginForm.classList.add('glammy-enhanced');
            
            // Add floating animation
            loginForm.style.animation = 'float 6s ease-in-out infinite';
            
            // Add title enhancement if it doesn't exist
            let title = loginForm.querySelector('h1, h2, .login-title, .auth-title');
            if (title && !title.textContent.includes('✨')) {
                title.innerHTML = '✨ ' + title.innerHTML + ' ✨';
                title.classList.add('login-title');
            }
        }
    }
    
    /**
     * Enhance admin dashboard page
     */
    function enhanceAdminPage() {
        // Add subtle animation to sidebar
        const sidebar = document.querySelector('.sidebar, [data-component="sidebar"]');
        if (!sidebar) return;
        
        sidebar.style.transition = 'all 0.3s ease';
        
        // Enhance content areas
        const contentAreas = document.querySelectorAll('.main-content, .content-wrapper, .admin-content');
        if (contentAreas.length === 0) return;
        
        contentAreas.forEach(function(area) {
            if (!area.classList.contains('glammy-enhanced')) {
                area.classList.add('glammy-enhanced');
                area.style.transition = 'all 0.3s ease';
            }
        });
    }
    
    /**
     * Handle responsive background
     */
    function handleResponsiveBackground() {
        function updateBackground() {
            const isMobile = window.innerWidth <= 768;
            const backgrounds = document.querySelectorAll('.login-page, .admin-page');
            if (backgrounds.length === 0) return;
            
            backgrounds.forEach(function(bg) {
                if (isMobile) {
                    bg.style.backgroundAttachment = 'scroll';
                } else {
                    bg.style.backgroundAttachment = 'fixed';
                }
            });
        }
        
        // Initial check
        updateBackground();
        
        // Update on resize
        window.addEventListener('resize', updateBackground);
    }
    
    /**
     * Enhance form interactions
     */
    function enhanceFormInteractions() {
        // Enhance input focus effects
        const inputs = document.querySelectorAll('input, textarea, select');
        if (inputs.length === 0) return;
        
        inputs.forEach(function(input) {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
                this.style.transform = 'translateY(-2px)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
                this.style.transform = 'translateY(0)';
            });
        });
        
        // Enhance button clicks with ripple effect
        const buttons = document.querySelectorAll('button, .btn, input[type="submit"]');
        if (buttons.length === 0) return;
        
        buttons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                createRippleEffect(e, this);
            });
        });
    }
    
    /**
     * Create ripple effect on button click
     */
    function createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(212, 175, 55, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 10;
        `;
        
        // Ensure element has relative positioning
        const originalPosition = getComputedStyle(element).position;
        if (originalPosition === 'static') {
            element.style.position = 'relative';
        }
        
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(function() {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    /**
     * Add smooth transitions to elements
     */
    function addSmoothTransitions() {
        // Add transitions to cards and modules
        const cards = document.querySelectorAll('.card, .module, .widget, .panel');
        if (cards.length === 0) return;
        
        cards.forEach(function(card) {
            card.style.transition = 'all 0.3s ease';
            
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
            });
        });
        
        // Add transitions to table rows
        const tableRows = document.querySelectorAll('table tbody tr');
        if (tableRows.length === 0) return;
        
        tableRows.forEach(function(row) {
            row.style.transition = 'all 0.2s ease';
        });
    }

    /**
     * Optional interactive elements initializer (safe no-op if not overridden)
     * Some environments may expect this to exist; define a minimal default.
     */
    function initInteractiveElements() {
        // Minimal hover/focus helpers can be added here if needed.
    }
    
    /**
     * Initialize glitter effects
     */
    function initGlitterEffects() {
        // Add glitter to special elements
        const specialElements = document.querySelectorAll('.logo, .site-title, .brand, .btn-primary');
        if (specialElements.length === 0) return;
        
        specialElements.forEach(function(element) {
            if (!element.classList.contains('glitter-initialized')) {
                element.classList.add('glitter-initialized');
                
                // Random glitter sparkles
                setInterval(function() {
                    if (Math.random() > 0.7) { // 30% chance
                        element.classList.add('glammy-glitter');
                        setTimeout(function() {
                            element.classList.remove('glammy-glitter');
                        }, 2000);
                    }
                }, 5000);
            }
        });
    }
    
    /**
     * Add RTL support enhancements
     */
    function initRTLSupport() {
        // Check if document is RTL
        const isRTL = document.documentElement.dir === 'rtl' || 
                     document.documentElement.lang === 'ar';
        
        if (isRTL) {
            document.body.classList.add('rtl-layout');
            
            // Adjust animations for RTL
            const style = document.createElement('style');
            style.textContent = `
                [dir="rtl"] .sidebar a:hover {
                    transform: translateX(-5px) !important;
                }
                
                [dir="rtl"] .glammy-glitter::before {
                    animation: shimmer-rtl 2s infinite;
                }
                
                @keyframes shimmer-rtl {
                    0% { right: -100%; left: auto; }
                    100% { right: 100%; left: auto; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Initialize accessibility enhancements
     */
    function initAccessibilityEnhancements() {
        // Check if document.body exists
        if (!document.body) {
            console.warn('Document body not ready, retrying...');
            setTimeout(initAccessibilityEnhancements, 100);
            return;
        }
        
        // Add skip link for screen readers
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--glammy-gold);
            color: var(--glammy-white);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            font-weight: 600;
            transition: top 0.3s ease;
        `;
        
        skipLink.addEventListener('focus', function() {
            this.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        
        // Safely insert skip link
        if (document.body.firstChild) {
            document.body.insertBefore(skipLink, document.body.firstChild);
        } else {
            document.body.appendChild(skipLink);
        }
        
        // Enhance keyboard navigation
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
        if (focusableElements.length === 0) return;
        
        focusableElements.forEach(function(element) {
            element.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (this.tagName !== 'INPUT' && this.tagName !== 'TEXTAREA') {
                        this.click();
                    }
                }
            });
        });
    }
    
    // Initialize accessibility enhancements when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccessibilityEnhancements);
    } else {
        initAccessibilityEnhancements();
    }
    
    // Add custom CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .skip-link:focus {
            top: 6px !important;
        }
        
        .focused {
            box-shadow: 0 0 0 3px rgba(180, 149, 99, 0.3) !important;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .glammy-glitter::before {
                display: none;
            }
            
            .sparkle {
                animation: none;
            }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            .float,
            .sparkle,
            .glammy-glitter {
                animation: none !important;
            }
        }
    `;
    
    document.head.appendChild(style);
    
})();
