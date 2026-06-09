(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('.catalog-search');
  var yearFilter = document.querySelector('.year-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
  }

  function filterCards() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var y = yearFilter ? yearFilter.value : '';
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' ').toLowerCase();
      var matchText = !q || haystack.indexOf(q) !== -1;
      var matchYear = !y || card.getAttribute('data-year') === y;
      card.classList.toggle('hidden', !(matchText && matchYear));
    });
  }

  readQuery();
  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }
  filterCards();
})();
