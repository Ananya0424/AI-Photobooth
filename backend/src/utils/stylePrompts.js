const styleTemplates = {
  // ===== Male Templates =====
  formal_suit: {
    id: "formal_suit",
    name: "Formal Suit",
    backgroundName: "Corporate Background",
    gender: "male",
    prompt:
      "A professional man wearing a perfectly tailored formal black suit with a crisp white shirt and silk tie, standing confidently in a modern corporate office with glass windows overlooking a city skyline, studio lighting, photorealistic, 8k quality",
    previewImage: "/assets/templates/formal_suit.jpg",
  },
  kurta_pajama: {
    id: "kurta_pajama",
    name: "Traditional Kurta Pajama",
    backgroundName: "Indian Heritage Background",
    gender: "male",
    prompt:
      "A man wearing an elegant traditional white and gold embroidered kurta pajama, standing in front of a beautiful Indian heritage monument with intricate Mughal architecture, warm golden lighting, photorealistic, 8k quality",
    previewImage: "/assets/templates/kurta_pajama.jpg",
  },
  sherwani: {
    id: "sherwani",
    name: "Sherwani",
    backgroundName: "Palace Background",
    gender: "male",
    prompt:
      "A man wearing a royal deep maroon sherwani with gold zari embroidery and a matching turban, standing in a grand Indian palace with ornate pillars and chandeliers, regal lighting, photorealistic, 8k quality",
    previewImage: "/assets/templates/sherwani.jpg",
  },

  // ===== Female Templates =====
  saree: {
    id: "saree",
    name: "Saree",
    backgroundName: "Temple Background",
    gender: "female",
    prompt:
      "A woman wearing a stunning red and gold silk saree with intricate zari border and traditional jewelry, standing gracefully in front of a grand ancient Indian temple with carved stone pillars, warm natural lighting, photorealistic, 8k quality",
    previewImage: "/assets/templates/saree.jpg",
  },
  salwar_suit: {
    id: "salwar_suit",
    name: "Salwar Suit",
    backgroundName: "Garden Background",
    gender: "female",
    prompt:
      "A beautiful woman wearing an elegant traditional Indian salwar suit with intricate embroidery and a graceful dupatta, standing in a lush palace garden with blooming flowers, warm golden hour lighting, photorealistic, 8k quality",
    previewImage: "/assets/templates/salwar_suit.jpg",
  },
  formal_women: {
    id: "formal_women",
    name: "Formal Suit & Glasses",
    backgroundName: "Modern Corporate Corridor",
    gender: "female",
    prompt:
      "A professional woman wearing glasses, a tailored black blazer suit, and a white button-up shirt, holding folders and notebooks, standing in front of a modern corporate glass building corridor, corporate professional look, photorealistic, 8k quality",
    previewImage: "/assets/templates/formal_women.jpg",
  },
};

/**
 * Get all templates filtered by gender
 * @param {string} gender - "male" or "female"
 * @returns {Array} Array of template objects for the given gender
 */
const getTemplatesByGender = (gender) => {
  return Object.values(styleTemplates).filter(
    (template) => template.gender === gender
  );
};

/**
 * Get a single template by its ID
 * @param {string} templateId - The template ID
 * @returns {Object|null} The template object or null
 */
const getTemplateById = (templateId) => {
  return styleTemplates[templateId] || null;
};

module.exports = {
  styleTemplates,
  getTemplatesByGender,
  getTemplateById,
};
