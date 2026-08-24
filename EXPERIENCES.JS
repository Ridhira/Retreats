/* ══════════════════════════════════════════════
   EXPERIENCES — INFINITE AUTO-SCROLL SLIDER
   
   Technique:
   - Clone all cards and append them so track = [A][B][C]...[A'][B'][C']...
   - Scroll continuously via requestAnimationFrame
   - When scrolled by exactly one "set width", reset to 0 instantly (no flicker)
   - Pause on hover / touch; resume after release
   - Mouse drag + touch swipe supported
══════════════════════════════════════════════ */
(function () {
  'use strict';

  const track    = document.getElementById('exp-track');
  const viewport = document.getElementById('exp-viewport');
  const hint     = document.querySelector('.exp-drag-hint');
  if (!track || !viewport) return;

  /* ── Config ─────────────────────────────────── */
  const SPEED     = 0.45;  // px per frame (~27px/s at 60fps — slow & premium)
  const GAP       = 20;    // must match CSS gap

  /* ── 1. Clone all original cards ───────────── */
  const origCards = [...track.querySelectorAll('.exp-card-item')];
  origCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  /* ── 2. Measure one full "set" width ────────── */
  function getSetWidth() {
    // Sum of all original cards' outer widths including gap
    return origCards.reduce((sum, card) => {
      return sum + card.offsetWidth + GAP;
    }, 0);
  }

  /* ── 3. Animation state ─────────────────────── */
  let pos      = 0;     // current scroll position in px
  let paused   = false; // true when hovering or dragging
  let rafId    = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tick() {
    if (!paused && !reduceMotion) {
      pos += SPEED;
      const setW = getSetWidth();
      // Seamless reset: when we've scrolled one full set, snap back
      if (pos >= setW) {
        pos -= setW; // instant — no visual jump since clones are identical
      }
      track.style.transform = `translateX(-${pos}px)`;
    }
    rafId = requestAnimationFrame(tick);
  }

  /* External nudge for arrow / keyboard controls */
  window.__expNudge = function (delta) {
    const setW = getSetWidth() || 1;
    paused = true;
    pos = ((pos + delta) % setW + setW) % setW;
    track.style.transform = `translateX(-${pos}px)`;
    clearTimeout(window.__expResumeTimer);
    window.__expResumeTimer = setTimeout(() => { paused = false; }, 900);
  };

  /* ── 4. Hover pause ─────────────────────────── */
  viewport.addEventListener('mouseenter', () => { paused = true; });
  viewport.addEventListener('mouseleave', () => { paused = false; });

  /* ── 5. Mouse drag ──────────────────────────── */
  let dragStartX  = 0;
  let posAtDrag   = 0;
  let isDragging  = false;
  let hintHidden  = false;

  viewport.addEventListener('mousedown', e => {
    isDragging = true;
    paused     = true;
    dragStartX = e.clientX;
    posAtDrag  = pos;
    // Hide drag hint on first interaction
    if (hint && !hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const delta = dragStartX - e.clientX;
    const setW  = getSetWidth();
    pos = ((posAtDrag + delta) % setW + setW) % setW; // wrap cleanly
    track.style.transform = `translateX(-${pos}px)`;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    // Small delay before resuming so the card settles
    setTimeout(() => { paused = false; }, 600);
  });

  /* ── 6. Touch swipe ─────────────────────────── */
  let touchStartX = 0;
  let posAtTouch  = 0;

  viewport.addEventListener('touchstart', e => {
    paused      = true;
    touchStartX = e.touches[0].clientX;
    posAtTouch  = pos;
    if (hint && !hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
  }, { passive: true });

  viewport.addEventListener('touchmove', e => {
    const delta = touchStartX - e.touches[0].clientX;
    const setW  = getSetWidth();
    pos = ((posAtTouch + delta) % setW + setW) % setW;
    track.style.transform = `translateX(-${pos}px)`;
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    // Resume scroll after a short pause — feels intentional
    setTimeout(() => { paused = false; }, 900);
  });

  /* ── 7. Recalculate on resize ───────────────── */
  // No need to reset position — just let the next tick handle the wrap
  window.addEventListener('resize', () => {
    const setW = getSetWidth();
    if (pos >= setW) pos = pos % setW;
  });

  /* ── 8. Start ───────────────────────────────── */
  // Wait for images to load so card widths are correct
  if (document.readyState === 'complete') {
    tick();
  } else {
    window.addEventListener('load', tick);
  }

})();
