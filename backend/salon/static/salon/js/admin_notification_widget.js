/**
 * Admin Notification Widget JavaScript
 * Handles notification bell, dropdown, and API interactions
 */

class AdminNotificationWidget {
    constructor() {
        this.isOpen = false;
        this.notifications = [];
        this.unreadCount = 0;
        this.refreshInterval = null;
        this.init();
    }

    init() {
        console.log('Initializing Admin Notification Widget...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createWidget());
        } else {
            this.createWidget();
        }
    }

    createWidget() {
        // Find the user tools section
        const userTools = document.querySelector('#user-tools');
        if (!userTools) {
            console.log('User tools section not found, trying fallback...');
            this.createFallbackWidget();
            return;
        }

        // Create notification widget HTML
        const widgetHTML = `
            <div class="notification-widget" id="admin-notification-widget">
                <div class="notification-bell" id="notification-bell">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
                    </svg>
                    <span class="notification-badge hidden" id="notification-badge">0</span>
                </div>
                <div class="notification-dropdown" id="notification-dropdown">
                    <div class="notification-header">
                        <h3 class="notification-title">الإشعارات</h3>
                        <button class="mark-all-read-btn" id="mark-all-read-btn">تعيين الكل كمقروء</button>
                    </div>
                    <div class="notification-list" id="notification-list">
                        <div class="notification-loading">جاري تحميل الإشعارات...</div>
                    </div>
                </div>
            </div>
        `;

        // Insert widget into user tools
        userTools.insertAdjacentHTML('beforeend', widgetHTML);
        
        // Bind events
        this.bindEvents();
        
        // Load initial data
        this.loadNotifications();
        
        // Set up auto-refresh
        this.startAutoRefresh();
        
        console.log('Notification widget created successfully');
    }

    createFallbackWidget() {
        // Create a fixed position widget as fallback
        const widgetHTML = `
            <div class="notification-widget" id="admin-notification-widget" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
                <div class="notification-bell" id="notification-bell">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
                    </svg>
                    <span class="notification-badge hidden" id="notification-badge">0</span>
                </div>
                <div class="notification-dropdown" id="notification-dropdown">
                    <div class="notification-header">
                        <h3 class="notification-title">الإشعارات</h3>
                        <button class="mark-all-read-btn" id="mark-all-read-btn">تعيين الكل كمقروء</button>
                    </div>
                    <div class="notification-list" id="notification-list">
                        <div class="notification-loading">جاري تحميل الإشعارات...</div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        this.bindEvents();
        this.loadNotifications();
        this.startAutoRefresh();
        
        console.log('Fallback notification widget created');
    }

    bindEvents() {
        const bell = document.getElementById('notification-bell');
        const dropdown = document.getElementById('notification-dropdown');
        const markAllReadBtn = document.getElementById('mark-all-read-btn');

        if (bell) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllAsRead();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-widget')) {
                this.closeDropdown();
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.classList.add('show');
            this.isOpen = true;
            this.loadNotifications(); // Refresh when opening
        }
    }

    closeDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            this.isOpen = false;
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/admin/notifications/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.notifications = data.notifications;
                this.unreadCount = data.unread_count;
                this.updateUI();
            } else {
                console.error('Failed to load notifications:', data.error);
                this.showError('فشل في تحميل الإشعارات');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showError('خطأ في تحميل الإشعارات');
        }
    }

    updateUI() {
        this.updateBadge();
        this.updateNotificationList();
    }

    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    updateNotificationList() {
        const list = document.getElementById('notification-list');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }

        const notificationsHTML = this.notifications.map(notification => `
            <div class="notification-item ${!notification.is_read ? 'unread' : ''}" 
                 data-notification-id="${notification.id}">
                <h4 class="notification-item-title">${this.escapeHtml(notification.title)}</h4>
                <p class="notification-item-message">${this.escapeHtml(notification.message)}</p>
                <div class="notification-item-meta">
                    <span class="notification-item-time">${this.formatTime(notification.created_at)}</span>
                    <span class="notification-item-type ${notification.notification_type}">
                        ${this.getTypeLabel(notification.notification_type)}
                    </span>
                </div>
            </div>
        `).join('');

        list.innerHTML = notificationsHTML;

        // Bind click events to notification items
        list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const notificationId = e.currentTarget.dataset.notificationId;
                this.markAsRead(notificationId);
            });
        });
    }

    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}/mark-read/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                // Update local data
                const notification = this.notifications.find(n => n.id == notificationId);
                if (notification && !notification.is_read) {
                    notification.is_read = true;
                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                    this.updateUI();
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await fetch('/api/admin/notifications/mark-all-read/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                // Update local data
                this.notifications.forEach(notification => {
                    notification.is_read = true;
                });
                this.unreadCount = 0;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    showError(message) {
        const list = document.getElementById('notification-list');
        if (list) {
            list.innerHTML = `
                <div class="notification-empty">
                    <p style="color: #dc3545;">${message}</p>
                </div>
            `;
        }
    }

    startAutoRefresh() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timeString) {
        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'الآن';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `منذ ${minutes} دقيقة`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `منذ ${hours} ساعة`;
        } else {
            return date.toLocaleDateString('ar-SA');
        }
    }

    getTypeLabel(type) {
        const labels = {
            'booking': 'حجز',
            'contact': 'تواصل',
            'system': 'نظام',
            'reminder': 'تذكير'
        };
        return labels[type] || type;
    }

    destroy() {
        this.stopAutoRefresh();
        const widget = document.getElementById('admin-notification-widget');
        if (widget) {
            widget.remove();
        }
    }
}

// Initialize the widget
let adminNotificationWidget = null;

// Prevent multiple initializations
if (!window.adminNotificationWidgetInitialized) {
    window.adminNotificationWidgetInitialized = true;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            adminNotificationWidget = new AdminNotificationWidget();
        });
    } else {
        adminNotificationWidget = new AdminNotificationWidget();
    }
}

// Export for global access
window.AdminNotificationWidget = AdminNotificationWidget;
