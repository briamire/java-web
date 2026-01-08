// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
// ===== CORS CONFIG =====
const allowedOrigins = [
  "https://capridigital.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server calls or tools like Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight requests
app.options("*", cors());


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