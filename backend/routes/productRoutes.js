const express = require("express");
const router = express.Router();

// Temporary in-memory store (Mongo later)
let products = [];

// GET products
router.get("/", (req, res) => {
  res.json(products);
});

// ADD product (admin action)
router.post("/", (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const newProduct = {
    id: Date.now(),
    name,
    price
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

module.exports = router;
