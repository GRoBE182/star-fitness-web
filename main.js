/* ============================================================
   STAR FITNESS — main.js
   IIFE pattern, no ES modules, no import/export
   ============================================================ */
(function () {
  "use strict";

  /* ── Safety wrapper ── */
  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn("[StarFitness:" + name + "]", e); }
  }

  /* ── Util: reveal with IntersectionObserver + 6s safety net ── */
  function initReveals() {
    var elements = document.querySelectorAll(".reveal, .slide-left, .slide-right");
    if (!elements.length) return;

    // Safety net: reveal all after 6s
    var safetyTimer = setTimeout(function () {
      elements.forEach(function (el) { el.classList.add("visible"); });
    }, 6000);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    elements.forEach(function (el, i) {
      var delay = el.dataset.delay || 0;
      if (delay) el.style.transitionDelay = delay + "ms";
      io.observe(el);
    });
  }

  /* ── Splash ── */
  function initSplash() {
    var splash = document.getElementById("splash");
    if (!splash) return;
    // CSS animation handles the hide at 2.5s; JS as backup
    setTimeout(function () {
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";
      setTimeout(function () { splash.style.display = "none"; }, 600);
    }, 2600);
  }

  /* ── Hero title entrance ── */
  function initHeroLines() {
    var lines = document.querySelectorAll(".hero-title .split-line");
    if (!lines.length) return;
    lines.forEach(function (line, i) {
      setTimeout(function () {
        line.classList.add("visible");
      }, 2800 + i * 180);
    });
    // Ensure reveals also fire
    setTimeout(function () {
      var heroReveals = document.querySelectorAll(".hero .reveal");
      heroReveals.forEach(function (el, i) {
        setTimeout(function () { el.classList.add("visible"); }, i * 120);
      });
    }, 3200);
  }

  /* ── Mouse-reactive gradient on hero ── */
  function initMouseGradient() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var ticking = false;
    window.addEventListener("mousemove", function (e) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var x = (e.clientX / window.innerWidth * 100).toFixed(1);
        var y = (e.clientY / window.innerHeight * 100).toFixed(1);
        document.documentElement.style.setProperty("--mx", x + "%");
        document.documentElement.style.setProperty("--my", y + "%");
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Custom cursor ── */
  function initCursor() {
    var root = document.querySelector("[data-cursor-root]");
    if (!root || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    var ring = root.querySelector(".cursor-ring");
    var dot = root.querySelector(".cursor-dot");
    var tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
      if (!firstMove) {
        firstMove = true;
        rx = tx; ry = ty;
        if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
        root.classList.add("is-ready");
      }
    }, { passive: true });

    (function tick() {
      rx += (tx - rx) * 0.15;
      ry += (ty - ry) * 0.15;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(tick);
    })();

    var HOVERABLES = "a[href], button, .card, .service-card, .instructor-card, .pricing-card, .gallery-item, .social-btn";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(HOVERABLES)) root.classList.add("is-interactive");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(HOVERABLES)) root.classList.remove("is-interactive");
    });
  }

  /* ── Sticky nav ── */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile menu ── */
  function initMobileMenu() {
    var btn = document.getElementById("menuBtn");
    var menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;

    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });

    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ── Smooth anchor scroll ── */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* ── Stat count-up ── */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var duration = 1800;
        var start = Date.now();

        (function tick() {
          var elapsed = Date.now() - start;
          var progress = Math.min(elapsed / duration, 1);
          el.textContent = Math.round(easeOut(progress) * target);
          if (progress < 1) requestAnimationFrame(tick);
        })();

        io.unobserve(el);
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ── Particles in hero ── */
  function initParticles() {
    var container = document.getElementById("heroParticles");
    if (!container) return;
    var chars = ["★", "✦", "·", "◆", "♦"];
    var count = 18;

    for (var i = 0; i < count; i++) {
      (function (idx) {
        var p = document.createElement("span");
        p.className = "particle";
        p.textContent = chars[idx % chars.length];
        p.style.left = (Math.random() * 100) + "%";
        p.style.top = (Math.random() * 100) + "%";
        var duration = 8 + Math.random() * 12;
        var delay = Math.random() * 8;
        p.style.animationDuration = duration + "s";
        p.style.animationDelay = delay + "s";
        p.style.fontSize = (0.6 + Math.random() * 1.2) + "rem";
        p.style.opacity = 0;
        // alternate gold/magenta
        p.style.color = idx % 3 === 0 ? "#FFD700" : "rgba(233,30,140," + (0.4 + Math.random() * 0.5) + ")";
        container.appendChild(p);
      })(i);
    }
  }

  /* ── Carousel (testimonials) ── */
  function initCarousel() {
    var track = document.getElementById("testimonialTrack");
    var dotsContainer = document.getElementById("carouselDots");
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");
    if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

    var cards = track.querySelectorAll(".testimonial-card");
    if (!cards.length) return;
    var current = 0;
    var total = cards.length;
    var autoplayTimer;

    // Create dots
    for (var i = 0; i < total; i++) {
      var dot = document.createElement("button");
      dot.className = "carousel-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Ir al testimonio " + (i + 1));
      dot.dataset.index = i;
      dot.addEventListener("click", function () { goTo(parseInt(this.dataset.index, 10)); });
      dotsContainer.appendChild(dot);
    }

    function getVisible() {
      var w = window.innerWidth;
      return w < 640 ? 1 : w < 1024 ? 2 : 3;
    }

    function goTo(idx) {
      current = (idx + total) % total;
      var visible = getVisible();
      var cardWidth = track.querySelector(".testimonial-card").offsetWidth;
      var gap = 24;
      var maxOffset = Math.max(0, total - visible);
      var safeIdx = Math.min(current, maxOffset);
      track.style.transform = "translateX(-" + (safeIdx * (cardWidth + gap)) + "px)";

      // Update active card
      cards.forEach(function (c, i) { c.classList.toggle("active", i === current); });
      // Update dots
      dotsContainer.querySelectorAll(".carousel-dot").forEach(function (d, i) {
        d.classList.toggle("active", i === current);
      });

      clearTimeout(autoplayTimer);
      autoplayTimer = setTimeout(function () { goTo(current + 1); }, 4000);
    }

    prevBtn.addEventListener("click", function () { goTo(current - 1); });
    nextBtn.addEventListener("click", function () { goTo(current + 1); });

    // Touch swipe
    var startX = 0;
    track.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });

    goTo(0);
  }

  /* ── Back to top ── */
  function initBackTop() {
    var btn = document.getElementById("backTop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("visible", window.scrollY > 300);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── GSAP ScrollTrigger animations (if GSAP loaded) ── */
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Service cards stagger
    var serviceCards = document.querySelectorAll(".service-card");
    if (serviceCards.length) {
      gsap.from(serviceCards, {
        scrollTrigger: { trigger: ".services-grid", start: "top 80%" },
        y: 60, opacity: 0, duration: 0.8, stagger: 0.15,
        ease: "power3.out"
      });
    }

    // Pricing cards stagger
    var pricingCards = document.querySelectorAll(".pricing-card");
    if (pricingCards.length) {
      gsap.from(pricingCards, {
        scrollTrigger: { trigger: ".pricing-grid", start: "top 80%" },
        y: 50, opacity: 0, duration: 0.7, stagger: 0.12,
        ease: "power3.out"
      });
    }

    // Marquee speed on scroll (subtle)
    ScrollTrigger.create({
      trigger: ".marquee-wrap",
      start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var speed = 1 + Math.abs(self.getVelocity() / 1000);
        var track = document.querySelector(".marquee-track");
        if (track) track.style.animationPlayState = "running";
      }
    });
  }

  /* ── Contact form ── */
  function initContactForm() {
    var btn = document.getElementById("formSubmit");
    var success = document.getElementById("formSuccess");
    if (!btn || !success) return;

    btn.addEventListener("click", function () {
      var nombre = document.getElementById("nombre");
      if (!nombre || !nombre.value.trim()) {
        nombre && nombre.focus();
        nombre && (nombre.style.borderColor = "var(--magenta)");
        return;
      }
      btn.textContent = "Enviando...";
      btn.disabled = true;
      setTimeout(function () {
        success.style.display = "block";
        btn.textContent = "Enviado ✓";
        btn.style.background = "#1a6b40";
      }, 1200);
    });
  }

  /* ── Boot ── */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initCursor, "initCursor");
    safe(initNav, "initNav");
    safe(initMobileMenu, "initMobileMenu");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initMouseGradient, "initMouseGradient");
    safe(initParticles, "initParticles");
    safe(initHeroLines, "initHeroLines");
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initCarousel, "initCarousel");
    safe(initBackTop, "initBackTop");
    safe(initContactForm, "initContactForm");
    safe(initGSAP, "initGSAP");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
