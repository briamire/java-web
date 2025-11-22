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
    initializeApp();
    setupEventListeners();
    updateCartCount();
    updateWishlistCount();
});

// Initialize Application
async function initializeApp() {
    try {
        await loadCategories();
        await loadProducts();
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error loading data', 'error');
    }
}

// Load Categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        
        if (data.success) {
            categories = data.data;
            renderCategories();
            renderCategoryDropdown();
            renderFilterTabs();
            populateCategorySelect();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load Products
async function loadProducts(categoryId = null) {
    showLoading(true);
    
    try {
        let url = `${API_BASE_URL}/products`;
        if (categoryId && categoryId !== 'all') {
            url += `/category?id=${categoryId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            products = data.data;
            renderProducts(products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    } finally {
        showLoading(false);
    }
}

// Render Categories Grid
function renderCategories() {
    const categoriesGrid = document.getElementById('categories-grid');
    
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.category_id}')">
            <i class="fas fa-${getCategoryIcon(cat.name)}"></i>
            <h3>${cat.name}</h3>
        </div>
    `).join('');
}

// Render Category Dropdown
function renderCategoryDropdown() {
    const dropdown = document.getElementById('categories-dropdown');
    
    if (!dropdown) return;
    
    dropdown.innerHTML = categories.map(cat => `
        <li><a href="#products" onclick="filterByCategory('${cat.category_id}')">${cat.name}</a></li>
    `).join('');
}

// Render Filter Tabs
function renderFilterTabs() {
    const filterTabs = document.getElementById('filter-tabs');
    
    if (!filterTabs) return;
    
    const allTab = '<button class="tab-btn active" data-category="all" onclick="filterByCategory(\'all\')">All</button>';
    const categoryTabs = categories.map(cat => `
        <button class="tab-btn" data-category="${cat.category_id}" onclick="filterByCategory('${cat.category_id}')">${cat.name}</button>
    `).join('');
    
    filterTabs.innerHTML = allTab + categoryTabs;
}

// Populate Category Select in Form
function populateCategorySelect() {
    const select = document.getElementById('product-category');
    
    if (!select) return;
    
    select.innerHTML = categories.map(cat => `
        <option value="${cat.category_id}">${cat.name}</option>
    `).join('');
}

// Render Products
function renderProducts(productsToRender) {
    const productsGrid = document.getElementById('products-grid');
    const noProducts = document.getElementById('no-products');
    
    if (!productsGrid) return;
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '';
        noProducts.style.display = 'block';
        return;
    }
    
    noProducts.style.display = 'none';
    
    productsGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-product-id="${product.productId}">
            <div class="product-image">${product.imageUrl}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${renderStars(product.rating)}
                    <span>${product.rating}</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-stock">${product.stock} in stock</div>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart(${product.productId})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="add-to-wishlist" onclick="toggleWishlist(${product.productId})">
                        <i class="${isInWishlist(product.productId) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render Star Rating
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Get Category Icon
function getCategoryIcon(categoryName) {
    const icons = {
        'Laptops': 'laptop',
        'Printers': 'print',
        'Monitors': 'desktop',
        'Keyboards': 'keyboard',
        'Mice': 'mouse',
        'Headphones': 'headphones'
    };
    return icons[categoryName] || 'cube';
}

// Filter by Category
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === categoryId) {
            btn.classList.add('active');
        }
    });
    
    // Load products
    loadProducts(categoryId === 'all' ? null : categoryId);
    
    // Scroll to products section
    scrollToSection('products');
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.productId === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    renderCartItems();
    showNotification('Product added to cart!', 'success');
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartCount();
    renderCartItems();
    showNotification('Product removed from cart', 'info');
}

// Update Cart Quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.productId === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    renderCartItems();
}

// Toggle Wishlist
function toggleWishlist(productId) {
    const product = products.find(p => p.productId === productId);
    
    if (!product) return;
    
    const index = wishlist.findIndex(item => item.productId === productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist', 'info');
    } else {
        wishlist.push(product);
        showNotification('Added to wishlist!', 'success');
    }
    
    saveWishlist();
    updateWishlistCount();
    renderProducts(products);
}

// Check if product is in wishlist
function isInWishlist(productId) {
    return wishlist.some(item => item.productId === productId);
}

// Render Cart Items
function renderCartItems() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.imageUrl}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.productId}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.productId}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.productId})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update Cart Count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const topCartCount = document.getElementById('top-cart-count');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
    
    if (topCartCount) {
        topCartCount.textContent = count;
        topCartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Update Wishlist Count
function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlist-count');
    const topWishlistCount = document.getElementById('top-wishlist-count');
    
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
    
    if (topWishlistCount) {
        topWishlistCount.textContent = wishlist.length;
        topWishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Save Wishlist to LocalStorage
function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
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

// Show Loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
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
    
    // Admin Login
    const userBtn = document.getElementById('user-btn');
    const adminModal = document.getElementById('admin-modal');
    const closeAdminModal = document.getElementById('close-admin-modal');
    
    if (userBtn) {
        userBtn.addEventListener('click', () => {
        adminModal.classList.add('active');
        });
    }
    
    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', () => {
        adminModal.classList.remove('active');
        });
    }
    
    // Admin Login Form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            
            // Simple authentication (replace with real authentication)
            if (username === 'admin' && password === 'admin123') {
                adminModal.classList.remove('active');
                document.getElementById('main-content').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'block';
                showNotification('Login successful!', 'success');
            } else {
                showNotification('Invalid credentials', 'error');
            }
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
    
    // Logout Button (for Admin Panel)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            document.getElementById('admin-panel').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            showNotification('Logged out successfully', 'info');
        });
    }
    
    // Admin Tab Switching (Added for completeness)
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const target = document.getElementById(`admin-${tab.dataset.tab}`);
            if (target) target.classList.add('active');
        });
    });
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
