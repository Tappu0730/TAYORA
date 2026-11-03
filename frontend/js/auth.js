(() => {
    const TOKEN_KEY = "tayoraAuthToken";
    const USER_KEY = "tayoraAuthUser";
    const apiBase = window.TAYORA_CONFIG?.apiBaseUrl || "http://127.0.0.1:8000/api";

    const getToken = () => localStorage.getItem(TOKEN_KEY) || "";

    const setSession = (data) => {
        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user || {}));
    };

    const clearSession = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    const apiFetch = (path, options = {}) => {
        const headers = new Headers(options.headers || {});
        const token = getToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return fetch(`${apiBase}${path}`, { ...options, headers });
    };

    window.TAYORA_AUTH = Object.freeze({
        apiFetch,
        clearSession,
        getToken,
        isAuthenticated: () => Boolean(getToken()),
        setSession
    });

    document.querySelectorAll("[data-logout]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            clearSession();
            window.location.href = link.getAttribute("href") || "../index.html";
        });
    });
})();
