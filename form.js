/* ═══════════════════════════════════════════════════════════════
   RIDHIRA RETREATS — ENQUIRY FORM HANDLER
   form.js · v2.0

   Flow:
     1.  User clicks submit
     2.  Validate all required fields (inline errors, no alert())
     3.  Disable button + show spinner ("Sending…")
     4.  POST to API
     5a. 200 OK  → fade form out, fade success panel in
     5b. Non-200 / network error → show inline error banner, re-enable button
═══════════════════════════════════════════════════════════════ */

/* ─── Validation helpers ──────────────────────────────────────── */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(raw) {
  return String(raw || "").replace(/[^\d+]/g, "").trim();
}

function isValidPhone(raw) {
  const p = normalizePhone(raw);
  return (
    /^[6-9]\d{9}$/.test(p) ||
    /^\+91[6-9]\d{9}$/.test(p) ||
    /^91[6-9]\d{9}$/.test(p) ||
    /^0[6-9]\d{9}$/.test(p)
  );
}

function toE164India(raw) {
  const p = normalizePhone(raw);
  if (/^\+91/.test(p)) return p;
  if (/^[6-9]\d{9}$/.test(p)) return "+91" + p;
  if (/^91\d{10}$/.test(p)) return "+" + p;
  if (/^0\d{10}$/.test(p)) return "+91" + p.slice(1);
  return p;
}

/* ─── Inline field-level error helpers ───────────────────────── */

/**
 * Show a red-underline + message below a field.
 * Creates the .error-text element once and reuses it on subsequent calls.
 */
function showFieldError(input, message) {
  // Prefer the field's own wrapper (label > input, div > input, etc.)
  const wrapper = input.closest(".field-wrap") || input.parentElement;

  let err = wrapper.querySelector(".field-error-msg");
  if (!err) {
    err = document.createElement("p");
    err.className = "field-error-msg";
    err.setAttribute("aria-live", "polite");
    err.style.cssText = [
      "font-size:11px",
      "color:#D5B881",          // gold — matches your palette
      "margin:5px 0 0",
      "letter-spacing:0.06em",
      "transition:opacity 0.3s ease",
    ].join(";");
    wrapper.appendChild(err);
  }

  err.textContent = message;
  err.style.opacity = "1";
  input.setAttribute("aria-invalid", "true");

  // Visual: red-underline on the input
  input.style.borderBottomColor = "rgba(185,60,60,0.7)";
}

function clearFieldError(input) {
  const wrapper = input.closest(".field-wrap") || input.parentElement;
  const err = wrapper?.querySelector(".field-error-msg");
  if (err) {
    err.style.opacity = "0";
    setTimeout(() => { err.textContent = ""; }, 300);
  }
  input.removeAttribute("aria-invalid");
  input.style.borderBottomColor = "";
}

/* Clear errors live as the user types */
function attachLiveClearing(form) {
  form.querySelectorAll("input, select, textarea").forEach(el => {
    el.addEventListener("input", () => clearFieldError(el));
    el.addEventListener("change", () => clearFieldError(el));
  });
}

/* ─── Form-level error banner ─────────────────────────────────── */

/**
 * Show a dismissible error banner above the submit button.
 * Automatically hides after `ttl` ms (default 8 s).
 */
function showFormError(form, message, ttl = 8000) {
  let banner = form.querySelector(".form-error-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.className = "form-error-banner";
    banner.setAttribute("role", "alert");
    banner.style.cssText = [
      "display:flex",
      "align-items:center",
      "gap:12px",
      "padding:14px 18px",
      "margin-top:20px",
      "border:0.5px solid rgba(185,60,60,0.4)",
      "background:rgba(185,60,60,0.08)",
      "font-size:12px",
      "letter-spacing:0.06em",
      "color:rgba(245,235,210,0.75)",
      "opacity:0",
      "transform:translateY(6px)",
      "transition:opacity 0.4s ease,transform 0.4s ease",
    ].join(";");

    // Place the banner just before the submit button
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      form.insertBefore(banner, submitBtn);
    } else {
      form.appendChild(banner);
    }
  }

  banner.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
         style="flex-shrink:0" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="rgba(185,60,60,0.8)" stroke-width="1.2"/>
      <path d="M7 4v3.5M7 9.5v.5" stroke="rgba(185,60,60,0.8)"
            stroke-width="1.4" stroke-linecap="round"/>
    </svg>
    <span>${message}</span>`;

  requestAnimationFrame(() => {
    banner.style.opacity = "1";
    banner.style.transform = "translateY(0)";
  });

  clearTimeout(banner._hideTimer);
  banner._hideTimer = setTimeout(() => {
    banner.style.opacity = "0";
    banner.style.transform = "translateY(6px)";
  }, ttl);
}

function hideFormError(form) {
  const banner = form.querySelector(".form-error-banner");
  if (banner) {
    banner.style.opacity = "0";
    banner.style.transform = "translateY(6px)";
  }
}

/* ─── Button loading state ────────────────────────────────────── */

/**
 * Toggle the submit button between "idle" and "loading" states.
 * Preserves original label so it can be restored.
 */
function setButtonLoading(btn, loading) {
  if (loading) {
    btn._originalText = btn.textContent.trim();
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    btn.style.opacity = "0.65";
    btn.style.cursor = "not-allowed";
    btn.innerHTML = `
      <span style="
        display:inline-flex;align-items:center;gap:8px;
        pointer-events:none
      ">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
             aria-hidden="true"
             style="animation:rr-spin 0.8s linear infinite">
          <circle cx="7" cy="7" r="5.5"
                  stroke="currentColor" stroke-width="1.4"
                  stroke-dasharray="20 14"
                  stroke-linecap="round"/>
        </svg>
        Sending…
      </span>`;
  } else {
    btn.disabled = false;
    btn.removeAttribute("aria-busy");
    btn.style.opacity = "";
    btn.style.cursor = "";
    btn.textContent = btn._originalText || "Submit";
  }
}

/* Keyframe for spinner — injected once */
(function injectSpinnerKeyframe() {
  if (document.getElementById("rr-spin-style")) return;
  const s = document.createElement("style");
  s.id = "rr-spin-style";
  s.textContent = "@keyframes rr-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(s);
})();

/* ─── Success state ───────────────────────────────────────────── */

/**
 * Fade the form out, then fade the #success-state panel in.
 * Looks for an element with id="success-state" (already in your HTML).
 */
function showSuccess(form) {
  /* Step 1 — Start fading the form out */
  form.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  form.style.opacity    = "0";
  form.style.transform  = "translateY(-10px)";

  /* Step 2 — After form fade completes, hide it and reveal success panel */
  setTimeout(function () {
    form.style.display = "none";

    const panel = document.getElementById("success-state");
    if (!panel) {
      console.error("[form.js] #success-state element not found in DOM");
      return;
    }

    /* Remove any lingering inline display:none (defensive).
       The CSS class .success-state already sets display:none;
       .success-state.active overrides it with display:flex.
       We also force via inline style as a belt-and-suspenders approach. */
    panel.style.removeProperty("display");
    panel.classList.add("active");          /* .success-state.active { display:flex } */

    /* Set up the fade-in BEFORE making it visible, then
       force a reflow so the browser registers the opacity:0 state,
       THEN transition to opacity:1 in the next frame.
       Without the forced reflow, browser batches 0→1 in one frame
       and the CSS transition never fires. */
    panel.style.opacity    = "0";
    panel.style.transform  = "translateY(14px)";
    panel.style.transition = "opacity 0.55s ease, transform 0.55s ease";

    /* Force reflow — this ensures opacity:0 is "painted" before we
       schedule the transition to opacity:1                         */
    void panel.getBoundingClientRect();

    /* Now trigger the visible transition */
    requestAnimationFrame(function () {
      panel.style.opacity   = "1";
      panel.style.transform = "translateY(0)";
    });

    console.log("[form.js] Success panel shown ✓");
  }, 400);
}

/* ─── Network POST ────────────────────────────────────────────── */

const API_URL =
  "https://zap-to-crm-h3hbhrduerb8fwgw.centralindia-01.azurewebsites.net/api/zap-to-zoho";

/**
 * POST payload to API.
 * Throws if the HTTP status is not 2xx.
 */
async function postToAPI(payload) {
  /* ── Log full payload before sending so backend mismatch is visible ── */
  console.group("[form.js] Submitting enquiry");
  console.log("Endpoint :", API_URL);
  console.log("Payload  :", JSON.stringify(payload, null, 2));
  console.groupEnd();

  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    console.error("[form.js] Network / CORS error:", networkErr.message);
    throw new Error("NETWORK_ERROR");
  }

  /* ── Always read the response body, even on 200 ────────────────────
     Some backends return 200 with a body like:
       "Failed to create lead"
       {"success":false,"error":"Zoho token expired"}
     We must check the body, not just the HTTP status.           ── */
  const rawBody = await res.text().catch(() => "");

  console.group("[form.js] API Response");
  console.log("HTTP status :", res.status);
  console.log("Body        :", rawBody);
  console.groupEnd();

  /* Non-2xx → always an error */
  if (!res.ok) {
    throw new Error(`API_ERROR_${res.status} — ${rawBody}`);
  }

  /* 2xx but body signals failure */
  let parsed = null;
  try { parsed = JSON.parse(rawBody); } catch (_) { /* plain text body */ }

  if (parsed !== null) {
    /* JSON body — check common error patterns */
    const isFailure =
      parsed.success     === false       ||
      parsed.status      === "error"     ||
      parsed.error       != null         ||
      parsed.statusCode  >= 400          ||
      (parsed.code && parsed.code !== "SUCCESS");

    if (isFailure) {
      const reason = parsed.error || parsed.message || parsed.statusMessage || rawBody;
      console.error("[form.js] CRM rejected the lead:", reason);
      throw new Error("CRM_ERROR — " + reason);
    }
  } else {
    /* Plain-text body — flag obvious failure strings */
    const lower = rawBody.toLowerCase();
    if (
      lower.includes("error")   ||
      lower.includes("failed")  ||
      lower.includes("invalid") ||
      lower.includes("unauthor")
    ) {
      console.error("[form.js] API returned failure text:", rawBody);
      throw new Error("CRM_ERROR — " + rawBody);
    }
  }

  /* Looks good */
  console.log("[form.js] Lead submitted to CRM ✓");
  return rawBody;
}

/* ─── Main form handler ───────────────────────────────────────── */

(function () {
  const FORM_ID = "enquiry-form";

  /* Static payload fields that never change per submission */
  const CONSTANTS = {
    "Lead Source": "online advertising",
    subsource: "Google_Ads",
    Brand: "Ridhira",
    "Lead Type": "Retreat Enquiry",
    "Page Source": window.location.pathname,
  };

  const UTM_KEYS = [
    "utm_campaign", "utm_content", "utm_device", "utm_keyword",
    "utm_medium", "utm_network", "utm_source", "utm_term",
  ];

  const qs = new URLSearchParams(window.location.search);

  /* Helper: get trimmed value of a form field by id */
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  /* Helper: all checked wellness interest checkboxes → comma-joined string */
  function getSelectedInterests() {
    return Array.from(
      document.querySelectorAll('input[name="Wellness Interests"]:checked')
    )
      .map((el) => el.value)
      .join(", ");
  }

  /* ── Validation ─────────────────────────────────────────────── */

  /**
   * Validates all required fields.
   * Shows inline errors for each invalid field.
   * Returns true only if everything passes.
   */
  function validate(form) {
    let valid = true;

    const required = [
      { id: "f-name",     label: "Name is required" },
      { id: "f-email",    label: "Email is required" },
      { id: "f-phone",    label: "Phone number is required" },
      { id: "f-country",  label: "Please select a country" },
      { id: "f-retreat",  label: "Please select a retreat" },
      { id: "f-checkin",  label: "Check-in date is required" },
      { id: "f-checkout", label: "Check-out date is required" },
    ];

    required.forEach(({ id, label }) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        showFieldError(el, label);
        valid = false;
      }
    });

    // Format checks (only if the field has a value)
    const emailEl = document.getElementById("f-email");
    if (emailEl?.value.trim() && !isValidEmail(emailEl.value.trim())) {
      showFieldError(emailEl, "Please enter a valid email address");
      valid = false;
    }

    const phoneEl = document.getElementById("f-phone");
    if (phoneEl?.value.trim() && !isValidPhone(phoneEl.value.trim())) {
      showFieldError(phoneEl, "Enter a valid 10-digit Indian mobile number");
      valid = false;
    }

    // Date range check
    const checkin  = document.getElementById("f-checkin");
    const checkout = document.getElementById("f-checkout");
    if (
      checkin?.value &&
      checkout?.value &&
      checkout.value < checkin.value
    ) {
      showFieldError(checkout, "Check-out must be after check-in");
      valid = false;
    }

    return valid;
  }

  /* ── Init ────────────────────────────────────────────────────── */

  function init() {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    /* Clear field errors as the user types */
    attachLiveClearing(form);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      /* ── 1. Validate ─────────────────────────── */
      const ok = validate(form);
      if (!ok) {
        // Scroll the first error into view
        const firstErr = form.querySelector("[aria-invalid='true']");
        firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      /* ── 2. Lock UI ──────────────────────────── */
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) setButtonLoading(submitBtn, true);
      hideFormError(form);

      /* ── 3. Build payload ────────────────────── */
      const payload = {
        ...CONSTANTS,

        "Full Name":   getVal("f-name"),
        Email:         getVal("f-email"),
        "Phone Number": toE164India(getVal("f-phone")),

        Country:       getVal("f-country"),
        Retreat:       getVal("f-retreat"),
        Duration:      getVal("f-duration"),
        Checkin:       getVal("f-checkin"),
        Checkout:      getVal("f-checkout"),
        Guests:        document.getElementById("f-guests")?.value || "",
        Message:       getVal("f-message"),
        "Wellness Interests": getSelectedInterests(),
      };

      // Attach UTM parameters from URL query string
      UTM_KEYS.forEach((k) => {
        payload[k] = qs.get(k) || "";
      });

      /* ── 4. Submit ───────────────────────────── */
      try {
        await postToAPI(payload);

        /* ── 5a. SUCCESS ─────────────────────────
           Only reached if postToAPI resolved without throwing.
           Show the success state NOW. */
        showSuccess(form);

      } catch (err) {
        /* ── 5b. FAILURE ─────────────────────────
           Re-enable the button and show a friendly error. */
        if (submitBtn) setButtonLoading(submitBtn, false);

        /* Map error codes to friendly user messages */
        let userMessage;
        if (err.message === "NETWORK_ERROR") {
          userMessage = "Network error — please check your connection and try again.";
        } else if (err.message.startsWith("CRM_ERROR")) {
          userMessage = "We received your details but could not save your enquiry. Please call or email us directly — details on the left.";
        } else {
          userMessage = "Something went wrong on our end. Please try again in a moment.";
        }

        showFormError(form, userMessage);

        /* Full error logged for debugging — check browser Console → [form.js] */
        console.error("[form.js] Submission failed:", err.message);
      }
    });
  }

  /* Run after DOM is ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
