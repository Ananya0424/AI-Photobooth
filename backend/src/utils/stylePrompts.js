const styleTemplates = {
  // ===== Male Templates =====
  male_avenger: {
    id: "male_avenger",
    name: "Avenger",
    backgroundName: "Battlefield",
    gender: "male",
    prompt: "Transform the user into a cinematic Iron Man-style superhero wearing ultra-detailed red and gold armor with glowing arc reactor. Destroyed city battlefield background with fire and debris. Dramatic volumetric lighting, sharp facial features, hyper-detailed skin texture, ultra sharp focus, 8K, professional photography.",
    previewImage: "/assets/templates/male_avenger.jpg",
  },
  male_astronaut: {
    id: "male_astronaut",
    name: "Astronaut",
    backgroundName: "Space",
    gender: "male",
    prompt: "Transform the user into a realistic NASA astronaut wearing a highly detailed white space suit with American flag patch and NASA logo. Earth visible in the background from space station viewport. Sharp facial details, realistic skin texture, cinematic space lighting with rim light, ultra sharp focus, 8K, professional photography.",
    previewImage: "/assets/templates/male_astronaut.jpg",
  },
  male_king: {
    id: "male_king",
    name: "King",
    backgroundName: "Royal Court",
    gender: "male",
    prompt: "Transform the user into a majestic medieval king wearing an ornate golden crown with jewels and luxurious embroidered royal robes with fur trim. Seated on a grand golden throne in an opulent palace hall with chandeliers. Warm regal lighting, sharp facial features, hyper-detailed fabric textures, ultra sharp focus, 8K, professional photography.",
    previewImage: "/assets/templates/male_king.jpg",
  },

  // ===== Female Templates =====
  female_avenger: {
    id: "female_avenger",
    name: "Avenger",
    backgroundName: "Battlefield",
    gender: "female",
    prompt: "Transform the user into a powerful Captain Marvel-style female superhero wearing detailed red, blue and gold armor with glowing star emblem. Dramatic battlefield background with explosions and energy effects. Cinematic dramatic lighting, sharp facial features, detailed skin texture, flowing hair, ultra sharp focus, 8K, professional photography.",
    previewImage: "/assets/templates/female_avenger.jpg",
  },
  female_astronaut: {
    id: "female_astronaut",
    name: "Astronaut",
    backgroundName: "Space",
    gender: "female",
    prompt: "Transform the user into a realistic female NASA astronaut wearing a highly detailed white space suit with patches and badges. Space station interior with Earth visible through a large circular viewport. Sharp facial details, realistic skin, cinematic space lighting with blue rim light, ultra sharp focus, 8K, professional photography.",
    previewImage: "/assets/templates/female_astronaut.jpg",
  },
  female_queen: {
    id: "female_queen",
    name: "Queen",
    backgroundName: "Royal Court",
    gender: "female",
    prompt: "Transform the user into an elegant queen wearing a beautiful jeweled tiara crown and a stunning golden embroidered royal gown with intricate beadwork. Grand palace ballroom with crystal chandeliers and warm candlelight. Elegant lighting, sharp facial features, detailed jewelry textures, flowing hair, ultra sharp focus, 8K, professional photography.",
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
