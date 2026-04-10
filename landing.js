// Landing page motion stays intentionally light so the content remains the focus.
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const revealItems = document.querySelectorAll("[data-reveal]");
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  const setMenuOpen = (isOpen) => {
    if (!header || !menuToggle) {
      return;
    }

    header.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuToggle.textContent = isOpen ? "Close" : "Menu";
  };

  const syncMenuForViewport = () => {
    if (!header || !menuToggle) {
      return;
    }

    if (!mobileQuery.matches) {
      setMenuOpen(false);
    }
  };

  const syncHeaderState = () => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
  syncMenuForViewport();

  if (menuToggle && header) {
    menuToggle.addEventListener("click", () => {
      const isOpen = header.classList.contains("menu-open");
      setMenuOpen(!isOpen);
    });

    header.querySelectorAll(".landing-nav a, .header-meta a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileQuery.matches) {
          setMenuOpen(false);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncMenuForViewport);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(syncMenuForViewport);
    }
  }

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealItems.forEach((item) => observer.observe(item));
});
