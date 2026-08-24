/* Global fixed scroll controls. Safe to load on every route. */
(function () {
  'use strict';

  if (document.querySelector('[data-scroll-controls]')) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var controls = document.createElement('div');
  controls.className = 'scroll-controls';
  controls.setAttribute('data-scroll-controls', '');
  controls.setAttribute('aria-label', 'Page scrolling');

  controls.innerHTML = [
    '<button class="scroll-control scroll-control-up" type="button" aria-label="Scroll to top">',
    '  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11l7-7 7 7M12 4v16"/></svg>',
    '</button>',
    '<button class="scroll-control scroll-control-down" type="button" aria-label="Scroll toward bottom">',
    '  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l7 7 7-7M12 20V4"/></svg>',
    '</button>'
  ].join('');

  document.body.appendChild(controls);

  var upButton = controls.querySelector('.scroll-control-up');
  var downButton = controls.querySelector('.scroll-control-down');
  var updateQueued = false;

  function getScrollMetrics() {
    var documentElement = document.documentElement;
    var body = document.body;
    var scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop || 0;
    var viewportHeight = window.innerHeight || documentElement.clientHeight;
    var scrollHeight = Math.max(
      body.scrollHeight,
      documentElement.scrollHeight,
      body.offsetHeight,
      documentElement.offsetHeight
    );

    return {
      scrollTop: scrollTop,
      maxScroll: Math.max(0, scrollHeight - viewportHeight)
    };
  }

  function setButtonState(button, isDisabled) {
    button.disabled = isDisabled;
    button.setAttribute('aria-disabled', String(isDisabled));
    button.classList.toggle('is-hidden', isDisabled);
  }

  function updateVisibility() {
    updateQueued = false;
    var metrics = getScrollMetrics();
    var atTop = metrics.scrollTop <= 4;
    var atBottom = metrics.maxScroll <= 4 || metrics.scrollTop >= metrics.maxScroll - 4;

    setButtonState(upButton, atTop);
    setButtonState(downButton, atBottom);
  }

  function queueVisibilityUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    window.requestAnimationFrame(updateVisibility);
  }

  function scrollToPosition(position) {
    window.scrollTo({
      top: position,
      left: 0,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  }

  upButton.addEventListener('click', function () {
    scrollToPosition(0);
  });

  downButton.addEventListener('click', function () {
    var metrics = getScrollMetrics();
    scrollToPosition(metrics.maxScroll);
  });

  window.addEventListener('scroll', queueVisibilityUpdate, { passive: true });
  window.addEventListener('resize', queueVisibilityUpdate, { passive: true });
  window.addEventListener('pageshow', queueVisibilityUpdate, { passive: true });
  reducedMotion.addEventListener('change', queueVisibilityUpdate);
  updateVisibility();
}());
