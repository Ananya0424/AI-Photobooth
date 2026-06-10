const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: null,
  },
  selectedTemplate: {
    id: { type: String, default: null },
    name: { type: String, default: null },
    imageUrl: { type: String, default: null }, // URL of target template
  },
  rawUserImageUrl: {
    type: String,
    default: null, // Cloudinary URL of webcam photo
  },
  generatedImageUrl: {
    type: String,
    default: null, // Cloudinary URL of final face-swapped output
  },
  status: {
    type: String,
    enum: ["started", "gender_selected", "template_selected", "captured", "generating", "completed", "failed"],
    default: "started",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Automatic cleanup of records after 24 hours (86400 seconds)
  },
});

module.exports = mongoose.model("Session", SessionSchema);
