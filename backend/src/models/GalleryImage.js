const mongoose = require("mongoose");

const GalleryImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: "Anonymous",
  },
  sessionId: {
    type: String,
    default: null,
  },
  templateName: {
    type: String,
    default: null,
  },
  gender: {
    type: String,
    enum: ["male", "female", null],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GalleryImage", GalleryImageSchema);
