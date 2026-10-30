
const faceForm = document.getElementById("faceAnalysisForm");
const photoInput = document.getElementById("facePhoto");
const photoPreview = document.getElementById("photoPreview");
const previewImage = document.getElementById("previewImage");
const photoMessage = document.getElementById("photoMessage");
const analyzeButton = document.getElementById("analyzeButton");
const recommendationsSection = document.getElementById("recommendationsSection");
const faceShapeResult = document.getElementById("faceShapeResult");
const hairstyleRecommendation = document.getElementById("hairstyleRecommendation");
const beardRecommendation = document.getElementById("beardRecommendation");
const skincareRecommendation = document.getElementById("skincareRecommendation");


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

let previewUrl = null;
const apiBase = window.TAYORA_CONFIG?.apiBaseUrl || "http://127.0.0.1:8000/api";

function clearPreview() {
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }

    previewImage.removeAttribute("src");
    photoPreview.hidden = true;
}

function showMessage(message) {
    photoMessage.textContent = message;
}

photoInput.addEventListener("change", () => {
    clearPreview();
    recommendationsSection.hidden = true;

    const file = photoInput.files[0];

    if (!file) {
        showMessage("Choose a photo to see its preview.");
        return;
    }

    if (!allowedTypes.includes(file.type)) {
        photoInput.value = "";
        showMessage("Please choose a JPG, PNG, or WebP image.");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        photoInput.value = "";
        showMessage("Please choose an image under 5 MB.");
        return;
    }

    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    photoPreview.hidden = false;

    showMessage("Photo selected. Check the preview before continuing.");
});

faceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = photoInput.files[0];

    if (!file || !allowedTypes.includes(file.type) ||
        file.size > MAX_FILE_SIZE) {
        showMessage("Please select a valid image under 5 MB first.");
        return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    analyzeButton.disabled = true;
    recommendationsSection.hidden = true;
    showMessage("Uploading your photo for validation...");

    try {
        const response = await fetch(
            `${apiBase}/face-shape/analyze`,
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Photo upload failed.");
        }

        
if (!result.face_detected) {
    showMessage(
        result.message || "No face detected. Please try another photo."
    );
    return;
}


const displayFaceShape = result.estimated_face_shape
    .split(" ")
    .map((word, index, words) => word.toLowerCase() === "or" && index > 0
        ? word
        : words[index - 1]?.toLowerCase() === "or"
            ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
showMessage(
    "Analysis complete. Estimated face shape: " +
    displayFaceShape +
    ". This preliminary estimate may be inaccurate."
);

let savedProfile = {};
let skinProfile = {};
let hairProfile = {};
try {
    savedProfile = JSON.parse(localStorage.getItem("tayoraProfile") || "{}") || {};
    skinProfile = JSON.parse(localStorage.getItem("tayoraSkinProfile") || "{}") || {};
    hairProfile = JSON.parse(localStorage.getItem("tayoraHairProfile") || "{}") || {};
} catch {
    // Keep analysis available if older local preferences are malformed.
}

savedProfile.faceShape = displayFaceShape;
const savedBudget = savedProfile.monthlyBudget ?? savedProfile.budget ?? skinProfile.skinBudget ?? hairProfile.hairBudget;
const budget = savedBudget == null || String(savedBudget).trim() === ""
    ? null
    : Number(savedBudget);
try {
    localStorage.setItem("tayoraProfile", JSON.stringify(savedProfile));
} catch {
    // Recommendations can still be shown when browser storage is unavailable.
}

const recommendationResponse = await fetch(
    `${apiBase}/recommendations/`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            skin_type: skinProfile.skinType || savedProfile.skinType || savedProfile.skin || null,
            hair_type: hairProfile.hairType || savedProfile.hairType || savedProfile.hair || null,
            budget: Number.isFinite(budget) ? budget : null,
            face_shape: result.estimated_face_shape
        })
    }
);

const recommendationData = await recommendationResponse.json();

if (!recommendationResponse.ok) {
    throw new Error(
        recommendationData.detail ||
        "Could not load grooming recommendations."
    );
}

const recommendations = recommendationData.recommendations;

const hairstyle = recommendations.find(
    item => item.category === "hairstyle"
);
const beard = recommendations.find(
    item => item.category === "beard"
);
const skincare = recommendations.find(
    item => item.category === "skin_care"
);

faceShapeResult.textContent =
    "Your estimated face shape: " + displayFaceShape;

hairstyleRecommendation.textContent =
    hairstyle ? hairstyle.description : "No hairstyle suggestion available.";

beardRecommendation.textContent =
    beard ? beard.description : "No beard suggestion available.";

skincareRecommendation.textContent =
    skincare ? skincare.description : "No skincare suggestion available.";

recommendationsSection.hidden = false;


    } catch (error) {
        showMessage(
            "Could not contact the TAYORA backend. Make sure the server " +
            "is running. Details: " + error.message
        );
    } finally {
        analyzeButton.disabled = false;
    }
});
