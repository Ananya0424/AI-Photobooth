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
} = require("../controllers/sessionController");

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

// ===== Template Routes =====

// Get templates filtered by gender
router.get("/api/templates/:gender", getTemplates);

module.exports = router;
