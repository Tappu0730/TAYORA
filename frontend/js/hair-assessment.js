
const hairForm = document.getElementById("hairForm");
const hairResults = document.getElementById("hairResults");

if (hairForm && hairResults) {
    hairForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const hairType = document.getElementById("hairType").value;
        const scalpType = document.getElementById("scalpType").value;
        const concern = document.getElementById("hairConcern").value;
        const goal = document.getElementById("hairGoal").value;
        const budget = Number(document.getElementById("hairBudget").value);

        
        // Save the user's hair care profile
        const hairProfile = {
            hairType: hairType,
            scalpType: scalpType,
            hairConcern: concern,
            hairGoal: goal,
            hairBudget: budget
        };

        localStorage.setItem(
            "tayoraHairProfile",
            JSON.stringify(hairProfile)
        );

        try {
            const profile = JSON.parse(localStorage.getItem("tayoraProfile") || "{}") || {};
            profile.hairType = hairType.charAt(0).toUpperCase() + hairType.slice(1);
            localStorage.setItem("tayoraProfile", JSON.stringify(profile));
        } catch {
            // The assessment result can still be shown if browser storage is unavailable.
        }


        const suggestions = [];

        // Suggestions based on hair type
        if (hairType === "straight") {
            suggestions.push("Use a lightweight conditioner to avoid weighing your hair down.");
        } else if (hairType === "wavy") {
            suggestions.push("Try a lightweight leave-in conditioner to help manage waves and frizz.");
        } else if (hairType === "curly" || hairType === "coily") {
            suggestions.push("Use a moisturizing conditioner and detangle gently when your hair is damp.");
        } else {
            suggestions.push("Start with a gentle shampoo and conditioner suitable for your hair's needs.");
        }

        // Suggestions based on scalp type
        if (scalpType === "oily") {
            suggestions.push("Wash your scalp as needed with a gentle shampoo. Avoid applying heavy oils directly to it.");
        } else if (scalpType === "dry") {
            suggestions.push("Choose a gentle shampoo and avoid very hot water.");
        } else if (scalpType === "sensitive") {
            suggestions.push("Consider fragrance-free hair products and introduce new products one at a time.");
        } else if (scalpType === "normal") {
            suggestions.push("Maintain a consistent washing routine that keeps your scalp comfortable.");
        } else {
            suggestions.push("Observe how your scalp responds to products and choose gentle options.");
        }

        // Suggestions based on concern
        if (concern === "dryness") {
            suggestions.push("Consider a moisturizing conditioner and reduce excessive heat styling.");
        } else if (concern === "frizz") {
            suggestions.push("Try conditioner or a suitable leave-in product, and gently blot hair instead of rubbing it.");
        } else if (concern === "breakage") {
            suggestions.push("Detangle gently, limit high heat, and avoid tight hairstyles that pull on your hair.");
        } else if (concern === "dandruff") {
            suggestions.push("If flaking persists, ask a pharmacist or dermatologist about suitable dandruff treatments.");
        } else if (concern === "hairfall") {
            suggestions.push("Hair shedding can have many causes. If it is persistent or sudden, consult a healthcare professional.");
        }

        // Suggestions based on goal
        if (goal === "smooth") {
            suggestions.push("Use conditioner regularly and reduce friction while drying your hair.");
        } else if (goal === "volume") {
            suggestions.push("Consider lightweight conditioning products and avoid applying heavy products near the roots.");
        } else if (goal === "moisture") {
            suggestions.push("Choose a conditioner designed for your hair type and adjust use according to how your hair feels.");
        } else {
            suggestions.push("Keep your routine simple and adjust it based on how your hair and scalp respond.");
        }

        // Budget guidance
        let budgetMessage;

        if (budget < 500) {
            budgetMessage = "Prioritize a suitable shampoo and conditioner within your budget.";
        } else if (budget <= 1500) {
            budgetMessage = "You may be able to include shampoo, conditioner, and one optional care product. Compare prices before buying.";
        } else {
            budgetMessage = "Consider investing in products that address your main concern rather than buying many products at once.";
        }

        // Display results
        hairResults.innerHTML = `
            <h2>Your Hair Care Suggestions</h2>
            <ul>
                ${suggestions.map(item => `<li>${item}</li>`).join("")}
            </ul>
            <p><strong>Monthly budget tip:</strong> ${budgetMessage}</p>
            <p><small>These are general grooming suggestions, not a medical diagnosis.</small></p>
        `;

        hairResults.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}
