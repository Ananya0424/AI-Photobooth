const styleTemplates = {
  // ===== Male Templates =====
  male_avenger: {
    id: "male_avenger",
    name: "Avenger",
    backgroundName: "Battlefield",
    gender: "male",
    prompt: "Transform the user into a cinematic superhero with advanced armor. Action-packed destroyed city background, dramatic lighting, 8k.",
    previewImage: "/assets/templates/male_avenger.jpg",
  },
  male_astronaut: {
    id: "male_astronaut",
    name: "Astronaut",
    backgroundName: "Space",
    gender: "male",
    prompt: "Transform the user into a realistic astronaut wearing a modern space suit. Cinematic space lighting, 8k.",
    previewImage: "/assets/templates/male_astronaut.jpg",
  },
  male_king: {
    id: "male_king",
    name: "King",
    backgroundName: "Royal Court",
    gender: "male",
    prompt: "Transform the user into a majestic king wearing an ornate crown and luxurious royal robes. Grand golden palace background, regal lighting, 8k.",
    previewImage: "/assets/templates/male_king.jpg",
  },

  // ===== Female Templates =====
  female_avenger: {
    id: "female_avenger",
    name: "Avenger",
    backgroundName: "Battlefield",
    gender: "female",
    prompt: "Transform the user into an Avengers-inspired female superhero with cinematic armor and glowing elements. Action-packed background, dramatic lighting, 8k.",
    previewImage: "/assets/templates/female_avenger.jpg",
  },
  female_astronaut: {
    id: "female_astronaut",
    name: "Astronaut",
    backgroundName: "Space",
    gender: "female",
    prompt: "Transform the user into a realistic female astronaut wearing a detailed modern space suit. Cinematic space lighting, 8k.",
    previewImage: "/assets/templates/female_astronaut.jpg",
  },
  female_queen: {
    id: "female_queen",
    name: "Queen",
    backgroundName: "Royal Court",
    gender: "female",
    prompt: "Transform the user into an elegant queen wearing a beautiful jeweled crown and a majestic royal gown. Grand golden palace background, elegant lighting, 8k.",
    previewImage: "/assets/templates/female_queen.jpg",
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
