(function () {
    function each(selector, callback) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), callback);
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function initImages() {
        each('img', function (image) {
            if (image.complete && image.naturalWidth === 0) {
                image.classList.add('hidden-image');
            }
            image.addEventListener('error', function () {
                image.classList.add('hidden-image');
            });
            image.addEventListener('load', function () {
                image.classList.remove('hidden-image');
            });
        });
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initBackTop() {
        var button = document.querySelector('.back-top');
        if (!button) {
            return;
        }
        function update() {
            if (window.scrollY > 420) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        }
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var previous = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var list = document.querySelector('.searchable-list');
        if (!list) {
            return;
        }
        var keywordInput = document.querySelector('.page-filter');
        var categoryInput = document.querySelector('.category-filter');
        var typeInput = document.querySelector('.type-filter');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        function run() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var category = normalize(categoryInput && categoryInput.value);
            var type = normalize(typeInput && typeInput.value);
            cards.forEach(function (card) {
                var content = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.year);
                var cardCategory = normalize(card.dataset.category);
                var cardType = normalize(card.dataset.type);
                var matchedKeyword = !keyword || content.indexOf(keyword) !== -1;
                var matchedCategory = !category || cardCategory === category;
                var matchedType = !type || cardType.indexOf(type) !== -1 || content.indexOf(type) !== -1;
                card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedCategory && matchedType));
            });
        }

        [keywordInput, categoryInput, typeInput].forEach(function (control) {
            if (control) {
                control.addEventListener('input', run);
                control.addEventListener('change', run);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && keywordInput) {
            keywordInput.value = query;
        }
        run();
    }

    function initPlayers() {
        each('[data-player]', function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.play-button');
            var streamUrl = box.getAttribute('data-stream-url');
            var ready = false;
            var hlsInstance = null;

            function prepare() {
                if (ready || !video || !streamUrl) {
                    return;
                }
                ready = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                            ready = false;
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else {
                    video.src = streamUrl;
                }
            }

            function play() {
                prepare();
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                box.classList.remove('playing');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initImages();
        initMenu();
        initBackTop();
        initHero();
        initFilters();
        initPlayers();
    });
}());
