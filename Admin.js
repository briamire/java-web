/* ================== GLOBALS ================== */

const API_URL = "https://java-web-gyfu.onrender.com/api/products";

let products = [];
let editingId = null;

/* ================== HELPERS ================== */

function getAuthHeaders() {
  return {
    "Content-Type": "application/json"
  };
}

function showAlert(message, type = "success") {
  const container = document.getElementById("alertContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="alert ${type === "danger" ? "alert-error" : "alert-success"}">
      ${message}
    </div>
  `;

  setTimeout(() => {
    container.innerHTML = "";
  }, 3000);
}

/* ================== FETCH PRODUCTS ================== */

async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch products");

    products = await response.json();
    renderProducts();
    updateStats();
  } catch (error) {
    console.error(error);
    showAlert("Failed to load products", "danger");
  }
}

/* ================== RENDER PRODUCTS ================== */

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `<div class="loading">No products</div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.image?.[0] || ""}" />
      <h3>${p.name}</h3>
      <div class="price">KES ${p.price}</div>
      <div class="category">${p.category}</div>
      <div class="condition">${p.condition}</div>
      <div class="stock">Stock: ${p.stock}</div>
    </div>
  `).join("");
}

/* ================== STATS ================== */

function updateStats() {
  document.getElementById("totalProducts").textContent = products.length;

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  document.getElementById("totalValue").textContent = `KES ${totalValue}`;

  document.getElementById("lowStock").textContent =
    products.filter(p => p.stock < 5).length;

  document.getElementById("totalCategories").textContent =
    new Set(products.map(p => p.category)).size;
}

/* ================== FORM SUBMIT (THIS IS THE POST) ================== */

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById("productName").value,
    price: Number(document.getElementById("productPrice").value),
    category: document.getElementById("productCategory").value,
    condition: document.getElementById("productCondition").value,
    stock: Number(document.getElementById("productStock").value),
    description: document.getElementById("productDescription").value,

    // ✅ FIXED SELECTOR
    image: Array.from(document.querySelectorAll(".image-url"))
      .map(input => input.value)
      .filter(Boolean)
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    showAlert("Product added successfully");
    document.getElementById("productForm").reset();
    fetchProducts();

  } catch (error) {
    console.error(error);
    showAlert("Failed to add product", "danger");
  }
});

/* ================== IMAGE INPUT HANDLERS ================== */
/* THESE MATCH YOUR EXISTING HTML BUTTONS */

function addImageInput() {
  const container = document.getElementById("imageUrlsContainer");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "image-url-input";
  div.innerHTML = `
    <input type="url" class="image-url" placeholder="https://example.com/image.jpg">
    <button type="button" class="btn-remove-image" onclick="removeImageInput(this)">✕</button>
  `;
  container.appendChild(div);
}

function removeImageInput(btn) {
  btn.parentElement.remove();
}

/* ================== INIT ================== */

fetchProducts();


// Add this to the top of your Admin.js file

// Admin.js
async function verifyAdmin() {
    const token = localStorage.getItem('adminToken');
    
    // 1. If no token, don't even try to fetch, just redirect
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        const response = await fetch(`https://java-web-gyfu.onrender.com/api/auth/verify`, {
            method: 'GET',
            headers: {
                // IMPORTANT: Ensure there is a space after 'Bearer'
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
            console.error("Token is invalid or expired");
            localStorage.removeItem('adminToken'); // Clear bad token
            window.location.href = 'admin-login.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Verified successfully:", data);
        
        // Initialization functions
        if (typeof loadProducts === 'function') loadProducts();

    } catch (error) {
        console.error('Detailed Auth Error:', error);
        // Temporarily comment out the line below to stop the "Swift" redirect 
        // window.location.href = 'admin-login.html'; 
    }
}