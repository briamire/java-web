// Backend API URLs
const API_URL = 'https://java-web-gyfu.onrender.com/api/products';
const AUTH_API_URL = 'https://java-web-gyfu.onrender.com/api/auth';

let products = [];
let editingId = null;

// Check authentication on page load
checkAuth();

function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'UserLogin.html';
    return;
  }
  
  // Display admin info
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
  if (adminInfo.username) {
    const userDisplay = document.getElementById('adminUsername');
    if (userDisplay) {
      userDisplay.textContent = adminInfo.username;
    }
  }
}

// Get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = 'UserLogin.html';
  }
}

// Show alert messages
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertcontainer');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

// Update statistics
function updateStats() {
  const totalProductsEl = document.getElementById('totalProducts');
  const totalValueEl = document.getElementById('totalValue');
  const lowStockEl = document.getElementById('lowStock');
  const totalCategoriesEl = document.getElementById('totalCategories');
  
  if (totalProductsEl) totalProductsEl.textContent = products.length;
  
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  if (totalValueEl) totalValueEl.textContent = `KES ${totalValue.toLocaleString()}`;
  
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
  if (lowStockEl) lowStockEl.textContent = lowStock;
  
  const categories = new Set(products.map(p => p.category));
  if (totalCategoriesEl) totalCategoriesEl.textContent = categories.size;
}

// Fetch products from backend
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch products');
    products = await response.json();
    console.log('Fetched products:', products);
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
  if (!container) return;
  
  if (products.length === 0) {
    container.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
    return;
  }
  
  container.innerHTML = products.map(product => `
    <tr>
      <td>
        <img src="${product.image?.[0] || 'placeholder.jpg'}" 
             alt="${product.name}" 
             style="width: 50px; height: 50px; object-fit: cover;"
             onerror="this.src='placeholder.jpg'">
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
const productForm = document.getElementById('productForm');
if (productForm) {
  productForm.addEventListener('submit', async (e) => {
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
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });
      } else {
        // Create new product
        response = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });
      }
      
      if (response.status === 401) {
        showAlert('Session expired. Please login again.', 'danger');
        setTimeout(() => {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          window.location.href = 'UserLogin.html';
        }, 2000);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }
      
      showAlert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
      editingId = null;
      productForm.reset();
      
      const imageContainer = document.getElementById('imageUrlContainer');
      if (imageContainer) {
        imageContainer.innerHTML = `
          <div class="input-group mb-2">
            <input type="url" class="form-control image-url-input" placeholder="https://example.com/image1.jpg">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
          </div>
        `;
      }
      
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showAlert(error.message || 'Failed to save product', 'danger');
    }
  });
}

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
  if (container) {
    container.innerHTML = (product.image || []).map(url => `
      <div class="input-group mb-2">
        <input type="url" class="form-control image-url-input" value="${url}">
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
      </div>
    `).join('');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete product
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      showAlert('Session expired. Please login again.', 'danger');
      setTimeout(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = 'UserLogin.html';
      }, 2000);
      return;
    }
    
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
  if (!container) return;
  
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
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm)
  );
  
  const container = document.getElementById('dynamic-product-container');
  if (!container) return;
  
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
  if (!container) return;
  
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

// Initialize - fetch products on load
fetchProducts();