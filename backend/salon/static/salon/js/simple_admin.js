// Simple Admin Theme JavaScript

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Apply simple theme on page load
        applySimpleTheme();
        
        // Remove any existing theme classes
        removeComplexThemes();
        
        // Add simple theme class to body
        if (document.body) {
            document.body.classList.add('simple-admin-theme');
        }
    } catch (error) {
        console.warn('Error applying simple admin theme:', error);
    }
});

function applySimpleTheme() {
    try {
        // Remove any colorful or complex theme classes
        const body = document.body;
        if (!body) return;
        
        const classesToRemove = [
            'unfold-theme-glammy',
            'unfold-theme-colorful',
            'unfold-theme-gradient',
            'unfold-theme-fancy'
        ];
        
        classesToRemove.forEach(className => {
            body.classList.remove(className);
        });
        
        // Add simple theme class
        body.classList.add('simple-white-black-theme');
    } catch (error) {
        console.warn('Error in applySimpleTheme:', error);
    }
    
    // Ensure all elements use simple colors
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
        // Remove any inline styles that might override our theme
        if (element.style.background && element.style.background.includes('gradient')) {
            element.style.background = '#FFFFFF';
        }
        
        if (element.style.backgroundColor && element.style.backgroundColor !== '#FFFFFF' && element.style.backgroundColor !== '#000000') {
            // Keep only white and black backgrounds
            if (!element.style.backgroundColor.includes('#FFFFFF') && !element.style.backgroundColor.includes('#000000')) {
                element.style.backgroundColor = '#FFFFFF';
            }
        }
    });
}

function removeComplexThemes() {
    // Remove any complex theme stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(stylesheet => {
        if (stylesheet.href && (
            stylesheet.href.includes('glammy') ||
            stylesheet.href.includes('colorful') ||
            stylesheet.href.includes('gradient')
        )) {
            stylesheet.remove();
        }
    });
    
    // Remove any complex theme scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        if (script.src && (
            script.src.includes('glammy') ||
            script.src.includes('colorful') ||
            script.src.includes('fancy')
        )) {
            script.remove();
        }
    });
}

// Override any theme changes
let observer = null;
if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('unfold-theme-glammy') || 
                    target.classList.contains('unfold-theme-colorful')) {
                    target.classList.remove('unfold-theme-glammy', 'unfold-theme-colorful');
                    target.classList.add('simple-white-black-theme');
                }
            }
        });
    });
}

// Start observing (only if observer and body exist)
if (observer && document.body) {
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
} else if (observer) {
    // Wait for body to be available
    document.addEventListener('DOMContentLoaded', function() {
        if (document.body) {
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    });
}

// Ensure theme persists on navigation
window.addEventListener('beforeunload', function() {
    localStorage.setItem('admin-theme', 'simple-white-black');
});

// Apply theme on page load
window.addEventListener('load', function() {
    applySimpleTheme();
});

// Simple utility functions
function setSimpleColors() {
    const root = document.documentElement;
    root.style.setProperty('--primary-white', '#FFFFFF');
    root.style.setProperty('--primary-black', '#000000');
    root.style.setProperty('--light-gray', '#F8F9FA');
    root.style.setProperty('--medium-gray', '#6C757D');
    root.style.setProperty('--dark-gray', '#343A40');
    root.style.setProperty('--border-gray', '#DEE2E6');
}

// Apply simple colors
setSimpleColors();

// Override any dynamic theme changes
const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
    // Block any colorful theme properties
    if (property.includes('color') && value && !value.includes('#FFFFFF') && !value.includes('#000000') && !value.includes('#6C757D') && !value.includes('#343A40')) {
        if (property.includes('background')) {
            value = '#FFFFFF';
        } else if (property.includes('color')) {
            value = '#000000';
        }
    }
    
    return originalSetProperty.call(this, property, value, priority);
};

console.log('Simple White & Black Admin Theme Applied');
