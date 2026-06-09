document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = form.getAttribute('data-search-target') || 'library.html';
            window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
        });
    });

    initHeroSlider();
    initMovieFilters();
    initPlayers();
});

function initHeroSlider() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) {
        return;
    }

    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-hero-card]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
        if (!cards.length) {
            return;
        }
        current = (index + cards.length) % cards.length;
        cards.forEach(function (card, cardIndex) {
            card.classList.toggle('is-active', cardIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function play() {
        stop();
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            show(index);
            play();
        });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    show(0);
    play();
}

function initMovieFilters() {
    var filterRoot = document.querySelector('[data-filter-root]');
    if (!filterRoot) {
        return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root] .movie-card'));
    var searchInput = document.querySelector('[data-filter-search]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var sortSelect = document.querySelector('[data-filter-sort]');
    var resultNote = document.querySelector('[data-result-note]');
    var emptyState = document.querySelector('[data-empty-state]');
    var grid = document.querySelector('[data-movie-grid]');

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && searchInput) {
        searchInput.value = query;
    }

    function matchYear(card, value) {
        if (!value || value === 'all') {
            return true;
        }
        var year = parseInt(card.getAttribute('data-year') || '0', 10);
        if (value === '2025') {
            return year >= 2025;
        }
        if (value === '2020') {
            return year >= 2020 && year <= 2024;
        }
        if (value === '2010') {
            return year >= 2010 && year <= 2019;
        }
        if (value === 'old') {
            return year > 0 && year < 2010;
        }
        return true;
    }

    function applyFilters() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var category = categorySelect ? categorySelect.value : 'all';
        var type = typeSelect ? typeSelect.value : 'all';
        var year = yearSelect ? yearSelect.value : 'all';
        var visible = [];

        cards.forEach(function (card) {
            var searchText = (card.getAttribute('data-search') || '').toLowerCase();
            var cardCategory = card.getAttribute('data-category') || '';
            var cardType = card.getAttribute('data-type') || '';
            var matched = true;

            if (keyword && searchText.indexOf(keyword) === -1) {
                matched = false;
            }
            if (category !== 'all' && cardCategory !== category) {
                matched = false;
            }
            if (type !== 'all' && cardType !== type) {
                matched = false;
            }
            if (!matchYear(card, year)) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                visible.push(card);
            }
        });

        sortCards(visible);

        if (resultNote) {
            resultNote.textContent = visible.length ? '已显示符合条件的影片' : '没有找到符合条件的影片';
        }
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible.length === 0);
        }
    }

    function sortCards(visible) {
        if (!grid || !sortSelect) {
            return;
        }
        var sortValue = sortSelect.value;
        visible.sort(function (a, b) {
            var ay = parseInt(a.getAttribute('data-year') || '0', 10);
            var by = parseInt(b.getAttribute('data-year') || '0', 10);
            var ah = parseInt(a.getAttribute('data-heat') || '0', 10);
            var bh = parseInt(b.getAttribute('data-heat') || '0', 10);
            var at = a.getAttribute('data-title') || '';
            var bt = b.getAttribute('data-title') || '';

            if (sortValue === 'heat-desc') {
                return bh - ah;
            }
            if (sortValue === 'title-asc') {
                return at.localeCompare(bt, 'zh-Hans-CN');
            }
            return by - ay || bh - ah;
        });
        visible.forEach(function (card) {
            grid.appendChild(card);
        });
    }

    [searchInput, categorySelect, typeSelect, yearSelect, sortSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    applyFilters();
}

function initPlayers() {
    document.querySelectorAll('[data-static-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var status = document.querySelector('[data-player-status]');
        var source = video ? video.getAttribute('data-src') : '';
        var attached = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function attachSource() {
            if (!video || !source || attached) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                attached = true;
                setStatus('播放源已连接，正在加载高清内容。');
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                attached = true;
                setStatus('浏览器原生 高清播放已启用。');
            } else {
                video.src = source;
                attached = true;
                setStatus('正在尝试使用浏览器默认播放器打开播放源。');
            }
        }

        function startPlayback() {
            attachSource();
            if (!video) {
                return;
            }
            shell.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                    setStatus('点击播放器上的播放按钮即可继续播放。');
                });
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
            video.addEventListener('error', function () {
                setStatus('播放源加载失败，请刷新页面或稍后重试。');
            });
        }
    });
}
