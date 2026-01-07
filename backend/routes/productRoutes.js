const express = require("express");
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