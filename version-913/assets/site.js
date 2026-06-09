(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initHero() {
    var hero = document.querySelector('.js-hero');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (slides.length > 1) {
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-slide') || 0));
          restart();
        });
      });

      restart();
    }
  }

  function initFilters() {
    var container = document.querySelector('.js-card-container');
    if (!container) {
      return;
    }

    var input = document.querySelector('.js-search-input');
    var type = document.querySelector('.js-type-filter');
    var region = document.querySelector('.js-region-filter');
    var sort = document.querySelector('.js-sort-filter');
    var line = document.querySelector('.js-result-line');
    var cards = Array.prototype.slice.call(container.querySelectorAll('.js-filter-card'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : 'all';
      var regionValue = region ? region.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
        var matchesType = typeValue === 'all' || card.getAttribute('data-type') === typeValue;
        var matchesRegion = regionValue === 'all' || card.getAttribute('data-region') === regionValue;
        var shouldShow = matchesKeyword && matchesType && matchesRegion;
        card.classList.toggle('is-hidden-by-filter', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (line) {
        line.textContent = visible > 0 ? '符合条件影视' : '未找到匹配影视';
      }
    }

    function applySort() {
      if (!sort) {
        return;
      }

      var value = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (value === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        if (value === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
        }
        return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
      });

      sorted.forEach(function (card) {
        container.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    [input, type, region].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    if (sort) {
      sort.addEventListener('change', applySort);
    }

    applySort();
  }

  window.initPlayer = function (streamUrl) {
    var video = document.getElementById('movie-video');
    var playButton = document.getElementById('movie-play');
    var frame = document.querySelector('.video-frame');
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function start() {
      attach();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (playButton) {
            playButton.classList.remove('is-hidden');
          }
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }

    if (frame) {
      frame.addEventListener('click', function (event) {
        if (event.target === frame || event.target === video) {
          start();
        }
      });
    }

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && playButton) {
        playButton.classList.remove('is-hidden');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFilters();
  });
})();
