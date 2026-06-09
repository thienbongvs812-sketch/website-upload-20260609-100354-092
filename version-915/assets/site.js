function closestScope(element) {
    return element.closest("[data-filter-scope]") || document;
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
        return;
    }
    button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
    });
}

function initSearchForms() {
    document.querySelectorAll("form[action]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (!input) {
                return;
            }
            event.preventDefault();
            var query = input.value.trim();
            var action = form.getAttribute("action") || "search.html";
            if (query) {
                window.location.href = action + "?q=" + encodeURIComponent(query);
            } else {
                window.location.href = action;
            }
        });
    });
}

function applyFilters(scope) {
    var input = scope.querySelector("[data-filter-input]");
    var activeButton = scope.querySelector("[data-filter-type].active");
    var keyword = normalizeText(input ? input.value : "");
    var type = activeButton ? activeButton.getAttribute("data-filter-type") : "all";
    var typeText = normalizeText(type);
    scope.querySelectorAll("[data-movie-card]").forEach(function (card) {
        var text = normalizeText(card.getAttribute("data-search"));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = type === "all" || text.indexOf(typeText) !== -1;
        card.classList.toggle("is-hidden-card", !(matchedKeyword && matchedType));
    });
}

function initLocalFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        if (input) {
            input.addEventListener("input", function () {
                applyFilters(scope);
            });
        }
        scope.querySelectorAll("[data-filter-type]").forEach(function (button) {
            button.addEventListener("click", function () {
                scope.querySelectorAll("[data-filter-type]").forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                applyFilters(scope);
            });
        });
    });
}

function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
        return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var mainInput = page.querySelector("[data-search-page-input]");
    var filterInput = page.querySelector("[data-filter-input]");
    if (mainInput) {
        mainInput.value = query;
    }
    if (filterInput) {
        filterInput.value = query;
    }
    applyFilters(closestScope(page));
}

function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
        return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
        return;
    }
    var index = 0;
    var timer = null;
    function activate(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle("active", itemIndex === index);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle("active", itemIndex === index);
        });
    }
    function start() {
        timer = window.setInterval(function () {
            activate(index + 1);
        }, 5600);
    }
    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(timer);
            activate(Number(dot.getAttribute("data-hero-dot")) || 0);
            start();
        });
    });
    activate(0);
    start();
}

function initMoviePlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
        return;
    }
    var hlsInstance = null;
    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }
    function prepare() {
        overlay.classList.add("is-hidden");
        if (video.getAttribute("data-ready") === "1") {
            playVideo();
            return;
        }
        video.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            return;
        }
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
    }
    overlay.addEventListener("click", prepare);
    video.addEventListener("click", function () {
        if (video.paused) {
            prepare();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSearchForms();
    initLocalFilters();
    initSearchPage();
    initHeroCarousel();
});
