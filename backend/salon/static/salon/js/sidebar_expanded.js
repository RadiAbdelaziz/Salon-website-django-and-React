// Force sidebar to show all apps expanded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the sidebar to load
    setTimeout(function() {
        // Find all collapsible items and expand them
        const collapsibleItems = document.querySelectorAll('.nav-item.has-treeview');
        collapsibleItems.forEach(function(item) {
            const navLink = item.querySelector('.nav-link');
            const navTreeview = item.querySelector('.nav-treeview');
            
            if (navLink && navTreeview) {
                // Remove collapse classes
                navLink.classList.remove('collapsed');
                navTreeview.classList.add('show');
                navTreeview.style.display = 'block';
                
                // Update the arrow icon
                const arrow = navLink.querySelector('i.fa-chevron-right, i.fa-chevron-down');
                if (arrow) {
                    arrow.classList.remove('fa-chevron-right');
                    arrow.classList.add('fa-chevron-down');
                }
            }
        });
        
        // Ensure all nav-treeview elements are visible
        const treeviews = document.querySelectorAll('.nav-treeview');
        treeviews.forEach(function(treeview) {
            treeview.style.display = 'block';
            treeview.classList.add('show');
        });
        
        // Make sure the sidebar is scrollable
        const sidebar = document.querySelector('.nav-sidebar');
        if (sidebar) {
            sidebar.style.overflowY = 'auto';
            sidebar.style.maxHeight = 'calc(100vh - 60px)';
        }
        
        // Force all navigation items to be visible
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(function(item) {
            item.style.display = 'block';
        });
        
    }, 500); // Wait 500ms for the page to load
});

// Also run when the page is fully loaded
window.addEventListener('load', function() {
    // Re-apply the expansion after page load
    setTimeout(function() {
        const collapsibleItems = document.querySelectorAll('.nav-item.has-treeview');
        collapsibleItems.forEach(function(item) {
            const navTreeview = item.querySelector('.nav-treeview');
            if (navTreeview) {
                navTreeview.style.display = 'block';
                navTreeview.classList.add('show');
            }
        });
    }, 100);
});
