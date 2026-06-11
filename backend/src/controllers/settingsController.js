const AppSettings = require("../models/AppSettings");

const AVAILABLE_MODELS = [
  { id: "gpt-5.5", name: "GPT-5.5", provider: "openai" },
  { id: "gpt-5", name: "GPT-5", provider: "openai" },
  { id: "gpt-4.1", name: "GPT-4.1", provider: "openai" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o-mini", provider: "openai" },
];

/**
 * Get current app settings and available models
 * GET /api/settings
 */
const getSettings = async (req, res) => {
  try {
    const modelSetting = await AppSettings.findOne({ key: "selectedModel" });
    const selectedModel = modelSetting ? modelSetting.value : "gpt-4o";

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
