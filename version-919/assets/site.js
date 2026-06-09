(function () {
    function setScrolled() {
        document.body.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    function bindHeader() {
        setScrolled();
        window.addEventListener("scroll", setScrolled, { passive: true });
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("is-open");
            });
        });
    }

    function bindHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        });
        if (index < 0) {
            index = 0;
        }
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
    }

    function bindFilters() {
        document.querySelectorAll("[data-filter-area]").forEach(function (area) {
            var input = area.querySelector("[data-search-input]");
            var root = area.parentElement || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var chips = Array.prototype.slice.call(area.querySelectorAll("[data-filter-chip]"));
            var empty = root.querySelector("[data-empty-state]");
            var selected = "all";
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var search = (card.getAttribute("data-search") || "").toLowerCase();
                    var type = card.getAttribute("data-type") || "";
                    var region = card.getAttribute("data-region") || "";
                    var genre = card.getAttribute("data-genre") || "";
                    var category = card.getAttribute("data-category") || "";
                    var matchText = !query || search.indexOf(query) !== -1;
                    var matchChip = selected === "all" || type.indexOf(selected) !== -1 || region.indexOf(selected) !== -1 || genre.indexOf(selected) !== -1 || category.indexOf(selected) !== -1 || search.indexOf(selected.toLowerCase()) !== -1;
                    var match = matchText && matchChip;
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    selected = chip.getAttribute("data-filter-chip") || "all";
                    chips.forEach(function (button) {
                        button.classList.toggle("is-active", button === chip);
                    });
                    apply();
                });
            });
        });
    }

    function bindPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector("[data-play-cover]");
            var stream = player.getAttribute("data-stream");
            var ready = false;
            function init() {
                if (ready || !video || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    ready = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        maxBufferLength: 30,
                        backBufferLength: 30
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    ready = true;
                    return;
                }
                video.src = stream;
                ready = true;
            }
            function play() {
                init();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                if (video) {
                    video.controls = true;
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                }
            }
            init();
            if (cover) {
                cover.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    if (cover) {
                        cover.classList.add("is-hidden");
                    }
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        bindHeader();
        bindHero();
        bindFilters();
        bindPlayers();
    });
}());
