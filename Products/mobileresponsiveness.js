// Mobile Touch Event Fixes
document.addEventListener('DOMContentLoaded', () => {
    // Fix 1: Add touch event support for all clickable elements
    const addTouchSupport = (selector, callback) => {
        document.querySelectorAll(selector).forEach(element => {
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                callback.call(element, e);
            });
        });
    };

    // Fix 2: Ensure cart buttons work on mobile
    document.addEventListener('touchend', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (addToCartBtn) {
            e.preventDefault();
            const card = addToCartBtn.closest('.card');
            const productName = card.querySelector('h5').textContent;
            const priceText = card.querySelector('.cost').textContent;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            addToCart(addToCartBtn, productName, price);
        }
    });

    // Fix 3: Ensure wishlist buttons work on mobile
    document.addEventListener('touchend', (e) => {
        const wishlistBtn = e.target.closest('.card-wishlist-btn');
        if (wishlistBtn) {
            e.preventDefault();
            const card = wishlistBtn.closest('.card');
            const productName = card.querySelector('h5').textContent;
            const priceText = card.querySelector('.cost').textContent;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            const image = card.querySelector('img').src;
            toggleWishlist(wishlistBtn, productName, price, image);
        }
    });

    // Fix 4: Product details modal on mobile
    document.addEventListener('touchend', (e) => {
        const clickableElements = e.target.closest('img, h5, p');
        if (clickableElements && clickableElements.closest('.card')) {
            e.preventDefault();
            openProductDetails(clickableElements);
        }
    });

    // Fix 5: Hamburger menu on mobile
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('touchend', (e) => {
            e.preventDefault();
            toggleMenu();
        });
    }

    // Fix 6: Overlay click/touch
    const overlay = document.getElementById('Overlay');
    if (overlay) {
        overlay.addEventListener('touchend', (e) => {
            e.preventDefault();
            toggleMenu();
        });
    }

    // Fix 7: Sidebar menu items
    document.querySelectorAll('.Sidebar-menu a').forEach(link => {
        link.addEventListener('touchend', (e) => {
            e.stopPropagation();
            // Allow default behavior for navigation
        });
    });

    // Fix 8: Dropdown toggles in sidebar
    document.querySelectorAll('[data-dropdown-toggle]').forEach(trigger => {
        trigger.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const parent = trigger.parentElement;
            
            if (parent.classList.contains('open')) {
                parent.classList.remove('open');
            } else {
                document.querySelectorAll('.has-dropdown.open')
                    .forEach(item => item.classList.remove('open'));
                parent.classList.add('open');
            }
        });
    });

    // Fix 9: Cart sidebar buttons
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const cartSidebar = document.getElementById('cart-sidebar');
            const overlayEl = document.getElementById('overlay');
            if (cartSidebar) cartSidebar.classList.add('active');
            if (overlayEl) overlayEl.classList.add('active');
            updateCartUI();
        });
    }

    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const cartSidebar = document.getElementById('cart-sidebar');
            const overlayEl = document.getElementById('overlay');
            if (cartSidebar) cartSidebar.classList.remove('active');
            if (overlayEl) overlayEl.classList.remove('active');
        });
    }

    // Fix 10: Search functionality on mobile
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.style.width = '100%';
        });
        
        // Handle search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchProductsStatic();
                searchInput.blur(); // Close keyboard on mobile
            }
        });
    }

    // Fix 11: Filter buttons on mobile
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const btnText = btn.textContent.toLowerCase();
            if (btnText === 'all') {
                filterProducts('all');
            } else {
                filterProducts(btnText);
            }
        });
    });

    // Fix 12: Navigation links
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('touchend', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
            }
            // Allow default for regular links
        });
    });

    // Fix 13: Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            proceedToCheckout();
        });
    }

    // Fix 14: Product details overlay close button
    const closeDetailsBtn = document.querySelector('#productDetailsOverlay .close-btn');
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            closeProductDetails();
        });
    }

    // Fix 15: Prevent zoom on double tap for buttons
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Fix 16: Make sure cart quantity buttons work
    document.addEventListener('touchend', (e) => {
        const quantityBtn = e.target.closest('.cart-item-quantity button');
        if (quantityBtn) {
            e.preventDefault();
            quantityBtn.click();
        }
    });

    // Fix 17: Remove item from cart button
    document.addEventListener('touchend', (e) => {
        const removeBtn = e.target.closest('.cart-item-remove');
        if (removeBtn) {
            e.preventDefault();
            removeBtn.click();
        }
    });

    // Fix 18: User button
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            // Add your user button functionality here
        });
    }

    // Fix 19: Wishlist button in header
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            // Add your wishlist page navigation here
        });
    }

    // Fix 20: Rotating title
    const titleElement = document.getElementById('rotating-title');
    if (titleElement) {
        titleElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            window.location.href = '/';
        });
    }

    console.log('Mobile fixes applied successfully!');
});

// Additional CSS for better mobile touch targets
const mobileStyle = document.createElement('style');
mobileStyle.textContent = `
    @media (max-width: 768px) {
        /* Larger touch targets */
        .add-to-cart,
        .card-wishlist-btn,
        .filter-btn,
        button,
        .icon-btn {
            min-height: 44px;
            min-width: 44px;
            touch-action: manipulation;
        }
        
        /* Prevent text selection on buttons */
        button, .card-wishlist-btn, .add-to-cart {
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        
        /* Better touch feedback */
        .card {
            cursor: pointer;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        }
        
        /* Fix overlay z-index */
        .Overlay {
            z-index: 998;
        }
        
        .Sidebar {
            z-index: 999;
        }
        
        /* Ensure product details overlay is on top */
        #productDetailsOverlay {
            z-index: 1000;
        }
        
        /* Make search input mobile friendly */
        #searchInput {
            font-size: 16px; /* Prevents zoom on iOS */
        }
        
        /* Fix cart sidebar on mobile */
        #cart-sidebar {
            z-index: 999;
        }
    }
`;
document.head.appendChild(mobileStyle);