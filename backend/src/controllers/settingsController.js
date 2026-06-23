const AppSettings = require("../models/AppSettings");

const AVAILABLE_MODELS = [
  { id: "gpt-image-2", name: "gpt-image-2", provider: "openai" },
  { id: "gpt-image-2-2026-04-21", name: "gpt-image-2-2026-04-21", provider: "openai" },
  { id: "gpt-image-1.5", name: "gpt-image-1.5", provider: "openai" },
];

/**
 * Get current app settings and available models
 * GET /api/settings
 */
const getSettings = async (req, res) => {
  try {
    const modelSetting = await AppSettings.findOne({ key: "selectedModel" });
    const selectedModel = modelSetting ? modelSetting.value : "gpt-image-2";

    return res.json({
      success: true,
      settings: { selectedModel },
      availableModels: AVAILABLE_MODELS,
    });
  } catch (error) {
    console.error("[Settings] Error getting settings:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to get settings",
      details: error.message,
    });
  }
};

/**
 * Update app settings
 * PUT /api/settings
 * Body: { selectedModel: string }
 */
const updateSettings = async (req, res) => {
  try {
    const { selectedModel } = req.body;

    if (!selectedModel || !AVAILABLE_MODELS.find((m) => m.id === selectedModel)) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing selectedModel. Must be one of: " +
          AVAILABLE_MODELS.map((m) => m.id).join(", "),
      });
    }

    await AppSettings.findOneAndUpdate(
      { key: "selectedModel" },
      { key: "selectedModel", value: selectedModel, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      settings: { selectedModel },
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("[Settings] Error updating settings:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to update settings",
      details: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
