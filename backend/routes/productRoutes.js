const express = require('express');
const productController = require('../controllers/productController'); // or wherever your logic is
const authMiddleware = require('../Middleware/authMiddleware');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// GET products (with optional filters)
// Examples: 
// /api/products - all products
// /api/products?condition=Ex-UK - only Ex-UK products
// /api/products?category=HP Products - only HP products
// /api/products?condition=Brand New&category=HP Laptops - filtered by both
router.get("/", getProducts);

// GET single product by ID
router.get("/:id", getProductById);

// ADD product (admin action)
router.post("/", createProduct);

// UPDATE product
router.put("/:id", updateProduct);

// DELETE product
router.delete("/:id", deleteProduct);

module.exports = router;

// backend/routes/productRoutes.js
// PUBLIC: Anyone can view products
router.get('/', productController.getProducts);

// PROTECTED: Only logged-in admins can modify data
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;