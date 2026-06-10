const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const sessionRoutes = require("./routes/sessionRoutes");
const { isMockMode } = require("./services/aiService");

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ===== Health Check =====
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    mockMode: isMockMode(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ===== API Routes =====
app.use(sessionRoutes);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// ===== Error Handling Middleware =====
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ===== Start Server =====
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log("");
      console.log("===================================================");
      console.log("✓ AI PhotoBooth Backend Running");
      console.log(`✓ Port: ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✓ Mock AI Mode: ${isMockMode() ? "ON (no API key)" : "OFF (using Hugging Face)"}`);
      console.log(`✓ Health: http://localhost:${PORT}/health`);
      console.log("===================================================");
      console.log("");
      console.log("API Endpoints:");
      console.log(`  POST   http://localhost:${PORT}/api/sessions`);
      console.log(`  PATCH  http://localhost:${PORT}/api/sessions/:id/gender`);
      console.log(`  PATCH  http://localhost:${PORT}/api/sessions/:id/template`);
      console.log(`  POST   http://localhost:${PORT}/api/sessions/:id/capture`);
      console.log(`  GET    http://localhost:${PORT}/api/sessions/:id/status`);
      console.log(`  GET    http://localhost:${PORT}/api/sessions/:id/qr`);
      console.log(`  GET    http://localhost:${PORT}/api/templates/:gender`);
      console.log("");
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
