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
    loadCartFromStorage();
    updateCartUI();
    updateCartCount(); // Add cart count update
    updateWishlistCount();
    updateAllWishlistButtons();
});

// Cart functionality
// Add to cart function
function addToCart(button, productName, price) {
    // Get product image from the card
    const card = button.closest('.card');
    const imgSrc = card ? card.querySelector('img').src : '';
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            image: imgSrc,
            quantity: 1
        });
    }
    
    // Save to storage and update UI
    saveCartToStorage();
    updateCartUI();
    updateCartCount(); // Update cart count
    openCart();
    
    // Visual feedback
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        button.style.backgroundColor = '';
    }, 1500);
}

// Update cart UI
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    // Clear existing items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
        cartTotalElement.textContent = 'KES 0';
        return;
    }
    
    // Add cart items
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">KES ${item.price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `KES ${total.toLocaleString()}`;
}

// Update cart count badge - NEW FUNCTION
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Update quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCartToStorage();
    updateCartUI();
    updateCartCount(); // Update cart count
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCartToStorage();
    updateCartUI();
    updateCartCount(); // Update cart count
}

// Open cart sidebar
function openCart() {
    document.getElementById('cart-sidebar').classList.add('active');
}

// Close cart sidebar
function closeCart() {
    document.getElementById('cart-sidebar').classList.remove('active');
}

// Save cart to storage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from storage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Create WhatsApp message
    let message = 'Hello! I would like to order the following items:\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `${item.name}\nQuantity: ${item.quantity}\nPrice: KES ${itemTotal.toLocaleString()}\n\n`;
        total += itemTotal;
    });
    
    message += `Total: KES ${total.toLocaleString()}`;
    
    // WhatsApp number
    const whatsappNumber = '254745933132';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappURL, '_blank');
}

// Update product details overlay to support add to cart
function openProductDetails(element) {
    const card = element.closest('.card');
    const imgSrc = card.querySelector('img').src;
    const title = card.querySelector('h5').textContent;
    const specs = card.querySelector('p').textContent;
    const priceText = card.querySelector('.cost').textContent;
    const price = parseInt(priceText.replace(/[^0-9]/g, ''));
    
    document.getElementById('productDetailsImg').src = imgSrc;
    document.getElementById('productDetailsTitle').textContent = title;
    document.getElementById('productDetailsSpecs').innerHTML = specs
        .split('|')
        .map(spec => `<p>${spec.trim()}</p>`)
        .join('');
    document.getElementById('productDetailsPrice').textContent = priceText;
    
    // Update add to cart button in overlay
    const addBtn = document.getElementById('productDetailsAddBtn');
    addBtn.onclick = function() {
        addToCart(this, title, price);
    };
    
    // Update wishlist button in overlay
    const wishlistBtn = document.getElementById('productDetailsWishlistBtn');
    const wishlistIcon = wishlistBtn.querySelector('i');
    const isInWishlist = checkIfInWishlist(title);
    
    if (isInWishlist) {
        wishlistIcon.classList.remove('far');
        wishlistIcon.classList.add('fas');
        document.getElementById('wishlistBtnText').textContent = 'In Wishlist';
    } else {
        wishlistIcon.classList.remove('fas');
        wishlistIcon.classList.add('far');
        document.getElementById('wishlistBtnText').textContent = 'Add to Wishlist';
    }
    
    //wishlistBtn.onclick = function() {
      //  toggleWishlist(this, title, price, imgSrc);
        // Update button state
        //const icon = this.querySelector('i');
       // const text = document.getElementById('wishlistBtnText');
        //if (icon.classList.contains('fas')) {
          //  icon.classList.remove('fas');
           // icon.classList.add('far');
           // text.textContent = 'Add to Wishlist';
       // } else {
        //    icon.classList.remove('far');
          //  icon.classList.add('fas');
           // text.textContent = 'In Wishlist';
      //  }
   // };
    
    // Update WhatsApp button
    const whatsappBtn = document.getElementById('productDetailsWhatsAppBtn');
    whatsappBtn.onclick = function() {
        const message = `Hello! I'm interested in:\n\n${title}\n${specs}\nPrice: ${priceText}`;
        const whatsappNumber = '254745933132';
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    };
    
    document.getElementById('productDetailsOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update wishlist button state
    updateAllWishlistButtons();
}

function closeProductDetails() {
    document.getElementById('productDetailsOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Helper function for wishlist check
function checkIfInWishlist(productName) {
   const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.some(item => item.name === productName);
}

// Wishlist Management
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

// WhatsApp order function
function orderOnWhatsApp(productName, price, specs) {
    const message = `Hi, I'm interested in:
*${productName}*
Price: ${price}
Specifications: ${specs}

Can you provide more details?`;
    
    const whatsappNumber = '254745933132';
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Close overlay when clicking outside
document.getElementById('productDetailsOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductDetails();
    }
});

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
    const closeCartBtn = document.getElementById('close-cart');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            overlay.classList.add('active');
            updateCartUI();
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
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
        checkoutBtn.addEventListener('click', proceedToCheckout);
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
const overlayEl = document.getElementById('Overlay');

function toggleMenu() {
    hamburger.classList.toggle('active');
    Sidebar.classList.toggle('open');
    overlayEl.classList.toggle('active');
}

if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
}
if (overlayEl) {
    overlayEl.addEventListener('click', toggleMenu);
}