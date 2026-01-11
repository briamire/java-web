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
    loadWishlistFromStorage();
    updateCartUI();
    updateCartCount();
    updateWishlistCount();
    updateAllWishlistButtons();
    initializeSidebar();
});

// Cart functionality
// Add to cart function
function addToCart(button, productName, price) {
    // Prevent event bubbling
    event?.stopPropagation();
    
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
    updateCartCount();
    openCart();
    
    // Visual feedback
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.backgroundColor = '';
    }, 1500);
}

// Update cart UI
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer || !cartTotalElement) return;
    
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

// Update cart count badge
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
    updateCartCount();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCartToStorage();
    updateCartUI();
    updateCartCount();
}

// Open cart sidebar
function openCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar) {
        cartSidebar.classList.add('active');
    }
    if (overlay) {
        overlay.classList.add('active');
    }
}

// Close cart sidebar
function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar) {
        cartSidebar.classList.remove('active');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
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
    // Prevent event bubbling
    event?.stopPropagation();
    
    const card = element.closest('.card');
    if (!card) return;
    
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
    updateOverlayWishlistButton(title);
    
    // Set onclick handler for wishlist button
    const wishlistBtn = document.getElementById('productDetailsWishlistBtn');
    wishlistBtn.onclick = function() {
        toggleWishlistFromOverlay();
    };
    
    // Update WhatsApp button
    const whatsappBtn = document.getElementById('productDetailsWhatsAppBtn');
    whatsappBtn.onclick = function() {
        const message = `Hello! I'm interested in:\n\n${title}\n${specs}\nPrice: ${priceText}`;
        const whatsappNumber = '254745933132';
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    };
    
    const productOverlay = document.getElementById('productDetailsOverlay');
    if (productOverlay) {
        productOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeProductDetails() {
    const productOverlay = document.getElementById('productDetailsOverlay');
    if (productOverlay) {
        productOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Wishlist Management
// Load wishlist from storage
function loadWishlistFromStorage() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
}

// Save wishlist to storage
function saveWishlistToStorage() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Update wishlist count in header
function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

// Check if product is in wishlist
function isInWishlist(productName) {
    return wishlist.some(item => item.name === productName);
}

// Toggle wishlist from card
function toggleWishlist(button, productName, price, image) {
    // Prevent event bubbling
    event?.stopPropagation();
    
    const card = button.closest('.card');
    const specs = card.querySelector('p').textContent;
    
    if (isInWishlist(productName)) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.name !== productName);
        showNotification('Removed from wishlist', 'info');
    } else {
        // Add to wishlist
        wishlist.push({
            name: productName,
            price: price,
            image: image,
            specs: specs
        });
        showNotification('Added to wishlist!', 'success');
    }
    
    saveWishlistToStorage();
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
    
    if (isInWishlist(title)) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.name !== title);
        showNotification('Removed from wishlist', 'info');
    } else {
        // Add to wishlist
        wishlist.push({
            name: title,
            price: price,
            image: image,
            specs: specs
        });
        showNotification('Added to wishlist!', 'success');
    }
    
    saveWishlistToStorage();
    updateWishlistCount();
    updateAllWishlistButtons();
    updateOverlayWishlistButton(title);
}

// Update overlay wishlist button state
function updateOverlayWishlistButton(productName) {
    const overlayBtn = document.getElementById('productDetailsWishlistBtn');
    if (!overlayBtn) return;
    
    const wishlistBtnText = document.getElementById('wishlistBtnText');
    const icon = overlayBtn.querySelector('i');
    
    if (isInWishlist(productName)) {
        overlayBtn.classList.add('in-wishlist');
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
        if (wishlistBtnText) wishlistBtnText.textContent = 'In Wishlist';
    } else {
        overlayBtn.classList.remove('in-wishlist');
        if (icon) {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        if (wishlistBtnText) wishlistBtnText.textContent = 'Add to Wishlist';
    }
}

// Update all wishlist button states
function updateAllWishlistButtons() {
    // Update all card wishlist buttons
    document.querySelectorAll('.card-wishlist-btn').forEach(button => {
        const card = button.closest('.card');
        if (!card) return;
        
        const productName = card.querySelector('h5')?.textContent;
        if (!productName) return;
        
        const icon = button.querySelector('i');
        
        if (isInWishlist(productName)) {
            button.classList.add('in-wishlist');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        } else {
            button.classList.remove('in-wishlist');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }
    });
    
    // Update overlay button if it exists and has a product loaded
    const overlayTitle = document.getElementById('productDetailsTitle');
    if (overlayTitle && overlayTitle.textContent) {
        updateOverlayWishlistButton(overlayTitle.textContent);
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

// Scroll to Section with proper offset
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerOffset = 150;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize Sidebar
function initializeSidebar() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('Sidebar');
    const sidebarOverlay = document.getElementById('Overlay');
    
    if (hamburger && sidebar && sidebarOverlay) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
        
        sidebarOverlay.addEventListener('click', function() {
            closeSidebar();
        });
    }
    
    // Dropdown functionality - must work on both mobile and desktop
    document.querySelectorAll("[data-dropdown-toggle]").forEach(trigger => {
        // Remove any existing listeners first
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);
        
        newTrigger.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const parent = this.parentElement;

            if (parent.classList.contains("open")) {
                parent.classList.remove("open");
            } else {
                // Close all other dropdowns
                document.querySelectorAll(".has-dropdown.open")
                    .forEach(item => item.classList.remove("open"));

                parent.classList.add("open");
            }
        });
    });
    
    // Handle dropdown menu item clicks for scrolling to sections
    document.querySelectorAll('.dropdown-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                e.stopPropagation();
                
                const sectionId = href.substring(1);
                
                // Close sidebar first
                closeSidebar();
                
                // Then scroll to section after a small delay
                setTimeout(() => {
                    scrollToSection(sectionId);
                }, 300);
            }
        });
    });
}

function toggleSidebar() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('Sidebar');
    const sidebarOverlay = document.getElementById('Overlay');
    
    if (hamburger) hamburger.classList.toggle('active');
    if (sidebar) sidebar.classList.toggle('open');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
}

function closeSidebar() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('Sidebar');
    const sidebarOverlay = document.getElementById('Overlay');
    
    if (hamburger) hamburger.classList.remove('active');
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
}

// Setup Event Listeners
function setupEventListeners() {
    // Close product details overlay when clicking outside
    const productOverlay = document.getElementById('productDetailsOverlay');
    if (productOverlay) {
        productOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProductDetails();
            }
        });
    }
    
    // Close product details on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductDetails();
        }
    });
    
    // Cart Sidebar
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const overlay = document.getElementById('overlay');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (cartSidebar) cartSidebar.classList.add('active');
            if (overlay) overlay.classList.add('active');
            updateCartUI();
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            closeCart();
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeCart();
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
    
    // Navigation Links - handle section scrolling
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        // Skip dropdown toggles - they're handled separately
        if (link.hasAttribute('data-dropdown-toggle')) {
            return;
        }
        
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
                
                // Close sidebar if open
                closeSidebar();
            }
        });
    });
    
    // Checkout Button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    // Title click to go home
    const titleElement = document.getElementById('rotating-title');
    if (titleElement) {
        titleElement.addEventListener('click', function() {
            window.location.href = '/';
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
document.head.appendChild(style);