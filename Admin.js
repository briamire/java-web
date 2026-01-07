
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
// UPDATE THIS URL TO YOUR DEPLOYED BACKEND
const API_URL = 'http://localhost:5000/api/products'; // Change this after deploying backend

let products = [];
let editingId = null;

// Show alert messages
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertcontainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

// Update statistics
function updateStats() {
  document.getElementById('totalProducts').textContent = products.length;
  
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  document.getElementById('totalValue').textContent = `KES ${totalValue.toLocaleString()}`;
  
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
  document.getElementById('lowStock').textContent = lowStock;
  
  const categories = new Set(products.map(p => p.category));
  document.getElementById('totalCategories').textContent = categories.size;
}

// Fetch products from backend
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch products');
    products = await response.json();
    renderProducts();
    updateStats();
  } catch (error) {
    console.error('Error fetching products:', error);
    showAlert('Failed to load products. Please check backend connection.', 'danger');
  }
}

// Render products table
function renderProducts() {
  const container = document.getElementById('dynamic-product-container');
  
  if (products.length === 0) {
    container.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
    return;
  }
  
  container.innerHTML = products.map(product => `
    <tr>
      <td>
        <img src="${product.image?.[0] || 'placeholder.jpg'}" 
             alt="${product.name}" 
             style="width: 50px; height: 50px; object-fit: cover;">
      </td>
      <td>${product.name}</td>
      <td>KES ${product.price.toLocaleString()}</td>
      <td>${product.category}</td>
      <td><span class="badge bg-${product.condition === 'Brand New' ? 'success' : 'info'}">${product.condition}</span></td>
      <td>${product.stock || 0}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editProduct('${product._id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Handle form submission
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value,
    condition: document.getElementById('productCondition').value,
    description: document.getElementById('productDescription').value,
    stock: parseInt(document.getElementById('productStock').value) || 0,
    image: Array.from(document.querySelectorAll('.image-url-input'))
      .map(input => input.value)
      .filter(url => url.trim() !== '')
  };
  
  try {
    let response;
    if (editingId) {
      // Update existing product
      response = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } else {
      // Create new product
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    
    if (!response.ok) throw new Error('Failed to save product');
    
    showAlert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
    editingId = null;
    document.getElementById('productForm').reset();
    document.getElementById('imageUrlContainer').innerHTML = `
      <div class="input-group mb-2">
        <input type="url" class="form-control image-url-input" placeholder="https://example.com/image1.jpg">
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
      </div>
    `;
    fetchProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    showAlert('Failed to save product', 'danger');
  }
});

// Edit product
async function editProduct(id) {
  const product = products.find(p => p._id === id);
  if (!product) return;
  
  editingId = id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productCondition').value = product.condition;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productStock').value = product.stock || 0;
  
  // Set image URLs
  const container = document.getElementById('imageUrlContainer');
  container.innerHTML = product.image.map(url => `
    <div class="input-group mb-2">
      <input type="url" class="form-control image-url-input" value="${url}">
      <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
    </div>
  `).join('');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete product
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete product');
    
    showAlert('Product deleted successfully!');
    fetchProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    showAlert('Failed to delete product', 'danger');
  }
}

// Add image URL input
function addImageUrl() {
  const container = document.getElementById('imageUrlContainer');
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <input type="url" class="form-control image-url-input" placeholder="https://example.com/image.jpg">
    <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(div);
}

// Search products
function searchProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm)
  );
  
  const container = document.getElementById('dynamic-product-container');
  container.innerHTML = filteredProducts.map(product => `
    <tr>
      <td><img src="${product.image?.[0] || 'placeholder.jpg'}" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>${product.name}</td>
      <td>KES ${product.price.toLocaleString()}</td>
      <td>${product.category}</td>
      <td><span class="badge bg-${product.condition === 'Brand New' ? 'success' : 'info'}">${product.condition}</span></td>
      <td>${product.stock || 0}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editProduct('${product._id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// Filter products by category
function filterProducts(category) {
  const filtered = category === 'all' 
    ? products 
    : products.filter(p => p.category === category);
  
  const container = document.getElementById('dynamic-product-container');
  container.innerHTML = filtered.map(product => `
    <tr>
      <td><img src="${product.image?.[0] || 'placeholder.jpg'}" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>${product.name}</td>
      <td>KES ${product.price.toLocaleString()}</td>
      <td>${product.category}</td>
      <td><span class="badge bg-${product.condition === 'Brand New' ? 'success' : 'info'}">${product.condition}</span></td>
      <td>${product.stock || 0}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editProduct('${product._id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// Initialize
fetchProducts();
