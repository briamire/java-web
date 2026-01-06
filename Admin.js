
// Admin Panel Functions

// Load admin products when panel is shown
function loadAdminProducts() {
    fetch(`${API_BASE_URL}/products`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderAdminProducts(data.data);
            }
        })
        .catch(error => {
            console.error('Error loading admin products:', error);
            showNotification('Error loading products', 'error');
        });
}

// Render Admin Products Table
function renderAdminProducts(products) {

    const tbody = document.getElementById('admin-products-tbody');
    
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.productId}</td>
            <td style="font-size: 2rem;">${product.imageUrl}</td>
            <td>${product.name}</td>
            <td>${product.categoryName || 'N/A'}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="action-btn edit" onclick="editProduct(${product.productId})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteProduct(${product.productId})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Add Product Button

document.addEventListener('DOMContentLoaded', () => {
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openProductModal();
        });
    }
    
    // Product Form Submit
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            saveProduct();
        });
    }
    
    // Close Product Modal
    const closeProductModal = document.getElementById('close-product-modal');
    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            closeModal('product-modal');
        });
    }
    
    // Admin Tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            switchAdminTab(tabName);
        });
    });
    
    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('admin-panel').style.display = 'none';
            showNotification('Logged out successfully', 'success');
        });
    }
});

// Switch Admin Tab

function switchAdminTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update active tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`admin-${tabName}`);
    if (activeContent) {
        activeContent.classList.add('active');

    }
    
    // Load data for the tab
    if (tabName === 'products') {
        loadAdminProducts();
    }
}

// Open Product Modal
function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('product-modal-title');
    const form = document.getElementById('product-form');
    
    if (!modal || !form) return;
    
    form.reset();

    
    if (product) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.productId;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-category').value = product.categoryId;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-image').value = product.imageUrl;
        document.getElementById('product-rating').value = product.rating;
    } else {

        // Add mode
        modalTitle.textContent = 'Add Product';
        document.getElementById('product-id').value = '';
    }
    
    modal.classList.add('active');
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Save Product
async function saveProduct() {
    const productId = 

document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        categoryId: parseInt(document.getElementById('product-category').value),
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        imageUrl: document.getElementById('product-image').value,

        rating: parseFloat(document.getElementById('product-rating').value)
    };
    
    try {
        let response;
        
        if (productId) {
            // Update existing product
            response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Add new product

            response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(productId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
            closeModal('product-modal');
            loadAdminProducts();
            loadProducts(); // Refresh main products list

        } else {
            showNotification(result.message || 'Error saving product', 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product', 'error');
    }
}

// Edit Product
async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
            openProductModal(data.data);

        } else {
            showNotification('Error loading product', 'error');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Error loading product', 'error');
    }
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`$

{API_BASE_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product deleted successfully!', 'success');
            loadAdminProducts();
            loadProducts(); // Refresh main products list
        } else {
            showNotification(result.message || 'Error deleting product', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');

    }
}

// Export data as CSV
function exportProductsCSV() {
    fetch(`${API_BASE_URL}/products`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const products = data.data;
                let csv = 'ID,Name,Description,Price,Category,Stock,Rating\n';
                
                products.forEach(product => {
                    csv += `${product.productId},"${product.name}","${product.description}",${product.price},${product.categoryName},${product.stock},${product.rating}\n`;
                });
                

                // Download CSV
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'products.csv';
                a.click();
                window.URL.revokeObjectURL(url);
                
                showNotification('Products exported successfully!', 'success');
            }
        })
        .catch(error => {
            console.error('Error exporting products:', error);
            showNotification('Error exporting products', 'error');

        });
}

// Print Product List
function printProductList() {
    window.print();
}




//admin.html functionality
const API_URL = "http://api/products";

const form = document.getElementById("productForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, price })
    });

    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.message || "Error adding product";
      return;
    }

    status.textContent = "Product added successfully";
    form.reset();

  } catch (err) {
    console.error(err);
    status.textContent = "Server error";
  }
});
