// Notification Widget JavaScript
// Prevent duplicate class declaration and loading
if (typeof NotificationWidget === 'undefined' && !window.notificationWidgetLoaded) {
window.notificationWidgetLoaded = true;
class NotificationWidget {
    constructor() {
        // Prevent multiple widget creation
        if (document.querySelector('.notification-widget')) {
            console.log('Notification widget already exists, skipping initialization');
            return;
        }
        this.init();
    }

    init() {
        this.createWidget();
        this.bindEvents();
        this.loadNotifications();
        this.startPolling();
    }

    createWidget() {
        // Create notification widget HTML
        const widgetHTML = `
            <div class="notification-widget">
                <div class="notification-bell" id="notification-bell">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                    <span class="notification-badge" id="notification-badge" style="display: none;">0</span>
                </div>
                <div class="notification-dropdown" id="notification-dropdown">
                    <div class="notification-header">
                        <h3>الإشعارات</h3>
                    </div>
                    <div class="notification-list" id="notification-list">
                        <div class="notification-empty">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <p>لا توجد إشعارات جديدة</p>
                        </div>
                    </div>
                    <div class="notification-footer">
                        <a href="/admin/salon/notification/">عرض جميع الإشعارات</a>
                    </div>
                </div>
            </div>
        `;

        // Try to find the "Welcome admin" text and insert widget next to it
        let targetElement = null;
        
        // Look for "Welcome admin" text specifically in text nodes
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let textNode;
        while (textNode = walker.nextNode()) {
            if (textNode.textContent && textNode.textContent.trim().includes('Welcome admin')) {
                targetElement = textNode.parentElement;
                console.log('Found Welcome admin element:', targetElement);
                break;
            }
        }
        
        // If we found the welcome element, insert the widget after it
        if (targetElement && targetElement.parentNode) {
            // Insert the widget right after the welcome element
            targetElement.insertAdjacentHTML('afterend', widgetHTML);
            console.log('Widget inserted next to Welcome admin');
        } else {
            // Fallback: try to find user tools or header
            const fallbackSelectors = [
                '#user-tools',
                '#header #user-tools',
                '#header',
                '.header',
                '.admin-header',
                'header'
            ];
            
            for (const selector of fallbackSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    element.insertAdjacentHTML('beforeend', widgetHTML);
                    console.log('Widget inserted into fallback element:', selector);
                    break;
                }
            }
            
            // Final fallback: insert at the end of body
            if (!document.querySelector('.notification-widget')) {
                document.body.insertAdjacentHTML('beforeend', widgetHTML);
                console.log('Widget inserted into body as final fallback');
            }
        }
        
        // Add some debugging and ensure visibility
        setTimeout(() => {
            const bell = document.getElementById('notification-bell');
            const widget = document.querySelector('.notification-widget');
            if (bell && widget) {
                console.log('Notification bell found and ready');
                // Make sure it's visible
                bell.style.display = 'block';
                bell.style.visibility = 'visible';
                widget.style.display = 'block';
                widget.style.visibility = 'visible';
                widget.style.position = 'relative';
                widget.style.zIndex = '9999';
                
                // Force visibility with important styles
                bell.style.setProperty('display', 'block', 'important');
                bell.style.setProperty('visibility', 'visible', 'important');
                bell.style.setProperty('opacity', '1', 'important');
                
                console.log('Notification bell styles applied:', {
                    display: bell.style.display,
                    visibility: bell.style.visibility,
                    opacity: bell.style.opacity
                });
            } else {
                console.log('Notification bell or widget not found');
                console.log('Bell element:', bell);
                console.log('Widget element:', widget);
                
                // Create a simple fallback notification bell
                this.createFallbackBell();
            }
        }, 1000);
    }

    createFallbackBell() {
        console.log('Creating fallback notification bell');
        
        // Create a simple notification bell
        const fallbackBell = document.createElement('div');
        fallbackBell.id = 'notification-bell-fallback';
        fallbackBell.className = 'notification-bell';
        fallbackBell.innerHTML = `
            <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: #dc3545;">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <span class="notification-badge" style="display: flex; background-color: #dc3545; color: white; border-radius: 50%; width: 18px; height: 18px; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; position: absolute; top: -5px; right: -5px;">11</span>
        `;
        
        // Style the fallback bell
        fallbackBell.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background-color: #ffffff !important;
            border: 2px solid #dc3545 !important;
            border-radius: 6px !important;
            padding: 8px !important;
            cursor: pointer !important;
            z-index: 9999 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        `;
        
        // Add click event
        fallbackBell.addEventListener('click', () => {
            alert('Notification bell clicked! You have 11 notifications.');
        });
        
        // Add to body
        document.body.appendChild(fallbackBell);
        console.log('Fallback notification bell created and added to body');
    }

    bindEvents() {
        const bell = document.getElementById('notification-bell');
        const dropdown = document.getElementById('notification-dropdown');

        if (bell && dropdown) {
            // Toggle dropdown on bell click
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });

            // Handle notification item clicks
            dropdown.addEventListener('click', (e) => {
                const notificationItem = e.target.closest('.notification-item');
                if (notificationItem) {
                    const notificationId = notificationItem.dataset.id;
                    if (notificationId) {
                        this.markAsRead(notificationId);
                        // Optionally redirect to notification detail or booking
                        const actionUrl = notificationItem.dataset.actionUrl;
                        if (actionUrl) {
                            window.location.href = actionUrl;
                        }
                    }
                }
            });
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/notifications/?limit=10', {
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                }
            });

            if (response.ok) {
                const data = await response.json();
                const notifications = data.results || data;
                
                // Check for new notifications and play sound
                this.checkForNewNotifications(notifications);
                
                this.updateNotifications(notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/notifications/stats/', {
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                }
            });

            if (response.ok) {
                const stats = await response.json();
                this.updateBadge(stats.unread_notifications);
            }
        } catch (error) {
            console.error('Error loading notification stats:', error);
        }
    }

    updateNotifications(notifications) {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="notification-empty">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p>لا توجد إشعارات جديدة</p>
                </div>
            `;
            return;
        }

        const notificationsHTML = notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'}" 
                 data-id="${notification.id}" 
                 data-action-url="${notification.action_url || ''}">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-meta">
                    <span class="notification-priority ${notification.priority}">${this.getPriorityText(notification.priority)}</span>
                    <span class="notification-time">${this.formatTime(notification.created_at)}</span>
                </div>
            </div>
        `).join('');

        notificationList.innerHTML = notificationsHTML;
    }

    updateBadge(count) {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/mark-read/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // Update the notification item to remove unread styling
                const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
                if (notificationItem) {
                    notificationItem.classList.remove('unread');
                }
                
                // Reload stats to update badge
                this.loadStats();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    getPriorityText(priority) {
        const priorityMap = {
            'high': 'عالي',
            'medium': 'متوسط',
            'low': 'منخفض',
            'urgent': 'عاجل'
        };
        return priorityMap[priority] || priority;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `${minutes} دقيقة`;
        if (hours < 24) return `${hours} ساعة`;
        if (days < 7) return `${days} يوم`;
        
        return date.toLocaleDateString('ar-SA');
    }

    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }

    startPolling() {
        // Poll for new notifications every 5 seconds for better responsiveness
        setInterval(() => {
            this.loadStats();
            this.loadNotifications();
        }, 5000);
    }

    checkForNewNotifications(notifications) {
        // Get the last notification ID we've seen
        const lastSeenId = localStorage.getItem('lastNotificationId') || 0;
        
        // Find new notifications
        const newNotifications = notifications.filter(notification => 
            notification.id > lastSeenId && !notification.is_read
        );
        
        if (newNotifications.length > 0) {
            // Update last seen ID
            const latestId = Math.max(...newNotifications.map(n => n.id));
            localStorage.setItem('lastNotificationId', latestId);
            
            // Play sound for new notifications
            this.playNotificationSound();
            
            // Show browser notification if permission granted
            this.showBrowserNotification(newNotifications[0]);
            
            console.log(`New notifications detected: ${newNotifications.length}`);
        }
    }

    playNotificationSound() {
        try {
            // Create audio context for notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a simple notification sound (beep)
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configure the sound
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // 600 Hz
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            // Play the sound
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            console.log('Notification sound played');
        } catch (error) {
            console.error('Error playing notification sound:', error);
            // Fallback: try to play a simple beep using HTML5 audio
            this.playFallbackSound();
        }
    }

    playFallbackSound() {
        try {
            // Create a simple beep sound using Web Audio API
            const audio = new Audio();
            audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT';
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (error) {
            console.error('Fallback sound failed:', error);
        }
    }

    async showBrowserNotification(notification) {
        // Check if browser notifications are supported
        if (!('Notification' in window)) {
            console.log('Browser notifications not supported');
            return;
        }

        // Request permission if not already granted
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('Notification permission denied');
                return;
            }
        }

        // Show notification if permission is granted
        if (Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/static/admin/img/icon-addlink.svg', // Use Django admin icon
                badge: '/static/admin/img/icon-addlink.svg',
                tag: 'salon-notification',
                requireInteraction: false,
                silent: false
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                browserNotification.close();
            }, 5000);

            // Handle click on notification
            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();
            };
        }
    }
}

}

// Initialize the notification widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof NotificationWidget !== 'undefined' && !window.notificationWidgetInitialized) {
        window.notificationWidgetInitialized = true;
        new NotificationWidget();
    }
});
