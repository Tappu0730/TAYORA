
const skinForm = document.getElementById("skinForm");
const results = document.getElementById("results");

if (skinForm && results) {
    skinForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const skinType = document.getElementById("skinType").value;
        const concern = document.getElementById("concerns").value;
        const budget = Number(document.getElementById("budget").value);

        
        // Save the user's skincare profile
        const skinProfile = {
            skinType: skinType,
            skinConcern: concern,
            skinBudget: budget
        };

        localStorage.setItem(
            "tayoraSkinProfile",
            JSON.stringify(skinProfile)
        );

        try {
            const profile = JSON.parse(localStorage.getItem("tayoraProfile") || "{}") || {};
            profile.skinType = skinType.charAt(0).toUpperCase() + skinType.slice(1);
            localStorage.setItem("tayoraProfile", JSON.stringify(profile));
        } catch {
            // The assessment result can still be shown if browser storage is unavailable.
        }


        let suggestions = [];

        // Suggestions based on skin type
        if (skinType === "oily") {
            suggestions.push("Choose a gentle, non-comedogenic cleanser.");
            suggestions.push("Consider a lightweight, oil-free moisturizer.");
        } else if (skinType === "dry") {
            suggestions.push("Choose a gentle cleanser that does not leave skin feeling tight.");
            suggestions.push("Consider a moisturizer containing ingredients such as glycerin or ceramides.");
        } else if (skinType === "combination") {
            suggestions.push("Use a gentle cleanser and a lightweight moisturizer.");
            suggestions.push("Adjust your routine according to how different areas of your skin feel.");
        } else if (skinType === "normal") {
            suggestions.push("Keep your routine simple with a gentle cleanser and moisturizer.");
        } else {
            suggestions.push("Start with a gentle cleanser and moisturizer, and observe how your skin responds.");
        }

        // Suggestions based on the main concern
        if (concern === "dryness") {
            suggestions.push("For dryness, consider a fragrance-free moisturizer.");
        } else if (concern === "oiliness") {
            suggestions.push("For excess oil, avoid harsh scrubbing and overly drying products.");
        } else if (concern === "sensitivity") {
            suggestions.push("Prefer fragrance-free products and patch-test new products.");
        } else if (concern === "acne") {
            suggestions.push("Choose non-comedogenic products. If acne persists or is painful, consult a dermatologist.");
        }

        suggestions.push("Use broad-spectrum sunscreen during the day.");

        let budgetMessage = "";

        if (budget < 500) {
            budgetMessage = "Keep your routine basic and prioritize a cleanser, moisturizer, and sunscreen within your budget.";
        } else if (budget <= 1500) {
            budgetMessage = "Your budget may allow for a basic cleanser, moisturizer, and sunscreen. Compare product sizes and prices.";
        } else {
            budgetMessage = "Consider prioritizing essential products first, then adding other products only if needed.";
        }

        results.innerHTML = `
            <h2>Your Skincare Suggestions</h2>
            <ul>
                ${suggestions.map(item => `<li>${item}</li>`).join("")}
            </ul>
            <p><strong>Budget tip:</strong> ${budgetMessage}</p>
            <p><small>These are general suggestions, not a medical diagnosis. Introduce new products gradually.</small></p>
        `;

        results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}
