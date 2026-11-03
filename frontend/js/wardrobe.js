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

    const loadItems = async () => {
        if (!window.TAYORA_AUTH?.isAuthenticated()) return readItems();
        try {
            const response = await window.TAYORA_AUTH.apiFetch("/wardrobe");
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Wardrobe unavailable");
            return result.items || [];
        } catch {
            return readItems();
        }
    };

    const render = async () => {
        const items = await loadItems();
        list.replaceChildren();
        status.textContent = items.length
            ? `${items.length} wardrobe item${items.length === 1 ? "" : "s"} saved ${window.TAYORA_AUTH?.isAuthenticated() ? "in your account." : "in this browser."}`
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
            remove.addEventListener("click", async () => {
                if (window.TAYORA_AUTH?.isAuthenticated() && Number.isInteger(item.id)) {
                    const response = await window.TAYORA_AUTH.apiFetch(`/wardrobe/${item.id}`, { method: "DELETE" });
                    if (!response.ok) {
                        status.textContent = "Could not remove this wardrobe item.";
                        return;
                    }
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter((saved) => saved.id !== item.id)));
                render();
            });
            card.append(tag, title, details, remove);
            list.appendChild(card);
        });
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const item = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: document.getElementById("itemName").value.trim(),
            category: document.getElementById("itemCategory").value,
            colour: document.getElementById("itemColour").value,
            occasion: document.getElementById("itemOccasion").value
        };
        if (!item.name) return;
        if (window.TAYORA_AUTH?.isAuthenticated()) {
            const response = await window.TAYORA_AUTH.apiFetch("/wardrobe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
            });
            if (!response.ok) {
                const result = await response.json();
                status.textContent = result.detail || "Could not save wardrobe item.";
                return;
            }
        } else {
            const items = readItems();
            items.unshift(item);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
        }
        form.reset();
        render();
    });

    render();
})();
