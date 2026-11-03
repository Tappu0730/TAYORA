
const productList = document.getElementById("productList");
const categoryFilter = document.getElementById("category");
const budgetFilter = document.getElementById("budget");
const profileMessage = document.getElementById("profileMessage");
const recommendationHeading = document.createElement("h2");
recommendationHeading.id = "recommendationHeading";
recommendationHeading.textContent = "Recommended for you";

productList.before(recommendationHeading);

function readSavedProfile(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || {};
    } catch {
        return {};
    }
}

const savedProfile = readSavedProfile("tayoraProfile");
const savedSkinProfile = readSavedProfile("tayoraSkinProfile");
const savedHairProfile = readSavedProfile("tayoraHairProfile");
const skinProfile = {
    ...savedSkinProfile,
    skinType: savedSkinProfile.skinType || savedProfile.skinType || savedProfile.skin || "unsure",
    skinConcern: savedSkinProfile.skinConcern || savedProfile.concerns || "none"
};
const hairProfile = {
    ...savedHairProfile,
    hairType: savedHairProfile.hairType || savedProfile.hairType || savedProfile.hair || "unsure"
};


const products = [
    
{
    name: "Simple Kind to Skin Refreshing Facial Wash",
    category: "skin",
    price: 299,
    concerns: ["acne", "oiliness", "sensitivity", "dryness"],
    skinTypes: ["oily", "dry", "normal", "combination", "unsure"],
    description: "A soap-free facial cleanser listed by Simple's official Indian store. Check the ingredients and product label to make sure it suits your skin.",
    retailer: "Simple Skincare India",
    productUrl: "https://www.simpleskincare.in/products/simple-kind-to-skin-refreshing-facial-wash-100-ml"
},

    {
        name: "Lightweight facial moisturiser",
        category: "skin",
        price: 300,
        concerns: ["oiliness", "acne", "sensitivity"],
        skinTypes: ["oily", "combination", "normal"],
        description: "Consider a lightweight, non-comedogenic moisturiser if it suits your skin.",
        productUrl: "https://www.amazon.in/s?k=lightweight+non+comedogenic+facial+moisturiser",
        linkLabel: "Search options →"
    },
    {
        name: "Moisturising face cream",
        category: "skin",
        price: 350,
        concerns: ["dryness", "sensitivity"],
        skinTypes: ["dry", "normal"],
        description: "Explore a moisturiser that helps support the skin barrier.",
        productUrl: "https://www.amazon.in/s?k=moisturising+face+cream+for+dry+skin",
        linkLabel: "Search options →"
    },
    {
        name: "Broad-spectrum sunscreen",
        category: "skin",
        price: 400,
        concerns: ["all"],
        skinTypes: ["oily", "dry", "normal", "combination", "unsure"],
        description: "Look for broad-spectrum SPF 30 or higher that feels comfortable on your skin.",
        productUrl: "https://www.amazon.in/s?k=broad+spectrum+sunscreen+spf+30",
        linkLabel: "Search options →"
    },
    {
        name: "Gentle everyday shampoo",
        category: "hair",
        price: 250,
        concerns: ["oiliness", "breakage", "none"],
        scalpTypes: ["oily", "normal", "unsure"],
        hairTypes: ["straight", "wavy", "curly", "coily", "unsure"],
        goals: ["healthy", "volume"],
        description: "Choose a shampoo suited to your scalp and hair-washing routine.",
        productUrl: "https://www.amazon.in/s?k=gentle+everyday+shampoo",
        linkLabel: "Search options →"
    },
    {
        name: "Conditioner for dry hair",
        category: "hair",
        price: 350,
        concerns: ["dryness", "frizz", "breakage"],
        scalpTypes: ["dry", "normal", "sensitive", "unsure"],
        hairTypes: ["wavy", "curly", "coily", "straight", "unsure"],
        goals: ["healthy", "smooth", "moisture"],
        description: "A conditioner may help soften hair and reduce friction. Apply mainly to the lengths and ends.",
        productUrl: "https://www.amazon.in/s?k=conditioner+for+dry+hair",
        linkLabel: "Search options →"
    },
    {
        name: "Leave-in hair conditioner",
        category: "hair",
        price: 450,
        concerns: ["frizz", "dryness"],
        scalpTypes: ["dry", "normal", "sensitive", "unsure"],
        hairTypes: ["wavy", "curly", "coily", "straight", "unsure"],
        goals: ["smooth", "moisture"],
        description: "Consider a leave-in conditioner for extra softness and manageability.",
        productUrl: "https://www.amazon.in/s?k=leave+in+conditioner+for+hair",
        linkLabel: "Search options →"
    },
    {
        name: "Anti-dandruff shampoo",
        category: "hair",
        price: 300,
        concerns: ["dandruff"],
        scalpTypes: ["oily", "dry", "normal", "sensitive", "unsure"],
        hairTypes: ["straight", "wavy", "curly", "coily", "unsure"],
        goals: ["healthy"],
        description: "If you have persistent dandruff, look for an appropriate anti-dandruff active ingredient and follow its label directions.",
        productUrl: "https://www.amazon.in/s?k=anti+dandruff+shampoo",
        linkLabel: "Search options →"
    }
];



function getRecommendations() {
    const selectedCategory = categoryFilter.value;
    const maximumBudget = budgetFilter.value;

    const heading = document.getElementById("recommendationHeading");

    if (selectedCategory === "skin") {
        heading.textContent = "Recommended for your skin";
    } else if (selectedCategory === "hair") {
        heading.textContent = "Recommended for your hair";
    } else {
        heading.textContent = "Recommended for you";
    }

    const skinTypeValue = (skinProfile.skinType || "unsure").toLowerCase();
    const skinType = skinTypeValue === "not sure" ? "unsure" : skinTypeValue;
    const skinConcern = (skinProfile.skinConcern || "none").toLowerCase();

    const hairTypeValue = (hairProfile.hairType || "unsure").toLowerCase();
    const hairType = hairTypeValue === "not sure" ? "unsure" : hairTypeValue;
    const scalpType = (hairProfile.scalpType || "unsure").toLowerCase();
    const hairConcern = (hairProfile.hairConcern || "none").toLowerCase();
    const hairGoal = (hairProfile.hairGoal || "healthy").toLowerCase();

    const filteredProducts = products
        .filter(product => {
            const matchesCategory =
                selectedCategory === "all" ||
                product.category === selectedCategory;

            const matchesBudget =
                maximumBudget === "all" ||
                product.price <= Number(maximumBudget);

            return matchesCategory && matchesBudget;
        })
        .map(product => {
            let score = 0;
            const reasons = [];

            if (product.category === "skin") {
                if (product.skinTypes?.includes(skinType)) {
                    score += 2;
                    reasons.push("suits your selected skin type");
                }

                if (product.concerns?.includes(skinConcern)) {
                    score += 3;
                    if (skinConcern !== "none") {
                        reasons.push("matches your skin concern");
                    }
                }

                if (product.concerns?.includes("all")) {
                    score += 1;
                }
            }

            if (product.category === "hair") {
                if (product.hairTypes?.includes(hairType)) {
                    score += 1;
                    reasons.push("fits your selected hair type");
                }

                if (product.scalpTypes?.includes(scalpType)) {
                    score += 1;
                    reasons.push("considers your scalp type");
                }

                if (product.concerns?.includes(hairConcern)) {
                    score += 3;
                    if (hairConcern !== "none") {
                        reasons.push("matches your hair concern");
                    }
                }

                if (product.goals?.includes(hairGoal)) {
                    score += 2;
                    reasons.push("supports your selected hair goal");
                }
            }

            return {
                ...product,
                score,
                reason: reasons.length
                    ? "Suggested because it " + reasons.join(" and ") + "."
                    : "A general product type to explore."
            };
        })
        .sort((a, b) => b.score - a.score);

    productList.innerHTML = "";

    if (filteredProducts.length === 0) {
        productList.textContent =
            "No suggestions match these filters. Try a higher budget.";
        return;
    }

    filteredProducts.forEach(product => {
        
const card = document.createElement("article");
card.className = "panel";

if (product === filteredProducts[0]) {
    const bestMatchBadge = document.createElement("span");
    bestMatchBadge.className = "best-match-badge";
    bestMatchBadge.textContent = "BEST MATCH";
    card.appendChild(bestMatchBadge);
}


        const badge = document.createElement("span");
        badge.className = "product-category-badge";
        badge.textContent =
            product.category === "skin" ? "SKIN CARE" : "HAIR CARE";

        const title = document.createElement("h3");
        title.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = "Illustrative budget: up to ₹" + product.price;

        const description = document.createElement("p");
        description.textContent = product.description;

        const recommendation = document.createElement("p");
        recommendation.textContent = product.reason;

        card.append(
            badge,
            title,
            price,
            description,
            recommendation
        );

        if (product.productUrl) {
            const productLink = document.createElement("a");
            productLink.href = product.productUrl;
            productLink.textContent = product.linkLabel || "View product →";
            productLink.target = "_blank";
            productLink.rel = "noopener noreferrer";
            productLink.className = "product-link";
            card.appendChild(productLink);
        }

        productList.appendChild(card);
    });
}


if (
    savedProfile.skinType || savedProfile.skin ||
    savedProfile.hairType || savedProfile.hair ||
    savedSkinProfile.skinType || savedHairProfile.hairType
) {
    profileMessage.textContent =
        "Your saved grooming preferences are available. Suggestions may reflect your selected concerns.";
} else {
    profileMessage.textContent =
        "No saved skin or hair profile found yet. Complete the Skin care or Hair care assessment for more tailored suggestions.";
}

categoryFilter.addEventListener("change", getRecommendations);
budgetFilter.addEventListener("change", getRecommendations);

getRecommendations();
