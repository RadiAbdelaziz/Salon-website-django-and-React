/**
 * Custom Navigation Icons for Django Admin
 * Provides Material UI icons with interactive functionality
 */

class CustomNavigationIcons {
    constructor() {
        this.icons = [];
        this.activeIcon = null;
        this.init();
    }

    init() {
        console.log('Initializing Custom Navigation Icons...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createIcons());
        } else {
            this.createIcons();
        }
    }

    createIcons() {
        // Find the header or user tools section
        const header = document.querySelector('#header');
        const userTools = document.querySelector('#user-tools');
        
        if (!header && !userTools) {
            console.log('Header or user tools not found');
            return;
        }
        
        // Create navigation container if it doesn't exist
        let navContainer = document.querySelector('.nav-container');
        if (!navContainer) {
            navContainer = document.createElement('div');
            navContainer.className = 'nav-container';
        }
        
        // Define available icons
        const iconConfigs = [
            {
                id: 'dashboard',
                icon: 'dashboard',
                title: 'Dashboard',
                variant: 'dashboard',
                action: () => this.handleDashboardClick()
            },
            {
                id: 'analytics',
                icon: 'analytics',
                title: 'Analytics',
                variant: 'analytics',
                action: () => this.handleAnalyticsClick()
            },
            {
                id: 'reports',
                icon: 'assessment',
                title: 'Reports',
                variant: 'reports',
                action: () => this.handleReportsClick()
            },
            {
                id: 'settings',
                icon: 'settings',
                title: 'Settings',
                variant: 'settings',
                action: () => this.handleSettingsClick()
            }
        ];
        
        // Create icons
        iconConfigs.forEach((config, index) => {
            const icon = this.createIcon(config, index);
            navContainer.appendChild(icon);
            this.icons.push(icon);
        });
        
        // Position the container
        if (userTools) {
            // Insert before user tools
            userTools.parentNode.insertBefore(navContainer, userTools);
        } else if (header) {
            // Add to header
            header.appendChild(navContainer);
        }
        
        console.log(`Created ${this.icons.length} navigation icons`);
    }

    createIcon(config, index) {
        const icon = document.createElement('a');
        icon.className = `custom-nav-icon ${config.variant}`;
        icon.href = '#';
        icon.title = config.title;
        icon.dataset.iconId = config.id;
        icon.innerHTML = `<span class="material-icons">${config.icon}</span>`;
        
        // Add click event
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleIconClick(config, icon);
        });
        
        // Add hover effects
        icon.addEventListener('mouseenter', () => {
            this.handleIconHover(icon, true);
        });
        
        icon.addEventListener('mouseleave', () => {
            this.handleIconHover(icon, false);
        });
        
        return icon;
    }

    handleIconClick(config, iconElement) {
        console.log(`${config.title} icon clicked!`);
        
        // Remove active state from all icons
        this.icons.forEach(icon => icon.classList.remove('active'));
        
        // Add active state to clicked icon
        iconElement.classList.add('active');
        this.activeIcon = config.id;
        
        // Execute the icon's action
        if (config.action) {
            config.action();
        }
        
        // Store active state in localStorage
        localStorage.setItem('activeNavIcon', config.id);
    }

    handleIconHover(iconElement, isHovering) {
        if (isHovering) {
            iconElement.style.transform = 'translateY(-2px) scale(1.05)';
        } else {
            iconElement.style.transform = '';
        }
    }

    // Icon action handlers
    handleDashboardClick() {
        this.showNotification('Dashboard', 'Opening dashboard view...', 'info');
        // You can add custom dashboard functionality here
        // For example: window.location.href = '/admin/dashboard/';
    }

    handleAnalyticsClick() {
        this.showNotification('Analytics', 'Loading analytics data...', 'success');
        // You can add custom analytics functionality here
        // For example: this.openAnalyticsModal();
    }

    handleReportsClick() {
        this.showNotification('Reports', 'Generating reports...', 'warning');
        // You can add custom reports functionality here
        // For example: this.generateReport();
    }

    handleSettingsClick() {
        this.showNotification('Settings', 'Opening settings panel...', 'info');
        // You can add custom settings functionality here
        // For example: this.openSettingsModal();
    }

    showNotification(title, message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `nav-notification nav-notification-${type}`;
        notification.innerHTML = `
            <div class="nav-notification-content">
                <span class="material-icons">${this.getNotificationIcon(type)}</span>
                <div>
                    <strong>${title}</strong>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            animation: slideInFromRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'info': 'info',
            'success': 'check_circle',
            'warning': 'warning',
            'error': 'error'
        };
        return icons[type] || 'info';
    }

    getNotificationColor(type) {
        const colors = {
            'info': '#17a2b8',
            'success': '#28a745',
            'warning': '#ffc107',
            'error': '#dc3545'
        };
        return colors[type] || '#17a2b8';
    }

    // Restore active state from localStorage
    restoreActiveState() {
        const activeIconId = localStorage.getItem('activeNavIcon');
        if (activeIconId) {
            const activeIcon = document.querySelector(`[data-icon-id="${activeIconId}"]`);
            if (activeIcon) {
                activeIcon.classList.add('active');
                this.activeIcon = activeIconId;
            }
        }
    }

    // Public methods for external use
    setActiveIcon(iconId) {
        const icon = document.querySelector(`[data-icon-id="${iconId}"]`);
        if (icon) {
            this.handleIconClick({ id: iconId, title: icon.title }, icon);
        }
    }

    addCustomIcon(config) {
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            const icon = this.createIcon(config, this.icons.length);
            navContainer.appendChild(icon);
            this.icons.push(icon);
        }
    }
}

// Initialize the navigation icons
let customNavIcons = null;

// Prevent multiple initializations
if (!window.customNavIconsInitialized) {
    window.customNavIconsInitialized = true;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            customNavIcons = new CustomNavigationIcons();
            // Restore active state after a short delay
            setTimeout(() => customNavIcons.restoreActiveState(), 100);
        });
    } else {
        customNavIcons = new CustomNavigationIcons();
        // Restore active state after a short delay
        setTimeout(() => customNavIcons.restoreActiveState(), 100);
    }
}

// Export for global access
window.CustomNavigationIcons = CustomNavigationIcons;
window.customNavIcons = customNavIcons;
