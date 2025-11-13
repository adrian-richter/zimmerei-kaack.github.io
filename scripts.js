
// === YEAR UPDATE ===
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================
   NAVIGATION: SCROLL + TRANSPARENCY + HIDE
========================================= */
(function () {
  const nav = document.getElementById("nav");
  let lastY = window.scrollY;

  function updateNav() {
    const y = window.scrollY;
    const goingDown = y > lastY;

    if (y > 80) {
      nav.classList.add("solid");
      nav.classList.remove("transparent");
    } else {
      nav.classList.add("transparent");
      nav.classList.remove("solid");
    }

    if (goingDown && y > 320) {
      nav.classList.add("hidden");
    } else {
      nav.classList.remove("hidden");
    }

    lastY = y;
  }

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();
})();

/* =========================================
   CAPTCHA LOGIK (Kontaktformular)
========================================= */
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  const solution = a + b;

  const spanA = document.getElementById("captcha-a");
  const spanB = document.getElementById("captcha-b");
  const input = document.getElementById("captcha-input");

  if (spanA && spanB) {
    spanA.textContent = a;
    spanB.textContent = b;
  }

  form.addEventListener("submit", function (e) {
    const value = parseInt(input.value, 10);
    if (isNaN(value) || value !== solution) {
      e.preventDefault();
      alert("Bitte beantworten Sie die Sicherheitsfrage korrekt.");
      input.focus();
    }
  });
})();

/* =========================================
   MODALS FOR LEISTUNGEN
========================================= */
(function () {
  const overlay = document.getElementById("modalOverlay");
  const triggers = document.querySelectorAll(".open-modal[data-modal]");

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("show"));
    modal.hidden = false;

    document.body.classList.add("modal-open");

    const focusTarget = modal.querySelector(".modal-close") || modal;
    focusTarget.focus?.();
  }

  function closeAll() {
    document.querySelectorAll(".modal:not([hidden])").forEach((m) => {
      m.hidden = true;
    });

    overlay.classList.remove("show");
    setTimeout(() => (overlay.hidden = true), 200);
    document.body.classList.remove("modal-open");
  }

  triggers.forEach((el) => {
    el.addEventListener("click", () => openModal(el.dataset.modal));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(el.dataset.modal);
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeAll();
    if (e.target === overlay) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
})();

/* =========================================
   BADGE "Website im Umbau"
========================================= */
(function () {
  const badge = document.getElementById("statusBadge");
  const bubble = document.getElementById("statusPopover");

  if (!badge || !bubble) return;

  let visible = false;

  function toggle() {
    visible = !visible;
    bubble.hidden = !visible;
  }

  badge.addEventListener("click", toggle);

  setTimeout(() => {
    bubble.hidden = false;
    visible = true;
  }, 600);

  setTimeout(() => {
    bubble.hidden = true;
    visible = false;
  }, 5200);
})();

/* =========================================
   COOKIE-CONSENT SYSTEM
========================================= */
(function () {
  const STORAGE_KEY = "cookieConsent.v1";

  const banner = document.getElementById("cookieBanner");
  const modal = document.getElementById("cookieModal");
  const backdrop = document.getElementById("cookieBackdrop");

  const btnOpen = document.getElementById("btnCookieSettings");
  const btnAcc = document.getElementById("btnCookieAccept");
  const btnRej = document.getElementById("btnCookieReject");

  const tglAna = document.getElementById("toggleAnalytics");
  const tglMkt = document.getElementById("toggleMarketing");

  const btnSave = document.getElementById("btnSavePrefs");
  const btnAccAll = document.getElementById("btnAcceptAll");

  window.CONSENT = {
    get() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
      } catch {
        return null;
      }
    },
    has(scope) {
      const c = this.get();
      return !!(c && c[scope] === true);
    },
  };

  function showBanner() {
    banner.style.display = "block";
  }
  function hideBanner() {
    banner.style.display = "none";
  }

  function openModal() {
    const c = window.CONSENT.get() || {
      analytics: false,
      marketing: false,
    };

    tglAna.checked = !!c.analytics;
    tglMkt.checked = !!c.marketing;

    backdrop.style.display = "block";
    modal.style.display = "grid";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    backdrop.style.display = "none";
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  function saveConsent(consent) {
    const data = {
      analytics: !!consent.analytics,
      marketing: !!consent.marketing,
      timestamp: Date.now(),
      version: "v1",
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    document.documentElement.dataset.consent = JSON.stringify(data);

    if (window.dataLayer)
      window.dataLayer.push({
        event: "consent_update",
        consent: data,
      });

    activateDeferredScripts(data);
  }

  function activateDeferredScripts(consent) {
    document
      .querySelectorAll('script[type="text/plain"][data-consent]')
      .forEach((node) => {
        const need = node.dataset.consent;
        if (consent[need] !== true) return;

        const s = document.createElement("script");
        [...node.attributes].forEach((a) => {
          if (a.name !== "type") s.setAttribute(a.name, a.value);
        });
        s.type = "text/javascript";
        if (node.textContent) s.text = node.textContent;

        node.replaceWith(s);
      });
  }

  const existing = window.CONSENT.get();
  if (existing) {
    hideBanner();
    activateDeferredScripts(existing);
  } else {
    showBanner();
  }

  btnOpen.addEventListener("click", openModal);
  btnAcc.addEventListener("click", () => {
    saveConsent({ analytics: true, marketing: true });
    hideBanner();
  });
  btnRej.addEventListener("click", () => {
    saveConsent({ analytics: false, marketing: false });
    hideBanner();
  });

  btnSave.addEventListener("click", () => {
    saveConsent({
      analytics: tglAna.checked,
      marketing: tglMkt.checked,
    });
    hideBanner();
    closeModal();
  });

  btnAccAll.addEventListener("click", () => {
    saveConsent({ analytics: true, marketing: true });
    hideBanner();
    closeModal();
  });

  backdrop.addEventListener("click", closeModal);
})();
