(function () {
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      body.classList.toggle("menu-open");
    });
    mobileNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        body.classList.remove("menu-open");
      }
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

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
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
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
    show(0);
    start();
  }

  const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    const input = panel.querySelector("[data-page-search]");
    const clearButton = panel.querySelector("[data-clear-filter]");
    const grid = document.querySelector("[data-card-grid]");
    const pills = Array.from(panel.querySelectorAll(".filter-pill"));
    let activeType = "";
    let activeYear = "";
    let activeRegion = "";

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.children);

    function apply() {
      const query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-search") || "").toLowerCase();
        const type = card.getAttribute("data-type") || "";
        const year = card.getAttribute("data-year") || "";
        const region = card.getAttribute("data-region") || "";
        const matchesText = !query || text.indexOf(query) !== -1;
        const matchesType = !activeType || type.indexOf(activeType) !== -1;
        const matchesYear = !activeYear || year === activeYear;
        const matchesRegion = !activeRegion || region.indexOf(activeRegion) !== -1 || text.indexOf(activeRegion.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchesText && matchesType && matchesYear && matchesRegion));
      });
    }

    function resetPills(active) {
      pills.forEach(function (pill) {
        pill.classList.toggle("is-active", pill === active);
      });
    }

    if (input) {
      const params = new URLSearchParams(window.location.search);
      const keyword = params.get("q");
      if (keyword) {
        input.value = keyword;
      }
      input.addEventListener("input", apply);
    }

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        activeType = pill.getAttribute("data-filter-type") || "";
        activeYear = pill.getAttribute("data-filter-year") || "";
        activeRegion = pill.getAttribute("data-filter-region") || "";
        if (pill.hasAttribute("data-filter-all")) {
          activeType = "";
          activeYear = "";
          activeRegion = "";
        }
        resetPills(pill);
        apply();
      });
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        activeType = "";
        activeYear = "";
        activeRegion = "";
        const all = panel.querySelector("[data-filter-all]");
        if (all) {
          resetPills(all);
        }
        apply();
      });
    }

    apply();
  });
}());
