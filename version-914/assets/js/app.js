(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
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

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }
      showSlide(index);
      startCarousel();
    });
  });

  showSlide(0);
  startCarousel();

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && window.JZ_FILMS) {
    var form = searchRoot.querySelector('[data-search-form]');
    var queryInput = searchRoot.querySelector('[data-query]');
    var typeSelect = searchRoot.querySelector('[data-type]');
    var regionSelect = searchRoot.querySelector('[data-region]');
    var yearSelect = searchRoot.querySelector('[data-year]');
    var categorySelect = searchRoot.querySelector('[data-category]');
    var results = searchRoot.querySelector('[data-results]');

    function uniqueValues(key) {
      var values = [];
      window.JZ_FILMS.forEach(function (item) {
        if (item[key] && values.indexOf(item[key]) === -1) {
          values.push(item[key]);
        }
      });
      return values.sort();
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(typeSelect, uniqueValues('type'));
    fillSelect(regionSelect, uniqueValues('region'));
    fillSelect(yearSelect, uniqueValues('year').reverse());
    fillSelect(categorySelect, uniqueValues('category'));

    function cardHtml(item) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="./' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-badge">' + escapeHtml(item.type) + '</span>',
        '<span class="poster-play">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<h3><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</p>',
        '<p class="movie-desc">' + escapeHtml(item.desc) + '</p>',
        '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function applySearch() {
      var query = (queryInput && queryInput.value ? queryInput.value : '').trim().toLowerCase();
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var filtered = window.JZ_FILMS.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.desc, item.category].join(' ').toLowerCase();
        return (!query || haystack.indexOf(query) !== -1) &&
          (!type || item.type === type) &&
          (!region || item.region === region) &&
          (!year || item.year === year) &&
          (!category || item.category === category);
      }).slice(0, 120);

      if (!filtered.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，换个关键词试试。</div>';
        return;
      }

      results.innerHTML = filtered.map(cardHtml).join('');
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('q') && queryInput) {
      queryInput.value = params.get('q');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applySearch();
      });
    }

    [queryInput, typeSelect, regionSelect, yearSelect, categorySelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applySearch);
        element.addEventListener('change', applySearch);
      }
    });

    applySearch();
  }
})();
