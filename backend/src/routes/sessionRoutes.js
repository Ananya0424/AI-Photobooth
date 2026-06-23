const express = require("express");
const router = express.Router();

const {
  createSession,
  updateGender,
  updateTemplate,
  captureImage,
  getStatus,
  generateQR,
  getTemplates,
  shareImage,
} = require("../controllers/sessionController");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

// ===== Settings Routes =====

// Get current settings and available models
router.get("/api/settings", getSettings);

// Update settings (e.g., selected AI model)
router.put("/api/settings", updateSettings);

// ===== Session Routes =====

// Create a new session
router.post("/api/sessions", createSession);

// Update gender selection
router.patch("/api/sessions/:sessionId/gender", updateGender);

// Update template selection
router.patch("/api/sessions/:sessionId/template", updateTemplate);

// Capture image and trigger AI generation
router.post("/api/sessions/:sessionId/capture", captureImage);

// Get session status
router.get("/api/sessions/:sessionId/status", getStatus);

// Generate QR code for generated image
router.get("/api/sessions/:sessionId/qr", generateQR);

// Share generated image via email
router.post("/api/sessions/:sessionId/share", shareImage);

// ===== Template Routes =====

// Get templates filtered by gender
router.get("/api/templates/:gender", getTemplates);

module.exports = router;
