const { v4: uuidv4 } = require("uuid");
const Session = require("../models/Session");
const GalleryImage = require("../models/GalleryImage");
const AppSettings = require("../models/AppSettings");
const { uploadImage, uploadImageFromUrl } = require("../services/cloudinaryService");
const { generateFaceSwap, isMockMode } = require("../services/aiService");
const { generateQRCode } = require("../utils/qrCodeGenerator");
const { getTemplatesByGender, getTemplateById } = require("../utils/stylePrompts");
const { enhancePrompt } = require("../services/openaiService");
const { sendPortraitEmail } = require("../services/nodemailerService");

/**
 * Create a new photobooth session
 * POST /api/sessions
 * Body: { userName: string }
 */
const createSession = async (req, res) => {
  try {
    const { userName, email, phone } = req.body;

    if (!userName || !userName.trim()) {
      return res.status(400).json({
        success: false,
        error: "userName is required",
      });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Validate phone has at least 10 digits if provided
    if (phone && phone.replace(/\D/g, "").length < 10) {
      return res.status(400).json({
        success: false,
        error: "Phone number must have at least 10 digits",
      });
    }

    const sessionId = uuidv4();

    const session = new Session({
      sessionId,
      userName: userName.trim(),
      email: email || null,
      phone: phone || null,
      status: "started",
    });

    await session.save();

    console.log(`[Session] Created new session: ${sessionId} for user: ${userName}, email: ${email || "N/A"}`);

    return res.status(201).json({
      success: true,
      sessionId: session.sessionId,
      userName: session.userName,
      status: session.status,
    });
  } catch (error) {
    console.error("[Session] Error creating session:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create session",
      details: error.message,
    });
  }
};

/**
 * Update session with gender selection
 * PATCH /api/sessions/:sessionId/gender
 * Body: { gender: "male" | "female" }
 */
const updateGender = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { gender } = req.body;

    if (!gender || !["male", "female"].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: 'gender must be "male" or "female"',
      });
    }

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    session.gender = gender;
    session.formAnswers = { ...session.formAnswers, gender: gender };
    session.status = "gender_selected";

    // Clear previous template selection when gender changes
    session.selectedTemplate = { id: null, name: null, imageUrl: null };

    await session.save();

    console.log(`[Session] ${sessionId} - Gender set to: ${gender}`);

    return res.json({
      success: true,
      sessionId: session.sessionId,
      gender: session.gender,
      status: session.status,
    });
  } catch (error) {
    console.error("[Session] Error updating gender:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to update gender",
      details: error.message,
    });
  }
};

/**
 * Update session with selected template
 * PATCH /api/sessions/:sessionId/template
 * Body: { templateId: string }
 */
const updateTemplate = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: "templateId is required",
      });
    }

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    if (!session.gender) {
      return res.status(400).json({
        success: false,
        error: "Gender must be selected before choosing a template",
      });
    }

    const template = getTemplateById(templateId);

    if (!template) {
      return res.status(400).json({
        success: false,
        error: "Invalid template ID",
      });
    }

    // Ensure template matches selected gender
    if (template.gender !== session.gender) {
      return res.status(400).json({
        success: false,
        error: `Template "${template.name}" is not available for gender "${session.gender}"`,
      });
    }

    session.selectedTemplate = {
      id: template.id,
      name: template.name,
      imageUrl: template.previewImage,
    };
    session.formAnswers = { ...session.formAnswers, templateId: template.id, templateName: template.name };
    session.status = "template_selected";

    await session.save();

    console.log(`[Backend LOG] template selected: ${template.id} for session: ${sessionId}`);
    console.log(`[Session] ${sessionId} - Template set to: ${template.name}`);

    return res.json({
      success: true,
      sessionId: session.sessionId,
      selectedTemplate: session.selectedTemplate,
      status: session.status,
    });
  } catch (error) {
    console.error("[Session] Error updating template:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to update template",
      details: error.message,
    });
  }
};

/**
 * Capture user image and trigger AI generation
 * POST /api/sessions/:sessionId/capture
 * Body: { image: string (base64) }
 */
const captureImage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { image } = req.body;

    console.log(`[Backend LOG] image uploaded for session: ${sessionId}, base64 length: ${image ? image.length : 0}`);

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "image (base64 string) is required",
      });
    }

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    if (!session.selectedTemplate || !session.selectedTemplate.id) {
      return res.status(400).json({
        success: false,
        error: "A template must be selected before capturing an image",
      });
    }

    // Step 1: Upload the raw webcam image to Cloudinary
    console.log(`[Session] ${sessionId} - Uploading captured image to Cloudinary...`);
    session.status = "captured";
    await session.save();

    let rawImageUrl;
    try {
      rawImageUrl = await uploadImage(image);
    } catch (uploadError) {
      // If Cloudinary upload fails (e.g., no credentials), use a placeholder in mock mode
      if (isMockMode()) {
        console.warn("[Session] Cloudinary upload failed in mock mode, using data URI as fallback");
        rawImageUrl = image.startsWith("data:") ? image : `data:image/png;base64,${image}`;
      } else {
        throw uploadError;
      }
    }

    session.rawUserImageUrl = rawImageUrl;
    session.status = "generating";
    await session.save();

    console.log(`[Session] ${sessionId} - Image uploaded: ${rawImageUrl.substring(0, 80)}...`);

    // Step 2: Respond immediately - generation happens in the background
    res.json({
      success: true,
      sessionId: session.sessionId,
      rawImageUrl: session.rawUserImageUrl,
      status: session.status,
      message: "Image captured. AI generation started in background.",
    });

    // Step 3: Trigger AI face-swap generation in the background
    const template = getTemplateById(session.selectedTemplate.id);
    const prompt = template ? template.prompt : "";
    const targetTemplateUrl = session.selectedTemplate.imageUrl || "";

    // Fetch the currently selected AI model from app settings
    const modelSetting = await AppSettings.findOne({ key: "selectedModel" });
    const selectedModel = modelSetting ? modelSetting.value : "gpt-image-2";
    session.selectedModel = selectedModel;

    // Enhance prompt using the selected OpenAI model (if API key is present)
    let finalPrompt = prompt;
    try {
      finalPrompt = await enhancePrompt(selectedModel, prompt, session.userName, session.gender);
    } catch (err) {
      console.error("[Session] Failed to enhance prompt, using base:", err.message);
    }
    session.generatedPrompt = finalPrompt;

    console.log(`[Backend LOG] generation request sent for session: ${sessionId} using model: ${selectedModel}`);
    console.log(`[Session] ${sessionId} - Starting AI generation with model: ${selectedModel}...`);

    const genStart = Date.now();

    try {
      // NOTE: generateFaceSwap resolves to an OBJECT — { imageUrl, enhancement } —
      // not a plain URL string. Destructure it here rather than treating the
      // whole return value as a string.
      const faceSwapResult = await generateFaceSwap(
        rawImageUrl,
        targetTemplateUrl,
        finalPrompt,
        selectedModel
      );

      const generatedUrl = faceSwapResult?.imageUrl;

      // Debug logs to catch any future shape mismatches early
      console.log("generatedUrl =", generatedUrl);
      console.log("typeof generatedUrl =", typeof generatedUrl);

      if (typeof generatedUrl !== "string" || !generatedUrl) {
        throw new Error(
          `generateFaceSwap returned an invalid imageUrl (got ${typeof generatedUrl}): ${JSON.stringify(faceSwapResult)}`
        );
      }

      // If the generated URL is different from source and not a data URI, upload to Cloudinary
      let finalUrl = generatedUrl;
      if (
        generatedUrl !== rawImageUrl &&
        generatedUrl.startsWith("http") &&
        !isMockMode()
      ) {
        try {
          finalUrl = await uploadImageFromUrl(generatedUrl);
        } catch (cloudinaryError) {
          console.warn("[Session] Could not re-upload generated image to Cloudinary:", cloudinaryError.message);
          finalUrl = generatedUrl;
        }
      }

      session.generatedImageUrl = finalUrl;
      session.generationTimestamp = new Date();
      session.generationDuration = Date.now() - genStart;
      session.status = "completed";
      await session.save();

      // Auto-save to gallery
      try {
        await GalleryImage.create({
          imageUrl: finalUrl,
          userName: session.userName,
          sessionId: session.sessionId,
          templateName: session.selectedTemplate?.name || null,
          gender: session.gender,
        });
        console.log(`[Gallery] Auto-saved image for session: ${sessionId}`);
      } catch (galleryErr) {
        console.error(`[Gallery] Failed to auto-save image:`, galleryErr.message);
      }

      console.log(`[Backend LOG] generation response received for session: ${sessionId}, url: ${finalUrl}`);
      console.log(`[Session] ${sessionId} - AI generation completed in ${session.generationDuration}ms: ${finalUrl.substring(0, 80)}...`);
    } catch (aiError) {
      console.error(`[Session] ${sessionId} - AI generation failed:`, aiError.message);
      session.status = "failed";
      session.errorMessage = aiError.message;
      await session.save();
    }
  } catch (error) {
    console.error("[Session] Error capturing image:", error.message);

    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to capture image",
        details: error.message,
      });
    }
  }
};

/**
 * Get session status and generated image URL
 * GET /api/sessions/:sessionId/status
 */
const getStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    return res.json({
      success: true,
      sessionId: session.sessionId,
      userName: session.userName,
      gender: session.gender,
      selectedTemplate: session.selectedTemplate,
      rawUserImageUrl: session.rawUserImageUrl,
      generatedImageUrl: session.generatedImageUrl,
      status: session.status,
      error: session.errorMessage,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.error("[Session] Error getting status:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to get session status",
      details: error.message,
    });
  }
};

/**
 * Generate QR code for the generated image URL
 * GET /api/sessions/:sessionId/qr
 */
const generateQR = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    if (!session.generatedImageUrl) {
      return res.status(400).json({
        success: false,
        error: "No generated image available yet. Please wait for AI generation to complete.",
        status: session.status,
      });
    }

    const qrCodeDataUrl = await generateQRCode(session.generatedImageUrl);

    console.log(`[Session] ${sessionId} - QR code generated for image URL`);

    return res.json({
      success: true,
      sessionId: session.sessionId,
      qrCode: qrCodeDataUrl,
      imageUrl: session.generatedImageUrl,
    });
  } catch (error) {
    console.error("[Session] Error generating QR code:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate QR code",
      details: error.message,
    });
  }
};

/**
 * Get available templates filtered by gender
 * GET /api/templates/:gender
 */
const getTemplates = async (req, res) => {
  try {
    const { gender } = req.params;

    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: 'gender must be "male" or "female"',
      });
    }

    const templates = getTemplatesByGender(gender);

    console.log(`[Templates] Returning ${templates.length} templates for gender: ${gender}`);

    return res.json({
      success: true,
      gender,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error("[Templates] Error getting templates:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to get templates",
      details: error.message,
    });
  }
};

/**
 * Share generated image via email
 * POST /api/sessions/:sessionId/share
 */
const shareImage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    if (!session.generatedImageUrl) return res.status(400).json({ success: false, error: 'No generated image available yet' });
    if (!session.email) return res.status(400).json({ success: false, error: 'No email address on file' });

    const emailResult = await sendPortraitEmail(session.email, session.userName, session.generatedImageUrl);

    if (!emailResult.success) {
      console.error(`[Session] ${sessionId} - Failed to share portrait: ${emailResult.error}`);
      return res.status(500).json({ success: false, error: emailResult.error || 'Failed to send email' });
    }

    console.log(`[Session] ${sessionId} - Portrait shared to ${session.email}`);
    return res.json({ success: true, message: 'Portrait sent to your email!' });
  } catch (error) {
    console.error('[Session] Error sharing image:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to send email', details: error.message });
  }
};

module.exports = {
  createSession,
  updateGender,
  updateTemplate,
  captureImage,
  getStatus,
  generateQR,
  getTemplates,
  shareImage,
};