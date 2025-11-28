// HP Products Page Specific JavaScript
// This file works alongside your existing script.js

// Smooth scroll to section (HP Products specific)
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerOffset = 150;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Filter products by category (for static HP laptop cards)
function filterProducts(category) {
    const cards = document.querySelectorAll('.card');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Update active button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(category) || 
            (category === 'all' && btn.textContent.toLowerCase() === 'all')) {
            btn.classList.add('active');
        }
    });

    // Filter cards
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || !cardCategory) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else if (cardCategory && cardCategory.includes(category)) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Toggle mobile menu (HP Products specific)
function toggleMobileMenu() {
    const nav = document.querySelector('.main-nav');
    if (nav) {
        if (nav.style.display === 'flex') {
            nav.style.display = 'none';
        } else {
            nav.style.display = 'flex';
            nav.style.flexDirection = 'column';
            nav.style.position = 'absolute';
            nav.style.top = '100%';
            nav.style.left = '0';
            nav.style.right = '0';
            nav.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            nav.style.padding = '1rem';
            nav.style.gap = '0.5rem';
        }
    }
}

// Toggle search bar visibility
//function toggleSearch() {
  //  const heroSearch = document.getElementById('heroSearch');
  //if (heroSearch) {
      //  heroSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      //  const searchInput = document.getElementById('searchInput');
       // if (searchInput) {
           // setTimeout(() => {
               // searchInput.focus();
            //}, 500);
        //}
    //}
//}

// Search products in static cards
function searchProductsStatic(query) {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = query || (searchInput ? searchInput.value : '');
    const term = searchTerm.toLowerCase().trim();
    const cards = document.querySelectorAll('.card');
    
    let matchCount = 0;

    if (term === '') {
        cards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }

    cards.forEach(card => {
        const productName = card.querySelector('h5')?.textContent.toLowerCase() || '';
        const productDesc = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (productName.includes(term) || productDesc.includes(term)) {
            card.style.display = 'block';
            card.style.animation = 'pulse 0.5s';
            matchCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show notification with results
    if (matchCount === 0) {
        showSearchNotification('No products found', 'warning');
    } else {
        showSearchNotification(`Found ${matchCount} product(s)`, 'success');
    }
}

// Show search notification
function showSearchNotification(message, type) {
    const existing = document.querySelector('.search-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'search-notification';
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#3B82F6';
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '180px',
        right: '20px',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        background: bgColor,
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        animation: 'slideIn 0.3s ease',
        fontSize: '0.9rem',
        fontWeight: '500'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize search for HP Products page
function initializeHPSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchProductsStatic, 300));
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize for HP Products page
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768) {
            const nav = document.querySelector('.main-nav');
            if (nav) {
                nav.style.display = '';
                nav.style.flexDirection = '';
                nav.style.position = '';
                nav.style.padding = '';
            }
        }
    }, 250);
});

// Keyboard navigation for HP Products page
document.addEventListener('keydown', function(e) {
    if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            searchProductsStatic();
        }
    }
});

// Initialize HP Products page specific features
document.addEventListener('DOMContentLoaded', function() {
    initializeHPSearch();
});


//search bar functionality in products

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const categories = document.querySelectorAll('.category');

    const filterMaterials = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        categories.forEach(section => {
            const cards = section.querySelectorAll('.card');
            let hasMatches = false;

            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                const isVisible = text.includes(searchTerm);
                card.style.display = isVisible ? 'block' : 'none';
                
                if (isVisible) hasMatches = true;
            });

            // Show/hide entire category section
            section.style.display = hasMatches ? 'block' : 'none';
        });
    };

    searchButton.addEventListener('click', filterMaterials);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterMaterials();
    });
    searchInput.addEventListener('input', filterMaterials);

    // Clear search and show all when empty
    searchInput.addEventListener('input', () => {
        if (searchInput.value === '') {
            categories.forEach(section => {
                section.style.display = 'block';
                section.querySelectorAll('.card').forEach(card => {
                    card.style.display = 'block';
                });
            });
        }
    });
});

console.log('HP Products page scripts loaded successfully!');