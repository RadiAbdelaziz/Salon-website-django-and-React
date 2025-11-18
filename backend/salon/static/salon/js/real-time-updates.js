// Real-time updates for admin dashboard
class RealTimeUpdates {
    constructor() {
        this.updateInterval = 30000; // 30 seconds
        this.isUpdating = false;
        this.lastUpdateTime = null;
        this.init();
    }

    init() {
        console.log('Real-time updates initialized');
        this.startPeriodicUpdates();
        this.setupEventListeners();
    }

    startPeriodicUpdates() {
        setInterval(() => {
            if (!this.isUpdating) {
                this.fetchUpdates();
            }
        }, this.updateInterval);
    }

    setupEventListeners() {
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.fetchUpdates();
            }
        });

        // Listen for focus events
        window.addEventListener('focus', () => {
            this.fetchUpdates();
        });
    }

    async fetchUpdates() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        
        try {
            const response = await fetch('/api/real-time-updates/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.updateDashboard(data);
                this.lastUpdateTime = new Date();
                console.log('Dashboard updated successfully');
            } else {
                console.error('Update failed:', data.error);
            }
        } catch (error) {
            console.error('Error fetching updates:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    updateDashboard(data) {
        // Update counts
        this.updateCounts(data.counts);
        
        // Update latest bookings
        this.updateLatestBookings(data.latest_bookings);
        
        // Update latest customers
        this.updateLatestCustomers(data.latest_customers);
        
        // Update latest services
        this.updateLatestServices(data.latest_services);
        
        // Show update notification
        this.showUpdateNotification();
    }

    updateCounts(counts) {
        // Update total bookings
        const totalBookingsElement = document.querySelector('[data-stat="total-bookings"]');
        if (totalBookingsElement) {
            totalBookingsElement.textContent = counts.total_bookings;
        }

        // Update total customers
        const totalCustomersElement = document.querySelector('[data-stat="total-customers"]');
        if (totalCustomersElement) {
            totalCustomersElement.textContent = counts.total_customers;
        }

        // Update today's bookings
        const todayBookingsElement = document.querySelector('[data-stat="today-bookings"]');
        if (todayBookingsElement) {
            todayBookingsElement.textContent = counts.today_bookings;
        }

        // Update today's revenue
        const todayRevenueElement = document.querySelector('[data-stat="today-revenue"]');
        if (todayRevenueElement) {
            todayRevenueElement.textContent = counts.today_revenue.toFixed(2) + ' SAR';
        }
    }

    updateLatestBookings(bookings) {
        const bookingsContainer = document.querySelector('#latest-bookings');
        if (!bookingsContainer) return;

        bookingsContainer.innerHTML = '';
        
        bookings.forEach(booking => {
            const bookingElement = document.createElement('div');
            bookingElement.className = 'booking-item';
            bookingElement.innerHTML = `
                <div class="booking-info">
                    <h4>${booking.customer_name}</h4>
                    <p>${booking.service_name}</p>
                    <span class="booking-time">${booking.booking_date} - ${booking.booking_time}</span>
                </div>
                <div class="booking-status">
                    <span class="status-badge status-${booking.status}">${booking.status}</span>
                </div>
            `;
            bookingsContainer.appendChild(bookingElement);
        });
    }

    updateLatestCustomers(customers) {
        const customersContainer = document.querySelector('#latest-customers');
        if (!customersContainer) return;

        customersContainer.innerHTML = '';
        
        customers.forEach(customer => {
            const customerElement = document.createElement('div');
            customerElement.className = 'customer-item';
            customerElement.innerHTML = `
                <div class="customer-info">
                    <h4>${customer.name}</h4>
                    <p>${customer.email}</p>
                    <span class="customer-phone">${customer.phone}</span>
                </div>
                <div class="customer-date">
                    <span class="date-badge">${new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
            `;
            customersContainer.appendChild(customerElement);
        });
    }

    updateLatestServices(services) {
        const servicesContainer = document.querySelector('#latest-services');
        if (!servicesContainer) return;

        servicesContainer.innerHTML = '';
        
        services.forEach(service => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'service-item';
            serviceElement.innerHTML = `
                <div class="service-info">
                    <h4>${service.name}</h4>
                    <p>${service.category || 'No Category'}</p>
                    <span class="service-price">${service.price} SAR</span>
                </div>
                <div class="service-status">
                    <span class="status-badge ${service.is_active ? 'active' : 'inactive'}">
                        ${service.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            `;
            servicesContainer.appendChild(serviceElement);
        });
    }

    showUpdateNotification() {
        // Create or update notification
        let notification = document.querySelector('#update-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'update-notification';
            notification.className = 'update-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        notification.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RealTimeUpdates();
});

// CSS for update notification
const style = document.createElement('style');
style.textContent = `
    .update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
        display: none;
    }
    
    .booking-item, .customer-item, .service-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
    }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
    }
    
    .status-confirmed { background: #4CAF50; color: white; }
    .status-pending { background: #FF9800; color: white; }
    .status-cancelled { background: #f44336; color: white; }
    .status-active { background: #4CAF50; color: white; }
    .status-inactive { background: #9E9E9E; color: white; }
    
    .date-badge {
        background: #E3F2FD;
        color: #1976D2;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
    }
`;
document.head.appendChild(style);
