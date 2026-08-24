/* ══════════════════════════════════════════════
   EDITORIAL INTERACTIONS — demo-v2
══════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll reveals (soft — never fully hide content) ── */
  function initReveals() {
    var nodes = document.querySelectorAll(
      '#page-home .listing-hero, #page-home .retreat-card, #page-home .exp-infinite-header, #page-home .dest-header, #page-home .dest-featured, #page-home .dest-card, #page-home .wd-intro, #page-home .wd-dim, #page-home .ridhira-group-section'
    );
    nodes.forEach(function (el, i) {
      el.classList.add('ed-reveal');
      if (i % 3 === 1) el.classList.add('ed-reveal-delay-1');
      if (i % 3 === 2) el.classList.add('ed-reveal-delay-2');
    });

    function showAll() {
      nodes.forEach(function (el) { el.classList.add('is-visible'); });
    }

    if (reduceMotion) {
      showAll();
      return;
    }

    if (!('IntersectionObserver' in window)) {
      showAll();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    nodes.forEach(function (el) { io.observe(el); });

    /* Safety: anything still in the initial viewport after load */
    requestAnimationFrame(function () {
      nodes.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          el.classList.add('is-visible');
        }
      });
    });

    /* Fail-safe — never leave content dimmed */
    setTimeout(showAll, 1800);
  }

  /* ── Compact nav on scroll ── */
  function initNavCompact() {
    var hero = document.getElementById('hero-video-section');
    function update() {
      var y = window.scrollY || window.pageYOffset;
      var pastHero = hero ? y > hero.offsetHeight * 0.35 : y > 80;
      document.body.classList.toggle('nav-compact', pastHero);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Tap-to-reveal for cards (mobile / no-hover) ── */
  function initTapReveal() {
    var cards = document.querySelectorAll('.retreat-card, .dest-card, .exp-card-item');
    cards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      if (!card.getAttribute('aria-label')) {
        var title = card.querySelector('h2, h3, .dest-card-name');
        if (title) card.setAttribute('aria-label', title.textContent.trim());
      }

      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        var touchUi = window.matchMedia('(hover: none)').matches || window.innerWidth <= 900;
        if (!touchUi) return;

        /* First tap: reveal colour / detail. Second tap: allow navigation. */
        if (!card.classList.contains('is-revealed')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          document.querySelectorAll('.is-revealed').forEach(function (c) {
            if (c !== card) c.classList.remove('is-revealed');
          });
          card.classList.add('is-revealed');
        }
      }, true);

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('is-revealed');
        }
      });
    });
  }

  /* ── Disable hero parallax when reduced motion ── */
  function gateParallax() {
    if (!reduceMotion) return;
    window.removeEventListener('scroll', window.applyParallax);
    var video = document.getElementById('hero-bg-video');
    var img = document.getElementById('hero-fallback-img');
    if (video) video.style.transform = '';
    if (img) img.style.transform = '';
  }

  /* ── Waitlist enquiry popup ── */
  function initWaitlistModal() {
    var modal = document.getElementById('waitlist-modal');
    var form = document.getElementById('waitlist-form');
    var destSelect = document.getElementById('wl-destination');
    var formView = document.getElementById('wl-form-view');
    var successView = document.getElementById('wl-success-view');
    var errorEl = document.getElementById('wl-error');
    var submitBtn = document.getElementById('wl-submit');
    if (!modal || !form) return;

    var lastFocus = null;

    function openModal(destination) {
      lastFocus = document.activeElement;
      formView.hidden = false;
      successView.hidden = true;
      form.reset();
      errorEl.hidden = true;
      errorEl.textContent = '';
      if (destination && destSelect) {
        destSelect.value = destination;
      }
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('wl-open');
      setTimeout(function () {
        var first = document.getElementById('wl-name');
        if (first) first.focus();
      }, 50);
    }

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('wl-open');
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    window.openWaitlistModal = openModal;

    document.querySelectorAll('.dest-notify-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var dest = btn.getAttribute('data-destination') || '';
        btn.textContent = 'Opening…';
        setTimeout(function () {
          openModal(dest);
          btn.textContent = 'Notify Me When Open';
        }, 220);
      });
    });

    /* Navbar "Enquire" triggers (desktop nav-book + mobile overlay CTA) —
       reuse the exact same waitlist modal/state via openModal(). */
    document.querySelectorAll('.wl-trigger').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        /* If the mobile menu overlay is open behind this button, close it
           first so the waitlist popup isn't hidden behind it. */
        var mobileOverlay = document.getElementById('mobile-overlay');
        var mobileCloseBtn = document.getElementById('mobile-close-btn');
        if (mobileOverlay && mobileOverlay.classList.contains('is-open') && mobileCloseBtn) {
          mobileCloseBtn.click();
        }

        var dest = btn.getAttribute('data-destination') || '';
        openModal(dest);
      });
    });

    modal.querySelectorAll('[data-wl-close]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        closeModal();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      var name = document.getElementById('wl-name');
      var email = document.getElementById('wl-email');
      var destination = destSelect;
      var ok = true;

      [name, email, destination].forEach(function (field) {
        field.removeAttribute('aria-invalid');
      });

      if (!name.value.trim()) {
        name.setAttribute('aria-invalid', 'true');
        ok = false;
      }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.setAttribute('aria-invalid', 'true');
        ok = false;
      }
      if (!destination.value) {
        destination.setAttribute('aria-invalid', 'true');
        ok = false;
      }

      if (!ok) {
        errorEl.textContent = 'Please complete the required fields.';
        errorEl.hidden = false;
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Opening…';

      /* Demo success state — wire API here when ready */
      setTimeout(function () {
        formView.hidden = true;
        successView.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Join the Waitlist';
      }, 700);
    });
  }

  /* ── Experience arrow controls ── */
  function initExpArrows() {
    var track = document.getElementById('exp-track');
    var prev = document.getElementById('exp-prev');
    var next = document.getElementById('exp-next');
    if (!track || !prev || !next) return;

    var step = 340;
    function nudge(dir) {
      if (typeof window.__expNudge === 'function') {
        window.__expNudge(dir * step);
        return;
      }
      var current = track.style.transform || 'translateX(0px)';
      var match = current.match(/-?[\d.]+/);
      var pos = match ? parseFloat(match[0]) : 0;
      pos = Math.abs(pos) + dir * step;
      track.style.transform = 'translateX(-' + pos + 'px)';
    }

    prev.addEventListener('click', function () { nudge(-1); });
    next.addEventListener('click', function () { nudge(1); });

    var viewport = document.getElementById('exp-viewport');
    if (viewport) {
      viewport.setAttribute('tabindex', '0');
      viewport.setAttribute('aria-label', 'Experiences carousel — use arrow keys or buttons to browse');
      viewport.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveals();
    initNavCompact();
    initTapReveal();
    initWaitlistModal();
    initExpArrows();
    gateParallax();
  });
})();
