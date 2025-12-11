// API Configuration
const API_BASE_URL = 'http://localhost:8080/techstore/api';

// Global State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let products = [];
let categories = [];
let currentCategory = 'all';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
});





// Add to Cart


// Remove from Cart


// Update Cart Quantity

// Render Cart Items


// Update Cart Count



// Wishlist Management
//let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Update wishlist count in header
function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

// Check if product is in wishlist
function isInWishlist(productName) {
    return wishlist.some(item => item.name === productName);
}

// Toggle wishlist from card
function toggleWishlist(button, productName, price, image) {
    const card = button.closest('.card');
    const icon = button.querySelector('i');
    const specs = card.querySelector('p').textContent;
    
    if (isInWishlist(productName)) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.name !== productName);
        button.classList.remove('in-wishlist');
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('Removed from wishlist', 'info');
    } else {
        // Add to wishlist
        wishlist.push({
            name: productName,
            price: price,
            image: image,
            specs: specs
        });
        button.classList.add('in-wishlist');
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    updateAllWishlistButtons();
}

// Toggle wishlist from product details overlay
function toggleWishlistFromOverlay() {
    const title = document.getElementById('productDetailsTitle').textContent;
    const priceText = document.getElementById('productDetailsPrice').textContent;
    const price = parseInt(priceText.replace(/[^0-9]/g, ''));
    const image = document.getElementById('productDetailsImg').src;
    const specs = document.getElementById('productDetailsSpecs').textContent;
    const wishlistBtn = document.getElementById('productDetailsWishlistBtn');
    const wishlistBtnText = document.getElementById('wishlistBtnText');
    const icon = wishlistBtn.querySelector('i');
    
    if (isInWishlist(title)) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.name !== title);
        wishlistBtn.classList.remove('in-wishlist');
        icon.classList.remove('fas');
        icon.classList.add('far');
        wishlistBtnText.textContent = 'Add to Wishlist';
        showNotification('Removed from wishlist', 'info');
    } else {
        // Add to wishlist
        wishlist.push({
            name: title,
            price: price,
            image: image,
            specs: specs
        });
        wishlistBtn.classList.add('in-wishlist');
        icon.classList.remove('far');
        icon.classList.add('fas');
        wishlistBtnText.textContent = 'Remove from Wishlist';
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    updateAllWishlistButtons();
}

// Update all wishlist button states
function updateAllWishlistButtons() {
    document.querySelectorAll('.card-wishlist-btn').forEach(button => {
        const card = button.closest('.card');
        const productName = card.querySelector('h5').textContent;
        const icon = button.querySelector('i');
        
        if (isInWishlist(productName)) {
            button.classList.add('in-wishlist');
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            button.classList.remove('in-wishlist');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
    
    // Update overlay button if it exists
    const overlayBtn = document.getElementById('productDetailsWishlistBtn');
    if (overlayBtn) {
        const title = document.getElementById('productDetailsTitle').textContent;
        const wishlistBtnText = document.getElementById('wishlistBtnText');
        const icon = overlayBtn.querySelector('i');
        
        if (title && isInWishlist(title)) {
            overlayBtn.classList.add('in-wishlist');
            icon.classList.remove('far');
            icon.classList.add('fas');
            if (wishlistBtnText) wishlistBtnText.textContent = 'Remove from Wishlist';
        } else if (title) {
            overlayBtn.classList.remove('in-wishlist');
            icon.classList.remove('fas');
            icon.classList.add('far');
            if (wishlistBtnText) wishlistBtnText.textContent = 'Add to Wishlist';
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Modified openProductDetails function to include wishlist button handler
function openProductDetails(element) {
    const card = element.closest('.card');
    const img = card.querySelector('img').src;
    const title = card.querySelector('h5').textContent;
    const specs = card.querySelector('p').textContent;
    const price = card.querySelector('.cost').textContent;
    
    document.getElementById('productDetailsImg').src = img;
    document.getElementById('productDetailsTitle').textContent = title;
    document.getElementById('productDetailsSpecs').innerHTML = specs
        .split('|')
        .map(spec => `<p>${spec.trim()}</p>`)
        .join('');
    document.getElementById('productDetailsPrice').textContent = price;
    
    const overlay = document.getElementById('productDetailsOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update wishlist button state
    updateAllWishlistButtons();
    
    // Set up wishlist button click handler
    const wishlistBtn = document.getElementById('productDetailsWishlistBtn');
    wishlistBtn.onclick = toggleWishlistFromOverlay;
    
    // Set up add to cart button
    const addBtn = document.getElementById('productDetailsAddBtn');
    const priceNum = parseInt(price.replace(/[^0-9]/g, ''));
    addBtn.onclick = () => addToCart(addBtn, title, priceNum);
    
    // Set up WhatsApp button
    const whatsappBtn = document.getElementById('productDetailsWhatsAppBtn');
    whatsappBtn.onclick = () => orderOnWhatsApp(title, price, specs);
}

function closeProductDetails() {
    const overlay = document.getElementById('productDetailsOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// WhatsApp order function
function orderOnWhatsApp(productName, price, specs) {
    const message = `Hi, I'm interested in:
*${productName}*
Price: ${price}
Specifications: ${specs}

Can you provide more details?`;
    
    const whatsappNumber = '254YOUR_NUMBER'; // Replace with your WhatsApp number
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Initialize wishlist on page load
document.addEventListener('DOMContentLoaded', function() {
    updateWishlistCount();
    updateAllWishlistButtons();
});

// Close overlay when clicking outside
document.getElementById('productDetailsOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductDetails();
    }
});





// Save Cart to LocalStorage








// Search Products
function searchProducts(query) {
    if (!query) {
        renderProducts(products);
        return;
    }
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );
    
    renderProducts(filtered);
}


// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const closeMenu = document.getElementById('close-menu');
    const overlay = document.getElementById('overlay');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.add('active');
            overlay.classList.add('active');
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.getElementById('cart-sidebar').classList.remove('active');
            // Check for admin modal and close it if active
            const adminModal = document.getElementById('admin-modal');
            if (adminModal) adminModal.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    // Cart Sidebar
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            overlay.classList.add('active');
            renderCartItems();
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    // Search Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchProducts(e.target.value);
            }, 300);
        });
    }   
    
    
   
    
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
        });
    }
    
    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
                
                // Close mobile menu
                if (navMenu) navMenu.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }
        });
    });
    
    // Checkout Button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            showNotification('Checkout feature coming soon!', 'info');
        });
    }
    
   
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;

//Left menu Sidebar
document.head.appendChild(style);


const hamburger = document.getElementById('hamburger');
const Sidebar = document.getElementById('Sidebar');
const overlay = document.getElementById('Overlay');

function toggleMenu() {
    hamburger.classList.toggle('active');
    Sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);