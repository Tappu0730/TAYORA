// Demo-only recommendation helpers. Replace with backend/API results later.
function getDemoRecommendations(profile = {}) {
  const skinType = (profile.skin_type || "normal").toLowerCase();
  const hairType = (profile.hair_type || "all").toLowerCase();
  return [
    { category: "Skin care", title: `${skinType} skin basics`, description: "Start with a gentle cleanser, moisturizer, and daytime sunscreen." },
    { category: "Hair care", title: `${hairType} hair routine`, description: "Choose a gentle wash routine and adjust based on how your scalp responds." },
    { category: "Style", title: "Build your personal style", description: "Use your preferred colors, occasions, and budget to narrow outfit ideas." }
  ];
}
