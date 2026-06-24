const express = require("express");
const router = express.Router();

const {
  getAllGalleryImages,
  deleteGalleryImage,
} = require("../controllers/galleryController");

// Get all gallery images
router.get("/api/gallery", getAllGalleryImages);

// Delete a gallery image
router.delete("/api/gallery/:id", deleteGalleryImage);

module.exports = router;
