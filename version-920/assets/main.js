(function () {
    function setHeaderState() {
        var header = document.querySelector(".site-header");
        if (!header) {
            return;
        }
        if (window.scrollY > 16) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    function setupMenu() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".menu-toggle");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = header.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                play();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!panel || !grid) {
            return;
        }
        var input = panel.querySelector(".filter-input");
        var yearSelect = panel.querySelector('[data-filter="year"]');
        var typeSelect = panel.querySelector('[data-filter="type"]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function matches(card) {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year")
            ].join(" ").toLowerCase();
            if (keyword && text.indexOf(keyword) === -1) {
                return false;
            }
            if (year && card.getAttribute("data-year") !== year) {
                return false;
            }
            if (type && card.getAttribute("data-type") !== type) {
                return false;
            }
            return true;
        }

        function apply() {
            cards.forEach(function (card) {
                card.classList.toggle("is-filter-hidden", !matches(card));
            });
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function renderSearchResults() {
        var page = document.querySelector("[data-search-page]");
        var results = document.getElementById("searchResults");
        var title = document.getElementById("searchTitle");
        var input = document.getElementById("searchInput");
        if (!page || !results || !title || typeof MOVIE_SEARCH_INDEX === "undefined") {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matched = MOVIE_SEARCH_INDEX.filter(function (movie) {
            var haystack = movie.search.toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        }).slice(0, 120);
        title.textContent = matched.length ? "搜索结果：" + query : "未找到匹配影片";
        if (!matched.length) {
            results.innerHTML = "<p class=\"empty-state\">没有匹配结果，请尝试更换关键词。</p>";
            return;
        }
        results.innerHTML = matched.map(function (movie) {
            return [
                "<article class=\"movie-card\">",
                "<a class=\"movie-card-link\" href=\"" + movie.url + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">",
                "<span class=\"poster-wrap\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-gradient\"></span><span class=\"poster-play\">▶</span><span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span></span>",
                "<span class=\"movie-card-body\"><strong>" + escapeHtml(movie.title) + "</strong><span class=\"movie-meta-line\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.year) + " · " + escapeHtml(movie.genre) + "</span><span class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</span></span>",
                "</a>",
                "</article>"
            ].join("");
        }).join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
        renderSearchResults();
        setHeaderState();
    });
    window.addEventListener("scroll", setHeaderState, { passive: true });
})();
