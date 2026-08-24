/* ══════════════════════════════════════════════════════════════
   RIDHIRA RETREATS — SHARED HOTELOGIX / STAYGRID LOADER
   ──────────────────────────────────────────────────────────────
   Load order in each /book/<property>/index.html:

     1. <script> window.RIDHIRA_BOOKING = { key: "...", ... } </script>
     2. <script src="https://staygrid.com/js/hapi/web.js?v=..."></script>
     3. <script src="../assets/booking-embed.js"></script>

   The engine always renders into  <div id="hlx-booking">.
   To add a property, only the config object changes — this file
   and booking.css are shared by every booking page.

   Bundled fixes (carried over from the property-page embeds):
     • iframe height clamp — the engine injects an iframe with a
       hard-coded height that clips content; we strip it and force
       var(--hlx-frame-height).
     • scroll-reset strip — web.js sets onload="self.scrollTo(0,0)"
       on its iframe, yanking the parent page to the top ~1s after
       load (and again on step changes). We remove that handler.
     • loading / fallback states for slow or failed vendor loads.
══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var CONTAINER_ID = "hlx-booking";
  var cfg = window.RIDHIRA_BOOKING || {};

  function getContainer() {
    return document.getElementById(CONTAINER_ID);
  }

  /* ── Iframe sanitiser: height clamp + scroll-reset strip ─── */
  function fixIframe(iframe) {
    if (!iframe) return;
    iframe.removeAttribute("height");
    iframe.removeAttribute("width");
    iframe.removeAttribute("scrolling");
    iframe.removeAttribute("onload"); /* self.scrollTo(0,0) culprit */
    iframe.onload = null;

    var h = getFrameHeight();
    iframe.style.setProperty("height", h, "important");
    iframe.style.setProperty("min-height", h, "important");
    iframe.style.setProperty("width", "100%", "important");
    iframe.style.setProperty("border", "none", "important");
    iframe.style.setProperty("display", "block", "important");
  }

  function getFrameHeight() {
    var v = getComputedStyle(document.documentElement)
      .getPropertyValue("--hlx-frame-height").trim();
    return v || "1100px";
  }

  function fixAllFrames() {
    var host = getContainer();
    if (!host) return;
    var frames = host.getElementsByTagName("iframe");
    for (var i = 0; i < frames.length; i++) fixIframe(frames[i]);
    if (frames.length) hideLoading();
  }

  function hideLoading() {
    var el = document.querySelector(".bk-loading");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* ── Watch the container for the engine's (re)injected iframe ─ */
  function watchContainer() {
    var host = getContainer();
    if (!host || !window.MutationObserver) return;
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.addedNodes) {
          for (var j = 0; j < m.addedNodes.length; j++) {
            if (m.addedNodes[j].nodeName === "IFRAME") fixIframe(m.addedNodes[j]);
          }
        }
        if (m.type === "attributes" && m.target.nodeName === "IFRAME") {
          fixIframe(m.target);
        }
      }
      fixAllFrames();
    }).observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["height", "style", "onload"]
    });
    fixAllFrames();

    /* Belt-and-braces: re-check on every postMessage from the widget */
    window.addEventListener("message", fixAllFrames, false);
  }

  function showFallback() {
    var host = getContainer();
    if (!host) return;
    hideLoading();
    var phone = cfg.phone || "+91 74162 82288";
    var tel = "tel:" + phone.replace(/\s+/g, "");
    host.innerHTML =
      '<div class="bk-fallback">The booking engine could not be loaded right now.<br>' +
      'Please refresh the page, or call us on <a href="' + tel + '">' + phone + "</a> " +
      "and we will confirm your reservation over the phone.</div>";
  }

  /* ── Engine bootstrap ─────────────────────────────────────── */
  function init() {
    if (!cfg.key) {
      if (window.console) console.warn("[booking] RIDHIRA_BOOKING.key missing");
      showFallback();
      return;
    }
    if (typeof window.HotelogixWeb === "undefined") {
      /* Vendor web.js failed to load (network / adblock) */
      showFallback();
      return;
    }

    var engine = new window.HotelogixWeb();

    function drawEngine() {
      engine.draw({
        version: 3.0,
        domain: "https://booking.staygrid.com",
        container: getContainer(),
        key: cfg.key,
        languageCode: cfg.languageCode || "en"
      });
      /* The engine appends its iframe synchronously inside draw() —
         sanitise immediately, and again on the next tick. */
      fixAllFrames();
      setTimeout(fixAllFrames, 0);
    }

    engine.run(drawEngine);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      watchContainer();
      init();
    });
  } else {
    watchContainer();
    init();
  }
})();
