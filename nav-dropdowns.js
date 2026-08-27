/* ═══════════════════════════════════════════════════════════════
   RIDHIRA RETREATS — SHARED NAV DROPDOWNS
   nav-dropdowns.js

   Click-controlled desktop (.nav-dropdown) and mobile
   (.mobile-nav-dropdown) dropdown menus — "Retreats" / "Coming
   Soon" etc. Drives the *.is-open CLASS on the dropdown's <li>
   wrapper (not just the toggle button's aria-expanded attribute),
   since css/navbar.css's open/close styling and animation are
   keyed off .nav-dropdown.is-open / .mobile-nav-dropdown.is-open.

   One shared file, included by every page that has this nav
   (homepage and the Ayodhya/Jodhpur/Jaipur destination pages) so
   a future fix or behavior change only needs to happen once.
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var dropdowns = document.querySelectorAll('.nav-dropdown, .mobile-nav-dropdown');
  if (!dropdowns.length) return;

  function closeDropdown(dropdown) {
    var toggle = dropdown.querySelector('.nav-dropdown-toggle, .mobile-nav-dropdown-toggle');
    dropdown.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function closeAll(except) {
    dropdowns.forEach(function (dropdown) {
      if (dropdown !== except) closeDropdown(dropdown);
    });
  }

  dropdowns.forEach(function (dropdown) {
    var toggle = dropdown.querySelector('.nav-dropdown-toggle, .mobile-nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var shouldOpen = !dropdown.classList.contains('is-open');
      closeAll(dropdown);
      dropdown.classList.toggle('is-open', shouldOpen);
      toggle.setAttribute('aria-expanded', String(shouldOpen));
    });

    dropdown.querySelectorAll('.nav-dropdown-menu a, .mobile-nav-dropdown-menu a').forEach(function (link) {
      link.addEventListener('click', function () { closeAll(); });
    });
  });

  document.addEventListener('click', function () { closeAll(); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAll();
  });
})();
