
 (async () => {
    const summary = document.getElementById("profile-summary");
    const notice = document.getElementById("profile-notice");

    if (!summary || !notice) return;

    const safeText = (value, fallback = "Not provided") =>
        value === undefined || value === null || String(value).trim() === ""
            ? fallback
            : String(value);

    const readProfile = (key) => {
        try {
            return JSON.parse(localStorage.getItem(key) || "null") || {};
        } catch {
            return {};
        }
    };

    const loadAccountProfile = async () => {
        if (!window.TAYORA_AUTH?.isAuthenticated()) return readProfile("tayoraProfile");
        try {
            const response = await window.TAYORA_AUTH.apiFetch("/profile/me");
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Profile unavailable");
            const remote = result.profile || {};
            const profile = {
                age: remote.age,
                gender: remote.gender,
                skinType: remote.skin_type || "Not sure",
                hairType: remote.hair_type || "Not sure",
                faceShape: remote.face_shape || "Not sure",
                monthlyBudget: remote.budget,
                concerns: remote.concerns || "",
                clothingPreference: remote.style_preferences || "Casual"
            };
            localStorage.setItem("tayoraProfile", JSON.stringify(profile));
            return profile;
        } catch {
            return readProfile("tayoraProfile");
        }
    };

    const makeItem = (label, value) => {
        const wrapper = document.createElement("div");
        wrapper.className = "field";

        const heading = document.createElement("strong");
        heading.textContent = label;

        const content = document.createElement("p");
        content.textContent = value;

        wrapper.append(heading, content);
        return wrapper;
    };

    const rawProfile = await loadAccountProfile();
    const profile = {
        ...rawProfile,
        skinType: rawProfile.skinType || rawProfile.skin || "Not sure",
        hairType: rawProfile.hairType || rawProfile.hair || "Not sure",
        faceShape: rawProfile.faceShape || rawProfile.face || "Not sure",
        monthlyBudget: rawProfile.monthlyBudget ?? rawProfile.budget ?? null,
        clothingPreference: rawProfile.clothingPreference || rawProfile.style || ""
    };
    const skin = readProfile("tayoraSkinProfile");
    const hair = readProfile("tayoraHairProfile");

    const items = [
        ["Age", safeText(profile.age)],
        ["Gender", safeText(profile.gender)],
        ["Skin type", safeText(skin.skinType || profile.skinType)],
        ["Skin concern", safeText(skin.skinConcern || profile.concerns)],
        [
            "Skincare budget",
            skin.skinBudget != null ? `₹${skin.skinBudget}` : "Not provided"
        ],
        ["Hair type", safeText(hair.hairType || profile.hairType)],
        ["Scalp type", safeText(hair.scalpType)],
        ["Hair concern", safeText(hair.hairConcern)],
        ["Hair goal", safeText(hair.hairGoal)],
        [
            "Haircare budget",
            hair.hairBudget != null ? `₹${hair.hairBudget}` : "Not provided"
        ],
        ["Face shape", safeText(profile.faceShape)],
        ["Clothing preference", safeText(profile.clothingPreference)]
    ];

    summary.replaceChildren(
        ...items.map(([label, value]) => makeItem(label, value))
    );

    const hasProfile =
        Object.keys(rawProfile).length > 0 ||
        Object.keys(skin).length > 0 ||
        Object.keys(hair).length > 0;

    notice.textContent = hasProfile
        ? "Your saved profile is loaded. Your recommendations are personalized starter suggestions."
        : "No saved profile yet. Complete your assessments to see your details here.";

    // Personalized skincare tips
    const skinTip = document.getElementById("skin-tip");

    if (skinTip) {
        const skinType = skin.skinType || profile.skinType;
        const concern = String(skin.skinConcern || profile.concerns || "").toLowerCase();

        const skinTips = {
            oily: "Try a gentle cleanser, lightweight moisturizer, and non-comedogenic sunscreen.",
            dry: "Use a gentle cleanser, a richer moisturizer, and daily sunscreen.",
            normal: "Keep your routine simple with a gentle cleanser, moisturizer, and sunscreen.",
            combination: "Use a gentle cleanser and lightweight moisturizer, adjusting your routine to different facial areas.",
            unsure: "Start with gentle skincare basics and observe how your skin responds.",
            "not sure": "Start with gentle skincare basics and observe how your skin responds.",
            sensitive: "Choose gentle, fragrance-free basics and introduce new products one at a time."
        };

        let tip = skinTips[String(skinType || "").toLowerCase()] ||
            "Complete your skin assessment to receive a more personalized tip.";

        const concernTips = {
            dryness: " For dryness, consider a fragrance-free moisturizer.",
            oiliness: " For excess oil, avoid harsh scrubbing and try a gentle cleanser.",
            sensitivity: " For sensitive skin, introduce fragrance-free products one at a time.",
            acne: " For acne concerns, use gentle products and avoid picking at blemishes."
        };

        if (concernTips[concern]) {
            tip += concernTips[concern];
        }

        skinTip.textContent = tip;
    }

    // Personalized haircare tips
    const hairTip = document.getElementById("hair-tip");

    if (hairTip) {
        const hairType = hair.hairType || profile.hairType;
        const scalpType = hair.scalpType;
        const concern = hair.hairConcern;
        const goal = hair.hairGoal;

        let tip = hairType && !["not sure", "unsure"].includes(String(hairType).toLowerCase())
            ? `For your ${hairType} hair, choose a gentle wash and conditioning routine suited to its needs.`
            : "Complete your hair assessment to receive a more personalized tip.";

        if (scalpType === "oily") {
            tip += " If your scalp is oily, wash as needed with a suitable gentle shampoo.";
        } else if (scalpType === "dry") {
            tip += " If your scalp feels dry, avoid harsh products and very hot water.";
        } else if (scalpType === "sensitive") {
            tip += " For a sensitive scalp, consider fragrance-free products.";
        }

        const hairConcernTips = {
            dryness: " Consider conditioning regularly to help with dryness.",
            frizz: " A conditioner and leave-in product may help manage frizz.",
            breakage: " Handle hair gently and limit excessive heat styling.",
            dandruff: " Consider an appropriate anti-dandruff shampoo if needed.",
            hairfall: " Avoid tight hairstyles and harsh handling; persistent hair loss deserves professional advice."
        };

        if (hairConcernTips[concern]) {
            tip += hairConcernTips[concern];
        }

        const goalTips = {
            healthy: " Focus on a consistent, gentle routine.",
            smooth: " A conditioner may help improve smoothness.",
            volume: " Lightweight styling products may help add volume.",
            moisture: " Look for conditioning products that suit your hair."
        };

        if (goalTips[goal]) {
            tip += goalTips[goal];
        }

        hairTip.textContent = tip;
    }

    // Style recommendation
    const styleTip = document.getElementById("style-tip");

    if (styleTip) {
        styleTip.textContent = profile.clothingPreference
            ? `Your clothing preference is ${profile.clothingPreference}. Explore outfits that match your taste, comfort, and occasion.`
            : "Save your clothing preference in your profile to get more relevant outfit inspiration.";
    }

    // Face shape and hairstyle recommendation
    const faceTip = document.getElementById("face-tip");

    if (faceTip) {
        const faceShapeKnown = profile.faceShape && !["not sure", "unsure"].includes(String(profile.faceShape).toLowerCase());
        faceTip.textContent = faceShapeKnown
            ? `Your selected face shape is ${profile.faceShape}. Explore different hairstyles, keeping your hair texture and personal taste in mind.`
            : "Save your face shape in your profile to explore more relevant hairstyle ideas.";
    }

    const recommendationStatus = document.getElementById("recommendation-status");
    const recommendationList = document.getElementById("recommendation-list");

    const showRecommendations = (recommendations) => {
        if (!recommendationList) return;
        recommendationList.replaceChildren();

        recommendations.forEach((recommendation) => {
            const card = document.createElement("article");
            card.className = "mini-card";

            const category = document.createElement("span");
            category.className = "pill";
            category.textContent = String(recommendation.category || "TIP").replaceAll("_", " ").toUpperCase();

            const title = document.createElement("h3");
            title.textContent = recommendation.title || "A suggestion for you";

            const description = document.createElement("p");
            description.textContent = recommendation.description || "Explore this idea at your own pace.";

            card.append(category, title, description);
            recommendationList.appendChild(card);
        });
    };

    const loadRecommendations = async () => {
        if (!recommendationStatus || !recommendationList) return;

        const toOptionalNumber = (value) =>
            value == null || String(value).trim() === "" ? null : Number(value);
        const skinBudget = toOptionalNumber(skin.skinBudget);
        const hairBudget = toOptionalNumber(hair.hairBudget);
        const profileBudget = toOptionalNumber(profile.monthlyBudget);
        const budget = profileBudget ?? skinBudget ?? hairBudget;

        const requestProfile = {
            skin_type: skin.skinType || profile.skinType,
            hair_type: hair.hairType || profile.hairType,
            face_shape: profile.faceShape,
            concerns: profile.concerns || null,
            style_preferences: profile.clothingPreference || null,
            budget: Number.isFinite(budget) ? budget : null
        };

        try {
            const apiBase = window.TAYORA_CONFIG?.apiBaseUrl || "http://127.0.0.1:8000/api";
            const response = await fetch(`${apiBase}/recommendations/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestProfile)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Recommendations could not be loaded.");

            showRecommendations(result.recommendations || []);
            recommendationStatus.textContent = "These rule-based ideas are a starting point. Choose what feels right for you.";
        } catch {
            recommendationStatus.textContent = "Start the TAYORA API to load personalized starter ideas. Your saved profile and assessments are still available here.";
        }
    };

    loadRecommendations();
})();
