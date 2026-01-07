// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors({
  // This pulls the Vercel link you just added to Render's Env Vars
  origin: process.env.FRONTEND_URL || '*', 
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/products", require("./routes/productRoutes"));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Connect database and then start server
const PORT = process.env.PORT || 10000; // Changed default to 10000 for Render

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Database connection failed", err);
});