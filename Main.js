// API Configuration - BACKEND URL
const API_URL = 'https://java-web-gyfu.onrender.com/api/products';

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
    updateCartCount();
    updateWishlistCount();
    updateAllWishlistButtons();
    loadProductsFromBackend(); // Load products from backend
});

// // Load products from backend
// async function loadProductsFromBackend() {
//     try {
//         const response = await fetch(API_URL);
//         if (!response.ok) throw new Error('Failed to fetch products');
        
//         products = await response.json();
//         console.log('Loaded products from backend:', products);
        
//         // Render products if there's a container
//         const container = document.getElementById('products-container');
//         if (container && products.length > 0) {
//             renderProductsToPage(products);
//         }
//     } catch (error) {
//         console.error('Error loading products:', error);
//         showNotification('Failed to load products from backend', 'error');
//     }
// }

// Render products to the page
function renderProductsToPage(productsToRender) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = productsToRender.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card product-card">
                <img src="${product.image?.[0] || 'images/placeholder.jpg'}" 
                     class="card-img-top" 
                     alt="${product.name}"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="card-body">
                    <span class="badge bg-${product.condition === 'Brand New' ? 'success' : 'info'} mb-2">
                        ${product.condition}
                    </span>
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.category}</p>
                    <p class="card-text small">${product.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="h5 mb-0 text-primary">KES ${product.price.toLocaleString()}</span>
                        ${product.stock > 0 
                            ? '<span class="badge bg-success">In Stock</span>' 
                            : '<span class="badge bg-danger">Out of Stock</span>'
                        }
                    </div>
                    <button class="btn btn-primary w-100 mt-2" 
                            onclick="addToCart(this, '${product.name}', ${product.price})"
                            ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Cart functionality
function addToCart(button, productName, price) {
    const card = button.closest('.card');
    const imgSrc = card ? card.querySelector('img').src : '';
    
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
    
    saveCartToStorage();
    updateCartUI();
    updateCartCount();
    openCart();
    
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
    
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
        if (cartTotalElement) cartTotalElement.textContent = 'KES 0';
        return;
    }
    
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
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalElement) cartTotalElement.textContent = `KES ${total.toLocaleString()}`;
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

// Open/Close cart sidebar
function openCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) cartSidebar.classList.add('active');
}

function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) cartSidebar.classList.remove('active');
}

// Save/Load cart
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

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
    
    let message = 'Hello! I would like to order the following items:\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `${item.name}\nQuantity: ${item.quantity}\nPrice: KES ${itemTotal.toLocaleString()}\n\n`;
        total += itemTotal;
    });
    
    message += `Total: KES ${total.toLocaleString()}`;
    
    const whatsappNumber = '254745933132';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappURL, '_blank');
}

// Wishlist Management
function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

function isInWishlist(productName) {
    return wishlist.some(item => item.name === productName);
}

function toggleWishlist(button, productName, price, image) {
    const card = button.closest('.card');
    const icon = button.querySelector('i');
    const specs = card ? card.querySelector('p')?.textContent : '';
    
    if (isInWishlist(productName)) {
        wishlist = wishlist.filter(item => item.name !== productName);
        button.classList.remove('in-wishlist');
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('Removed from wishlist', 'info');
    } else {
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

function updateAllWishlistButtons() {
    document.querySelectorAll('.card-wishlist-btn').forEach(button => {
        const card = button.closest('.card');
        if (!card) return;
        
        const productName = card.querySelector('h5')?.textContent;
        const icon = button.querySelector('i');
        
        if (productName && isInWishlist(productName)) {
            button.classList.add('in-wishlist');
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            button.classList.remove('in-wishlist');
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Search Products
function searchProducts(query) {
    if (!query) {
        renderProductsToPage(products);
        return;
    }
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase())) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
    
    renderProductsToPage(filtered);
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
            if (overlay) overlay.classList.add('active');
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar) cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    // Cart Sidebar
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            openCart();
            if (overlay) overlay.classList.add('active');
            updateCartUI();
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            closeCart();
            if (overlay) overlay.classList.remove('active');
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
    
    // Checkout Button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('Sidebar');
    const overlayEl = document.getElementById('Overlay');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            if (sidebar) sidebar.classList.toggle('open');
            if (overlayEl) overlayEl.classList.toggle('active');
        });
    }
    
    if (overlayEl) {
        overlayEl.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            sidebar?.classList.remove('open');
            overlayEl.classList.remove('active');
        });
    }
}

// Dropdown toggle functionality
document.querySelectorAll('[data-dropdown-toggle]').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const parentLi = toggle.closest('.has-dropdown');
        parentLi.classList.toggle('open');
        
        // Close other dropdowns
        document.querySelectorAll('.has-dropdown').forEach(item => {
            if (item !== parentLi) {
                item.classList.remove('open');
            }
        });
    });
});

// Add CSS for animations
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


//force frontend to use deployed backend URL
fetch(`${API_BASE}/`)
  .then(res => res.json())
  .then(data => {
    console.log("CONNECTED:", data);
    alert("Backend connected: " + data.message);
  })
  .catch(err => {
    console.error("CONNECTION FAILED:", err);
    alert("Backend NOT connected");
  });
