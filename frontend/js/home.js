/* Lightweight motion for the landing page. GSAP is optional; the page remains
   fully usable if a CDN request is blocked or the user prefers reduced motion. */
(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const run = () => {
        if (!window.gsap) return;

        const { gsap } = window;
        const heroItems = document.querySelectorAll(".home-hero .hero-copy > *, .home-hero .hero-visual");
        gsap.from(heroItems, {
            y: 28,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "transform"
        });

        if (window.ScrollTrigger) {
            gsap.registerPlugin(window.ScrollTrigger);
            gsap.from(".home-page .feature", {
                scrollTrigger: {
                    trigger: ".home-page .feature-grid",
                    start: "top 82%",
                    once: true
                },
                y: 30,
                opacity: 0,
                duration: 0.65,
                ease: "power2.out",
                stagger: 0.1,
                clearProps: "transform"
            });

            gsap.from(".process-item", {
                scrollTrigger: {
                    trigger: ".process-list",
                    start: "top 82%",
                    once: true
                },
                x: 24,
                opacity: 0,
                duration: 0.55,
                ease: "power2.out",
                stagger: 0.12,
                clearProps: "transform"
            });
        }
    };

    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
})();
