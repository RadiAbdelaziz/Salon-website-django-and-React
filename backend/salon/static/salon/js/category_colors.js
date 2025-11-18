// Category Colors JavaScript
// This script applies category-specific colors to admin interface elements

document.addEventListener('DOMContentLoaded', function() {
    // Function to apply dynamic colors from database
    function applyDynamicColors() {
        // Get all elements with data-category-color attribute
        const elementsWithColor = document.querySelectorAll('[data-category-color]');
        elementsWithColor.forEach(element => {
            const color = element.getAttribute('data-category-color');
            if (color) {
                // Apply the color to buttons within this element
                const buttons = element.querySelectorAll('.default, .button, input[type="submit"], input[type="button"]');
                buttons.forEach(button => {
                    button.style.backgroundColor = color + ' !important';
                    button.style.borderColor = color + ' !important';
                });
                
                // Apply color to table headers
                const headers = element.querySelectorAll('#result_list th, .results th');
                headers.forEach(header => {
                    header.style.backgroundColor = color + ' !important';
                });
            }
        });
    }
    
    // Function to apply category colors
    function applyCategoryColors() {
        // Get all elements that might have category information
        const categoryElements = document.querySelectorAll('[data-category], .category-item, .blog-category-item');
        
        categoryElements.forEach(element => {
            const categoryName = element.getAttribute('data-category') || 
                                element.textContent.trim().toLowerCase().replace(/\s+/g, '-');
            
            // Apply category class based on category name
            if (categoryName) {
                // Service categories
                if (categoryName.includes('hair') || categoryName.includes('شعر')) {
                    element.classList.add('category-hair-care');
                } else if (categoryName.includes('skin') || categoryName.includes('بشرة')) {
                    element.classList.add('category-skincare');
                } else if (categoryName.includes('makeup') || categoryName.includes('مكياج')) {
                    element.classList.add('category-makeup');
                } else if (categoryName.includes('nail') || categoryName.includes('أظافر')) {
                    element.classList.add('category-nails');
                } else if (categoryName.includes('spa') || categoryName.includes('سبا')) {
                    element.classList.add('category-spa');
                }
                
                // Blog categories
                if (categoryName.includes('beauty') || categoryName.includes('جمال')) {
                    element.classList.add('blog-category-beauty');
                } else if (categoryName.includes('skincare') || categoryName.includes('عناية-بالبشرة')) {
                    element.classList.add('blog-category-skincare');
                } else if (categoryName.includes('hair') || categoryName.includes('شعر')) {
                    element.classList.add('blog-category-hair');
                } else if (categoryName.includes('makeup') || categoryName.includes('مكياج')) {
                    element.classList.add('blog-category-makeup');
                } else if (categoryName.includes('lifestyle') || categoryName.includes('نمط-الحياة')) {
                    element.classList.add('blog-category-lifestyle');
                } else if (categoryName.includes('tips') || categoryName.includes('نصائح')) {
                    element.classList.add('blog-category-tips');
                }
            }
        });
        
        // Apply colors to table rows based on category
        const tableRows = document.querySelectorAll('#result_list tbody tr, .results tbody tr');
        tableRows.forEach(row => {
            const categoryCell = row.querySelector('td[data-category], .category-cell');
            if (categoryCell) {
                const categoryName = categoryCell.textContent.trim().toLowerCase().replace(/\s+/g, '-');
                if (categoryName) {
                    // Apply category class to the entire row
                    if (categoryName.includes('hair') || categoryName.includes('شعر')) {
                        row.classList.add('category-hair-care');
                    } else if (categoryName.includes('skin') || categoryName.includes('بشرة')) {
                        row.classList.add('category-skincare');
                    } else if (categoryName.includes('makeup') || categoryName.includes('مكياج')) {
                        row.classList.add('category-makeup');
                    } else if (categoryName.includes('nail') || categoryName.includes('أظافر')) {
                        row.classList.add('category-nails');
                    } else if (categoryName.includes('spa') || categoryName.includes('سبا')) {
                        row.classList.add('category-spa');
                    }
                    
                    // Blog categories
                    if (categoryName.includes('beauty') || categoryName.includes('جمال')) {
                        row.classList.add('blog-category-beauty');
                    } else if (categoryName.includes('skincare') || categoryName.includes('عناية-بالبشرة')) {
                        row.classList.add('blog-category-skincare');
                    } else if (categoryName.includes('hair') || categoryName.includes('شعر')) {
                        row.classList.add('blog-category-hair');
                    } else if (categoryName.includes('makeup') || categoryName.includes('مكياج')) {
                        row.classList.add('blog-category-makeup');
                    } else if (categoryName.includes('lifestyle') || categoryName.includes('نمط-الحياة')) {
                        row.classList.add('blog-category-lifestyle');
                    } else if (categoryName.includes('tips') || categoryName.includes('نصائح')) {
                        row.classList.add('blog-category-tips');
                    }
                }
            }
        });
        
        // Apply colors to buttons based on their context
        const buttons = document.querySelectorAll('.default, .button, input[type="submit"], input[type="button"]');
        buttons.forEach(button => {
            const parentRow = button.closest('tr');
            const parentElement = button.closest('.category-item, .blog-category-item, [data-category]');
            
            if (parentRow && parentRow.classList.contains('category-hair-care')) {
                button.classList.add('category-hair-care');
            } else if (parentRow && parentRow.classList.contains('category-skincare')) {
                button.classList.add('category-skincare');
            } else if (parentRow && parentRow.classList.contains('category-makeup')) {
                button.classList.add('category-makeup');
            } else if (parentRow && parentRow.classList.contains('category-nails')) {
                button.classList.add('category-nails');
            } else if (parentRow && parentRow.classList.contains('category-spa')) {
                button.classList.add('category-spa');
            }
            
            // Blog categories
            if (parentRow && parentRow.classList.contains('blog-category-beauty')) {
                button.classList.add('blog-category-beauty');
            } else if (parentRow && parentRow.classList.contains('blog-category-skincare')) {
                button.classList.add('blog-category-skincare');
            } else if (parentRow && parentRow.classList.contains('blog-category-hair')) {
                button.classList.add('blog-category-hair');
            } else if (parentRow && parentRow.classList.contains('blog-category-makeup')) {
                button.classList.add('blog-category-makeup');
            } else if (parentRow && parentRow.classList.contains('blog-category-lifestyle')) {
                button.classList.add('blog-category-lifestyle');
            } else if (parentRow && parentRow.classList.contains('blog-category-tips')) {
                button.classList.add('blog-category-tips');
            }
        });
    }
    
    // Apply colors on page load
    applyDynamicColors();
    applyCategoryColors();
    
    // Re-apply colors when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                setTimeout(function() {
                    applyDynamicColors();
                    applyCategoryColors();
                }, 100);
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Apply colors when filters change
    const filterButtons = document.querySelectorAll('#nav-filter a, .filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(function() {
                applyDynamicColors();
                applyCategoryColors();
            }, 200);
        });
    });
});

// Function to manually apply category color to an element
function applyCategoryColor(element, categoryName) {
    if (!element || !categoryName) return;
    
    const normalizedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');
    
    // Remove existing category classes
    element.classList.remove(
        'category-hair-care', 'category-skincare', 'category-makeup', 
        'category-nails', 'category-spa',
        'blog-category-beauty', 'blog-category-skincare', 'blog-category-hair',
        'blog-category-makeup', 'blog-category-lifestyle', 'blog-category-tips'
    );
    
    // Add appropriate category class
    if (normalizedCategory.includes('hair') || normalizedCategory.includes('شعر')) {
        element.classList.add('category-hair-care');
    } else if (normalizedCategory.includes('skin') || normalizedCategory.includes('بشرة')) {
        element.classList.add('category-skincare');
    } else if (normalizedCategory.includes('makeup') || normalizedCategory.includes('مكياج')) {
        element.classList.add('category-makeup');
    } else if (normalizedCategory.includes('nail') || normalizedCategory.includes('أظافر')) {
        element.classList.add('category-nails');
    } else if (normalizedCategory.includes('spa') || normalizedCategory.includes('سبا')) {
        element.classList.add('category-spa');
    }
    
    // Blog categories
    if (normalizedCategory.includes('beauty') || normalizedCategory.includes('جمال')) {
        element.classList.add('blog-category-beauty');
    } else if (normalizedCategory.includes('skincare') || normalizedCategory.includes('عناية-بالبشرة')) {
        element.classList.add('blog-category-skincare');
    } else if (normalizedCategory.includes('hair') || normalizedCategory.includes('شعر')) {
        element.classList.add('blog-category-hair');
    } else if (normalizedCategory.includes('makeup') || normalizedCategory.includes('مكياج')) {
        element.classList.add('blog-category-makeup');
    } else if (normalizedCategory.includes('lifestyle') || normalizedCategory.includes('نمط-الحياة')) {
        element.classList.add('blog-category-lifestyle');
    } else if (normalizedCategory.includes('tips') || normalizedCategory.includes('نصائح')) {
        element.classList.add('blog-category-tips');
    }
}
