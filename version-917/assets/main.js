(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
        var prev = carousel.querySelector("[data-carousel-prev]");
        var next = carousel.querySelector("[data-carousel-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        carousel.addEventListener("focusin", stop);
        carousel.addEventListener("focusout", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var controls = Array.prototype.slice.call(document.querySelectorAll("[data-filter-control]"));
        var empty = document.querySelector("[data-empty-result]");
        if (!cards.length || !controls.length) {
            return;
        }

        var queryInput = document.querySelector("[data-filter-input]");
        if (queryInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                queryInput.value = query;
            }
        }

        function apply() {
            var text = queryInput ? normalize(queryInput.value) : "";
            var activeFilters = controls.filter(function (control) {
                return control.dataset.filterKey && control.value;
            }).map(function (control) {
                return {
                    key: control.dataset.filterKey,
                    value: normalize(control.value)
                };
            });
            var visibleCount = 0;

            cards.forEach(function (card) {
                var cardText = normalize(card.dataset.search || card.textContent);
                var textMatch = !text || cardText.indexOf(text) !== -1;
                var filterMatch = activeFilters.every(function (filter) {
                    var cardValue = normalize(card.dataset[filter.key] || "");
                    return cardValue.indexOf(filter.value) !== -1;
                });
                var visible = textMatch && filterMatch;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        controls.forEach(function (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
        apply();
    }

    window.initMoviePlayer = function (streamUrl, videoId, layerId) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var hls = null;

        if (!video || !layer || !streamUrl) {
            return;
        }

        function attach() {
            if (video.dataset.ready === "true") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            video.dataset.ready = "true";
        }

        function start() {
            attach();
            layer.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        layer.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.dataset.ready !== "true") {
                start();
            }
        });
        video.addEventListener("play", function () {
            layer.classList.add("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupCarousel();
        setupFilters();
    });
})();
