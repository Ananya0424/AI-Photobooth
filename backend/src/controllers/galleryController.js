const GalleryImage = require("../models/GalleryImage");

/**
 * Get all gallery images
 * GET /api/gallery
 * Query: ?page=1&limit=50
 */
const getAllGalleryImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [images, total] = await Promise.all([
      GalleryImage.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GalleryImage.countDocuments(),
    ]);

    return res.json({
      success: true,
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Gallery] Error fetching images:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch gallery images",
      details: error.message,
    });
  }
};

/**
 * Delete a gallery image
 * DELETE /api/gallery/:id
 */
const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await GalleryImage.findByIdAndDelete(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    }

    console.log(`[Gallery] Deleted image: ${id}`);

    return res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("[Gallery] Error deleting image:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to delete image",
      details: error.message,
    });
  }
};

module.exports = {
  getAllGalleryImages,
  deleteGalleryImage,
};
