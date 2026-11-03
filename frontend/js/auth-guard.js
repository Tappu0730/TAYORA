(() => {
    const page = window.location.pathname.split("/").pop() || "index.html";
    const publicPages = new Set(["", "index.html", "login.html", "register.html"]);
    const token = localStorage.getItem("tayoraAuthToken");

    if (publicPages.has(page) || token) return;

    const next = `${page}${window.location.search || ""}`;
    window.location.replace(`login.html?next=${encodeURIComponent(next)}`);
})();
