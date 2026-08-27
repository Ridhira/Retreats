/* ═══════════════════════════════════════════════════════════════
   RIDHIRA RETREATS — SHARED FOOTER LOADER
   include-footer.js

   Injects the site's footer markup in place of the
   <footer data-include="footer"></footer>) placeholder on the page.
   One JS source for every page that includes it (homepage,
   Ayodhya/Jodhpur/Jaipur, 8 Dimensions of Wellness), so a future
   edit to FOOTER_HTML below propagates everywhere automatically —
   edit it here, not per page.

   Previously this fetched a separate partials/footer.html file.
   That works when the site is served over http(s), but fetch() to
   a local file is blocked by the browser when a page is opened
   directly as file:// (e.g. double-clicking index.html) — the
   footer would then silently fail to render at all. Embedding the
   markup as a template string here removes that dependency, so the
   footer loads the same way whether the site is served or opened
   as a plain local file.
═══════════════════════════════════════════════════════════════ */
(function () {
  var mount = document.querySelector('footer[data-include="footer"]');
  if (!mount) return;

  var FOOTER_HTML = '\
  <footer class="site-footer">\
    <div class="sf-columns">\
      <div class="sf-col">\
        <h4>Retreats</h4>\
        <a href="casa-de-mello.html">Casa De Mello, Goa</a>\
        <a href="tiger-hills.html">Tiger Hills, Udaipur</a>\
      </div>\
      <div class="sf-col">\
        <h4>Connect</h4>\
        <a href="https://ridhira.com/" target="_blank" rel="noopener noreferrer">Ridhira Group</a>\
        <a href="https://odespa.com/" target="_blank" rel="noopener noreferrer">Odespa</a>\
      </div>\
      <div class="sf-col">\
        <h4>Contact</h4>\
        <a href="tel:+91 741 628 2288">Contact Us</a>\
      </div>\
      <div class="sf-col">\
        <h4>Legal</h4>\
        <a>Terms and Conditions</a>\
        <a>Privacy &amp; Cookies</a>\
      </div>\
    </div>\
    <div class="sf-divider"></div>\
    <div class="sf-bottom">\
      <div class="sf-bottom-block sf-cs">\
        <h5>Customer Service</h5>\
        <p class="sf-cs-hours">Monday to Saturday 10am – 9pm IST</p>\
        <a class="sf-cs-phone" href="tel:+91 741 628 2288">741 628 2288</a>\
        <a class="sf-cs-email" href="mailto:gocdm@ridhiraretreats.com">Email us</a>\
      </div>\
      <div class="sf-bottom-block sf-newsletter">\
        <h5>Newsletter</h5>\
        <p>Receive our newsletter and discover our stories, retreats, and surprises.</p>\
        <form class="sf-subscribe-form" onsubmit="return false;">\
          <button type="submit" class="sf-subscribe-btn">Subscribe</button>\
        </form>\
      </div>\
      <div class="sf-bottom-block sf-follow">\
        <h5>Follow Us</h5>\
        <div class="sf-social-icons">\
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Follow Ridhira Retreats on Instagram">\
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor"/></svg>\
          </a>\
          <a href="https://wa.me/18004414488" target="_blank" rel="noopener noreferrer" aria-label="Chat with Ridhira Retreats on WhatsApp">\
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 11.5a8 8 0 0 1-11.8 7.1L4 20l1.4-4A8 8 0 1 1 20 11.5Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 8.5c.3-.3.6-.3.8 0l1 1.4c.2.3.2.6 0 .9l-.5.6c.7 1.2 1.5 2 2.7 2.7l.6-.5c.3-.2.6-.2.9 0l1.4 1c.3.2.3.5 0 .8-.5.6-1.2.9-1.9.7-2.2-.6-4.8-3.2-5.4-5.4-.2-.8.1-1.5.7-2.2Z" fill="currentColor"/></svg>\
          </a>\
          <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Follow Ridhira Retreats on X (formerly Twitter)">\
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4h3.8l4.1 5.4L17.6 4H20l-5.9 6.8L20.5 20h-3.8l-4.5-5.9L7.1 20H4.7l6.2-7.3L5 4Zm3.1 1.7H6.9l9.8 12.6h1.2L8.1 5.7Z" fill="currentColor"/></svg>\
          </a>\
        </div>\
      </div>\
    </div>\
    <div class="sf-legal-strip">\
      <p>© Ridhira Group of Companies. All rights reserved.</p>\
      <p>Privacy Policy &nbsp;·&nbsp; Terms of Use</p>\
    </div>\
  </footer>\
  ';

  mount.outerHTML = FOOTER_HTML;
})();
