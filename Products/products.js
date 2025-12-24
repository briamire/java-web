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

//search bar functionality in products

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const categories = document.querySelectorAll('.category');

    const filterMaterials = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        // If search is empty, show everything
        if (searchTerm === '') {
            categories.forEach(section => {
                section.style.display = 'block';
                section.querySelectorAll('.card').forEach(card => {
                    card.style.display = 'block';
                });
            });
            return;
        }

        // Filter based on search term
        categories.forEach(section => {
            const cards = section.querySelectorAll('.card');
            const categoryTitle = section.querySelector('h2, h3, .category-title');
            const categoryText = categoryTitle ? categoryTitle.textContent.toLowerCase() : '';
            
            // Check if category title matches
            const categoryMatches = categoryText.includes(searchTerm);
            let hasVisibleCards = false;

            cards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                const cardMatches = cardText.includes(searchTerm);
                
                // Show card if it matches OR if the category title matches
                const shouldShow = cardMatches || categoryMatches;
                card.style.display = shouldShow ? 'block' : 'none';
                
                if (shouldShow) hasVisibleCards = true;
            });

            // Show category only if it has visible cards or its title matches
            section.style.display = hasVisibleCards ? 'block' : 'none';
        });
    };

    searchButton.addEventListener('click', filterMaterials);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterMaterials();
    });
    searchInput.addEventListener('input', filterMaterials);
});

console.log('Products page scripts loaded successfully!');


// Product Details Modal Functions
function openProductDetails(element) {
    const card = element.closest('.card');
    const img = card.querySelector('img').src;
    const title = card.querySelector('h5').textContent;
    const specs = card.querySelector('p').textContent;
    const price = card.querySelector('.cost').textContent.trim();
    
    // Set modal content
    document.getElementById('productDetailsImg').src = img;
    document.getElementById('productDetailsTitle').textContent = title;
    
    // Parse and format specs
    const specsArray = specs.split('|').map(spec => spec.trim());
    const specsHTML = specsArray.map(spec => `<p>${spec}</p>`).join('');
    document.getElementById('productDetailsSpecs').innerHTML = specsHTML;
    
    document.getElementById('productDetailsPrice').textContent = price;
    
    // Set up add to cart button
    const priceValue = parseInt(price.replace(/[^\d]/g, ''));
    const addBtn = document.getElementById('productDetailsAddBtn');
    addBtn.onclick = function() {
        addToCart(this, title, priceValue);
        closeProductDetails();
    };
    
    // Set up WhatsApp button
    const whatsappBtn = document.getElementById('productDetailsWhatsAppBtn');
    whatsappBtn.onclick = function() {
        orderOnWhatsApp(title, price, specs);
    };
    
    // Show overlay
    const overlay = document.getElementById('productDetailsOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductDetails() {
    const overlay = document.getElementById('productDetailsOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function orderOnWhatsApp(productName, price, specs) {
    // Your WhatsApp business number (include country code without + or spaces)
    // Example: For Kenya +254712345678, use '254712345678'
    const phoneNumber = '25745933132'; // Replace with your actual number
    
    // Create the message
    const message = `Hi, I'm interested in ordering:

*${productName}*
${specs}

Price: ${price}

Please provide more information.`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');
}

// Close on outside click
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('productDetailsOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeProductDetails();
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductDetails();
        }
    });
});

// Update your existing onclick to use the new function name
function openProductModal(element) {
    openProductDetails(element);
}





//Sidebar Functionality of dropdown menus
document.querySelectorAll("[data-dropdown-toggle]").forEach(trigger => {
    trigger.addEventListener("click", function (e) {
        e.preventDefault();

        const parent = this.parentElement;

        if (parent.classList.contains("open")) {
            parent.classList.remove("open");
        } else {
            document.querySelectorAll(".has-dropdown.open")
                .forEach(item => item.classList.remove("open"));

            parent.classList.add("open");
        }
    });
});


//scroll to landing page onpress title

// 1. Get the h1 element using its ID
const titleElement = document.getElementById('rotating-title');

// 2. Check if the element was found (good practice)
if (titleElement) {
    // 3. Add a 'click' event listener to the element
    titleElement.addEventListener('click', function() {
        // 4. Change the current window's location to 'index.html'
        // This will navigate the user to the new page.
        window.location.href = '/';

        // Alternative for the current domain:
        // window.location.assign('index.html');
    });
}


