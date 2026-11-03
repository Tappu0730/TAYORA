(() => {
    const form = document.getElementById("wardrobe-form");
    const list = document.getElementById("wardrobe-list");
    const status = document.getElementById("wardrobe-status");
    const STORAGE_KEY = "tayoraWardrobe";

    const readItems = () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") || [];
        } catch {
            return [];
        }
    };

    const render = () => {
        const items = readItems();
        list.replaceChildren();
        status.textContent = items.length
            ? `${items.length} wardrobe item${items.length === 1 ? "" : "s"} saved in this browser.`
            : "No items added yet.";
        items.forEach((item) => {
            const card = document.createElement("article");
            card.className = "mini-card wardrobe-card";
            const tag = document.createElement("span");
            tag.className = "pill";
            tag.textContent = item.category.toUpperCase();
            const title = document.createElement("h3");
            title.textContent = item.name;
            const details = document.createElement("p");
            details.textContent = `${item.colour} · best for ${item.occasion}`;
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "text-button";
            remove.textContent = "Remove";
            remove.addEventListener("click", () => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter((saved) => saved.id !== item.id)));
                render();
            });
            card.append(tag, title, details, remove);
            list.appendChild(card);
        });
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const item = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: document.getElementById("itemName").value.trim(),
            category: document.getElementById("itemCategory").value,
            colour: document.getElementById("itemColour").value,
            occasion: document.getElementById("itemOccasion").value
        };
        if (!item.name) return;
        const items = readItems();
        items.unshift(item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
        form.reset();
        render();
    });

    render();
})();
