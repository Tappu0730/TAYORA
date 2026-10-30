(() => {
    const PROFILE_KEY = "tayoraProfile";

    const readProfile = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") || {};

            // Keep profiles created by earlier versions readable.
            return {
                ...saved,
                skinType: saved.skinType ?? saved.skin ?? "Not sure",
                hairType: saved.hairType ?? saved.hair ?? "Not sure",
                faceShape: saved.faceShape ?? saved.face ?? "Not sure",
                monthlyBudget: saved.monthlyBudget ?? saved.budget ?? "",
                clothingPreference: saved.clothingPreference ?? saved.style ?? "Casual"
            };
        } catch {
            return {};
        }
    };

    const form = document.getElementById("profile-form");
    if (!form) return;

    const fields = {
        age: document.getElementById("age"),
        gender: document.getElementById("gender"),
        skinType: document.getElementById("skin"),
        hairType: document.getElementById("hair"),
        faceShape: document.getElementById("face"),
        monthlyBudget: document.getElementById("budget"),
        concerns: document.getElementById("concerns"),
        clothingPreference: document.getElementById("style")
    };

    const savedProfile = readProfile();
    Object.entries(fields).forEach(([key, field]) => {
        if (field && savedProfile[key] != null && savedProfile[key] !== "") {
            field.value = String(savedProfile[key]);
        }
    });

    let status = document.getElementById("profile-status");
    if (!status) {
        status = document.createElement("p");
        status.id = "profile-status";
        status.className = "notice";
        status.setAttribute("role", "status");
        form.appendChild(status);
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const ageValue = fields.age?.value.trim() || "";
        const budgetValue = fields.monthlyBudget?.value.trim() || "";
        const age = ageValue === "" ? null : Number(ageValue);
        const budget = budgetValue === "" ? null : Number(budgetValue);

        if (age !== null && (!Number.isInteger(age) || age < 13 || age > 120)) {
            status.textContent = "Enter an age from 13 to 120, or leave it blank.";
            fields.age?.focus();
            return;
        }

        if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
            status.textContent = "Enter a non-negative budget, or leave it blank.";
            fields.monthlyBudget?.focus();
            return;
        }

        const profile = {
            age,
            gender: fields.gender?.value || "",
            skinType: fields.skinType?.value || "Not sure",
            hairType: fields.hairType?.value || "Not sure",
            faceShape: fields.faceShape?.value || "Not sure",
            monthlyBudget: budget,
            concerns: fields.concerns?.value.trim() || "",
            clothingPreference: fields.clothingPreference?.value || "Casual"
        };

        try {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        } catch {
            status.textContent = "This browser could not save your profile. Check its storage settings and try again.";
            return;
        }

        status.textContent = "Your profile is saved in this browser.";
        const successMessage = document.getElementById("success-message");
        if (successMessage) successMessage.hidden = false;

        const redirect = form.dataset.redirect;
        if (redirect) {
            window.location.href = redirect;
        }
    });
})();
