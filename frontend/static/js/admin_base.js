
(function () {
    "use strict";

    /* =========================================
       THEME
    ========================================= */

    try {
        const theme = localStorage.getItem("regitrack_theme");

        if (theme) {
            document.documentElement.setAttribute("data-theme", theme);
        }
    } catch (error) {
        console.warn("Unable to load saved theme:", error);
    }


    window.toggleTheme = function () {
        const root = document.documentElement;

        const isDark =
            root.getAttribute("data-theme") === "dark" ||
            (!root.getAttribute("data-theme") &&
             window.matchMedia("(prefers-color-scheme: dark)").matches);

        const next = isDark ? "light" : "dark";

        root.setAttribute("data-theme", next);

        try {
            localStorage.setItem("regitrack_theme", next);
        } catch (error) {
            console.warn("Unable to save theme:", error);
        }

        window.adminToast("Switched to " + next + " mode");
    };


    /* =========================================
       TOAST
    ========================================= */

    window.adminToast = function (message) {
        const wrap = document.getElementById("ts");

        if (!wrap) return;

        const el = document.createElement("div");
        el.className = "toast";

        const icon = document.createElement("i");
        const span = document.createElement("span");

        span.textContent = message;

        icon.textContent = "✓";

        el.appendChild(icon);
        el.appendChild(span);

        wrap.appendChild(el);

        setTimeout(function () {
            el.remove();
        }, 3300);
    };


    /* =========================================
       PROFILE DROPDOWN
    ========================================= */

    window.togglePop = function (id, event) {
        if (event) event.stopPropagation();

        const el = document.getElementById(id);

        if (!el) return;

        const wasOpen = el.classList.contains("on");

        window.closePops();

        if (!wasOpen) {
            el.classList.add("on");
        }
    };


    window.closePops = function () {
        document.querySelectorAll(".pop").forEach(function (pop) {
            pop.classList.remove("on");
        });

        const suggestions = document.getElementById("searchSuggestions");

        if (suggestions) {
            suggestions.classList.remove("on");
        }
    };


    document.addEventListener("click", function (event) {
        if (
            !event.target.closest(".pw") &&
            !event.target.closest("#globalSearchWrap")
        ) {
            window.closePops();
        }
    });


    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            window.closePops();
        }
    });


    /* =========================================
       LOGOUT
    ========================================= */

    window.logoutAdmin = async function () {
        window.closePops();

        try {
            const response = await fetch("/auth/logout", {
                method: "POST",
                credentials: "same-origin"
            });

            const result = await response.json();

            if (response.ok && result.success) {
                localStorage.removeItem("regitrack_selected_req");
                window.location.href = "/";
            } else {
                alert(result.message || "Unable to log out.");
            }

        } catch (error) {
            console.error("Logout error:", error);
            alert("Connection error. Please try again.");
        }
    };


    /* =========================================
       DATE AND TIME
    ========================================= */

    function updateClock() {
        const clock = document.getElementById("clk");

        if (!clock) return;

        const now = new Date();

        clock.textContent =
            now.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric"
            }) +
            " · " +
            now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
            });
    }


    /* =========================================
       SIDEBAR NAVIGATION
    ========================================= */

    function initializeNavigation() {
        document.querySelectorAll(".side .nv").forEach(function (item) {
            if (!item.title) {
                item.title = item.textContent
                    .replace(/\s+/g, " ")
                    .trim();
            }
        });

        const active = document.querySelector(".side .nv.on");

        if (active && window.innerWidth <= 760) {
            try {
                active.scrollIntoView({
                    inline: "center",
                    block: "nearest"
                });
            } catch (error) {
                // Ignore unsupported scrolling behavior.
            }
        }
    }


    /* =========================================
       TOPBAR SCROLL EFFECT
    ========================================= */

    function initializeScrollEffects() {
        const topbar = document.getElementById("topbar");

        if (!topbar) return;

        function update() {
            const scrolled = window.scrollY > 10;

            topbar.classList.toggle("sc", scrolled);
        }

        window.addEventListener("scroll", update, {
            passive: true
        });

        update();
    }


    /* =========================================
       INITIALIZATION
    ========================================= */

    function initialize() {
        updateClock();
        initializeNavigation();
        initializeScrollEffects();

        setInterval(updateClock, 15000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }

})();
