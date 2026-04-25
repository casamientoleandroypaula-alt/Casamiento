document.documentElement.classList.add("js");

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyVPXkS4-WScu4tME3J6X3b0VanZ7BsW462ZV_Anwgd80h5uReyN4m-htZJNhzLg--ijA/exec";

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navLinks = document.querySelectorAll(".nav a");
const revealElements = document.querySelectorAll(".reveal");
const heroPhotos = document.querySelectorAll(".hero-photo");
const heroSection = document.querySelector(".hero");
const heroSequenceGroups = {
  photos: document.querySelectorAll('[data-seq="photos"]'),
  names: document.querySelectorAll('[data-seq="names"]'),
  details: document.querySelectorAll('[data-seq="details"]'),
};
const pageLoader = document.getElementById("pageLoader");
const copyAliasBtn = document.getElementById("copyAliasBtn");
const aliasText = document.getElementById("aliasText");
const giftAccordion = document.getElementById("giftAccordion");
const giftAccordionTrigger = document.getElementById("giftAccordionTrigger");
const giftAccordionPanel = document.getElementById("giftAccordionPanel");
const toast = document.getElementById("toast");
const musicToggle = document.getElementById("musicToggle");
const music = document.getElementById("bgMusic");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const countdownDays = document.getElementById("days");
const countdownHours = document.getElementById("hours");
const countdownMinutes = document.getElementById("minutes");
const countdownSeconds = document.getElementById("seconds");

const rsvpForm = document.getElementById("rsvp-form");
const rsvpSubmitBtn = document.getElementById("rsvpSubmitBtn");
const rsvpStatus = document.getElementById("rsvpStatus");
const rsvpEdadField = document.getElementById("edadField");
const rsvpEdadInput = document.getElementById("rsvpEdad");
const rsvpRestriccionDetalleField = document.getElementById("restriccionDetalleField");
const rsvpRestriccionDetalleInput = document.getElementById("rsvpRestriccionDetalle");

const pageStartTime = performance.now();

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
    document.body.classList.toggle("menu-open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      document.body.classList.remove("menu-open");
    });
  });
}

revealElements.forEach((el, index) => {
  if (!reduceMotion.matches) {
    el.style.setProperty("--reveal-delay", `${Math.min(index * 55, 220)}ms`);
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -5% 0px",
  }
);

revealElements.forEach((el) => observer.observe(el));

setupHeroParallax();
setupClosingParallax();
setupMusicControls();
setupOpeningExperience();
setupRsvpForm();
warmupRsvpScript();
setupCountdown();
setupGiftAccordion();

if (copyAliasBtn && aliasText) {
  copyAliasBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(aliasText.textContent.trim());
      showToast("Alias copiado");
    } catch (error) {
      showToast("No se pudo copiar");
    }
  });
}

function setupGiftAccordion() {
  if (!giftAccordion || !giftAccordionTrigger || !giftAccordionPanel) return;

  const syncPanelHeight = () => {
    if (!giftAccordion.classList.contains("is-open")) return;
    giftAccordionPanel.style.maxHeight = `${giftAccordionPanel.scrollHeight}px`;
  };

  const toggleAccordion = () => {
    const isOpen = giftAccordion.classList.toggle("is-open");
    giftAccordionTrigger.setAttribute("aria-expanded", String(isOpen));
    giftAccordionPanel.setAttribute("aria-hidden", String(!isOpen));
    giftAccordionPanel.style.maxHeight = isOpen ? `${giftAccordionPanel.scrollHeight}px` : "0px";
  };

  giftAccordionTrigger.addEventListener("click", toggleAccordion);
  window.addEventListener("resize", syncPanelHeight);
}

function setupOpeningExperience() {
  const launch = () => {
    const elapsed = performance.now() - pageStartTime;
    const minLoaderTime = reduceMotion.matches ? 0 : 1950;
    const waitTime = Math.max(0, minLoaderTime - elapsed);

    window.setTimeout(() => {
      if (pageLoader) {
        pageLoader.classList.add("is-hidden");
        window.setTimeout(() => {
          pageLoader.setAttribute("aria-hidden", "true");
        }, reduceMotion.matches ? 0 : 760);
      }

      runHeroSequence();
    }, waitTime);
  };

  if (document.readyState === "complete") {
    launch();
  } else {
    window.addEventListener("load", launch, { once: true });
  }
}

function runHeroSequence() {
  const immediate = reduceMotion.matches;
  heroSequenceGroups.photos.forEach((el) => el.classList.add("is-visible"));

  if (immediate) {
    [heroSequenceGroups.names, heroSequenceGroups.details].forEach((group) => {
      group.forEach((el) => el.classList.add("is-visible"));
    });
    return;
  }

  const steps = [
    { key: "names", delay: 120 },
    { key: "details", delay: 560 },
  ];

  steps.forEach(({ key, delay }) => {
    window.setTimeout(() => {
      heroSequenceGroups[key].forEach((el) => el.classList.add("is-visible"));
    }, delay);
  });
}

function setupMusicControls() {
  if (!musicToggle || !music) return;

  music.volume = 0.3;
  music.load();

  const setMusicState = (playing) => {
    musicToggle.classList.toggle("is-playing", playing);
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
    musicToggle.querySelector(".music-text").textContent = playing ? "Pausar" : "Música";
    musicToggle.querySelector(".music-icon").textContent = playing ? "❚❚" : "♪";
  };

  async function fadeIn(audio) {
    audio.volume = 0;

    try {
      await audio.play();

      let vol = 0;
      const interval = window.setInterval(() => {
        if (vol < 0.3) {
          vol += 0.02;
          audio.volume = Math.min(vol, 0.3);
        } else {
          window.clearInterval(interval);
        }
      }, 100);

      setMusicState(true);
    } catch (error) {
      setMusicState(false);
      throw error;
    }
  }

  let hasInteracted = false;

  const startMusicOnce = async () => {
    if (hasInteracted) return;

    try {
      hasInteracted = true;
      await fadeIn(music);
    } catch (error) {
      hasInteracted = false;
      setMusicState(false);
    }
  };

  ["pointerdown", "touchend", "click"].forEach((eventName) => {
    document.addEventListener(
      eventName,
      startMusicOnce,
      { once: true, passive: true }
    );
  });

  musicToggle.addEventListener("click", async (event) => {
    event.stopPropagation();
    hasInteracted = true;

    if (music.paused) {
      try {
        await fadeIn(music);
      } catch (error) {
        showToast("Tocá nuevamente para activar el audio");
        hasInteracted = false;
        setMusicState(false);
      }
      return;
    }

    music.pause();
    setMusicState(false);
  });

  music.addEventListener("pause", () => setMusicState(false));
  music.addEventListener("play", () => setMusicState(true));
}

function warmupRsvpScript() {
  const warmupImage = new Image();
  const separator = SCRIPT_URL.includes("?") ? "&" : "?";

  warmupImage.onload = () => {};
  warmupImage.onerror = () => {};
  warmupImage.src = `${SCRIPT_URL}${separator}warmup=1&t=${Date.now()}`;
}

function setupRsvpForm() {
  if (!rsvpForm || !rsvpSubmitBtn || !rsvpStatus) return;

  let successButtonTimer = null;
  let duplicateCheckInProgress = false;
  let isSubmittingLocked = false;

  const setTransitionFieldVisibility = (wrapper, shouldShow, input) => {
    if (!wrapper) return;
    wrapper.classList.toggle("is-hidden", !shouldShow);
    wrapper.setAttribute("aria-hidden", String(!shouldShow));
    if (!shouldShow && input) input.value = "";
  };

  const syncConditionalRsvpFields = () => {
    const selectedTipoInvitado = rsvpForm.querySelector('input[name="tipoInvitado"]:checked')?.value || "";
    const selectedRestriccion = rsvpForm.querySelector('input[name="restriccionOpcion"]:checked')?.value || "";

    setTransitionFieldVisibility(rsvpEdadField, selectedTipoInvitado === "menor", rsvpEdadInput);
    setTransitionFieldVisibility(
      rsvpRestriccionDetalleField,
      selectedRestriccion === "si",
      rsvpRestriccionDetalleInput
    );
  };

  rsvpForm.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.name === "tipoInvitado" || target.name === "restriccionOpcion") {
      syncConditionalRsvpFields();
    }
  });

  syncConditionalRsvpFields();

  rsvpForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isSubmittingLocked) return;
    isSubmittingLocked = true;

    if (duplicateCheckInProgress) {
      isSubmittingLocked = false;
      return;
    }

    const formData = new FormData(rsvpForm);
    const rawNombre = String(formData.get("nombre") || "").trim();
    const rawDni = String(formData.get("dni") || "").trim();
    const tipoInvitado = String(formData.get("tipoInvitado") || "").trim();
    const rawEdad = String(formData.get("edad") || "").trim();
    const restriccionOpcion = String(formData.get("restriccionOpcion") || "").trim();
    const restriccionDetalle = String(formData.get("restriccionDetalle") || "").trim();

    if (!rawNombre) {
      setRsvpStatus("error", "Completá tu nombre y apellido.");
      isSubmittingLocked = false;
      return;
    }

    if (!/^\d+$/.test(rawDni)) {
      setRsvpStatus("error", "El DNI es obligatorio y debe ser numérico.");
      isSubmittingLocked = false;
      return;
    }

    if (tipoInvitado !== "adulto" && tipoInvitado !== "menor") {
      setRsvpStatus("error", "Seleccioná el tipo de invitado.");
      isSubmittingLocked = false;
      return;
    }

    if (tipoInvitado === "menor") {
      if (!/^\d+$/.test(rawEdad)) {
        setRsvpStatus("error", "Si el invitado es menor, la edad es obligatoria y debe ser un número entero.");
        isSubmittingLocked = false;
        return;
      }

      const parsedEdad = Number.parseInt(rawEdad, 10);

      if (!Number.isInteger(parsedEdad) || parsedEdad <= 0) {
        setRsvpStatus("error", "Si el invitado es menor, la edad debe ser un entero mayor a 0.");
        isSubmittingLocked = false;
        return;
      }
    }

    if (restriccionOpcion !== "no" && restriccionOpcion !== "si") {
      setRsvpStatus("error", "Indicá si tiene restricción alimentaria.");
      isSubmittingLocked = false;
      return;
    }

    if (restriccionOpcion === "si" && !restriccionDetalle) {
      setRsvpStatus("error", "Completá el detalle de la restricción alimentaria.");
      isSubmittingLocked = false;
      return;
    }

    clearTimeout(successButtonTimer);
    setRsvpSubmittingState(true, "Enviando...");
    setRsvpStatus("loading", "Verificando DNI...");

    duplicateCheckInProgress = true;

    checkDniExists(rawDni, (result) => {
      duplicateCheckInProgress = false;

      if (!result || result.ok !== true) {
        setRsvpStatus("error", "Ocurrió un error. Intentá nuevamente.");
        setRsvpSubmittingState(false);
        isSubmittingLocked = false;
        return;
      }

      if (result.exists) {
        setRsvpStatus("error", "Este DNI ya fue registrado.");
        setRsvpSubmittingState(false);
        isSubmittingLocked = false;
        return;
      }

      setRsvpStatus("loading", "Enviando confirmación...");

      // Envío real al Apps Script con iframe oculto, sin cambiar el layout
      const iframeName = "rsvp_submit_iframe";
      let submitFrame = document.querySelector(`iframe[name="${iframeName}"]`);

      if (!submitFrame) {
        submitFrame = document.createElement("iframe");
        submitFrame.name = iframeName;
        submitFrame.style.display = "none";
        document.body.appendChild(submitFrame);
      }

      const originalTarget = rsvpForm.getAttribute("target");
      rsvpForm.setAttribute("target", iframeName);
      rsvpForm.submit();

      // Restaurar target original
      if (originalTarget !== null) {
        rsvpForm.setAttribute("target", originalTarget);
      } else {
        rsvpForm.removeAttribute("target");
      }

      // Como ya validamos que no está duplicado y el submit está funcionando en Sheets,
      // damos éxito visual estable.
      window.setTimeout(() => {
        rsvpForm.reset();
        syncConditionalRsvpFields();
        setRsvpStatus("success", "¡Gracias por confirmar! Nos hace muy felices que nos acompañes ❤️");
        rsvpStatus.classList.remove("is-success");
        void rsvpStatus.offsetWidth;
        rsvpStatus.classList.add("is-success");
        setRsvpSubmittingState(true, "Confirmación enviada");
        isSubmittingLocked = false;

        clearTimeout(successButtonTimer);
        successButtonTimer = window.setTimeout(() => {
          setRsvpSubmittingState(false);
        }, 2500);
      }, 900);
    });
  });
}

function checkDniExists(dni, callback) {
  const callbackName = `rsvpCheck_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const script = document.createElement("script");

  let finished = false;

  const cleanup = () => {
    if (script.parentNode) script.parentNode.removeChild(script);
    try {
      delete window[callbackName];
    } catch (e) {
      window[callbackName] = undefined;
    }
  };

  const finish = (payload) => {
    if (finished) return;
    finished = true;
    cleanup();
    callback(payload);
  };

  window[callbackName] = function (data) {
    finish(data);
  };

  script.onerror = function () {
    finish({ ok: false, exists: false });
  };

  const url =
    `${SCRIPT_URL}?mode=checkDni` +
    `&dni=${encodeURIComponent(dni)}` +
    `&callback=${encodeURIComponent(callbackName)}`;

  script.src = url;
  document.body.appendChild(script);

  window.setTimeout(() => {
    finish({ ok: false, exists: false });
  }, 15000);
}

function setRsvpSubmittingState(isSubmitting, buttonText) {
  if (!rsvpSubmitBtn) return;

  rsvpSubmitBtn.disabled = isSubmitting;
  rsvpSubmitBtn.classList.toggle("is-loading", isSubmitting);
  rsvpSubmitBtn.textContent =
    buttonText || (isSubmitting ? "Enviando..." : "Enviar confirmación");
}

function setRsvpStatus(type, message) {
  if (!rsvpStatus) return;

  rsvpStatus.textContent = message;
  rsvpStatus.classList.remove("is-success", "is-error", "is-loading");

  if (type === "success") rsvpStatus.classList.add("is-success");
  if (type === "error") rsvpStatus.classList.add("is-error");
  if (type === "loading") rsvpStatus.classList.add("is-loading");
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function setupHeroParallax() {
  if (!heroSection || !heroPhotos.length) return;
  if (reduceMotion.matches) return;
  if (window.matchMedia("(max-width: 520px)").matches) return;

  let ticking = false;

  const updateParallax = () => {
    const rect = heroSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;

    if (rect.bottom <= 0 || rect.top >= viewportHeight) {
      heroPhotos.forEach((photo) => photo.style.setProperty("--parallax-y", "0px"));
      ticking = false;
      return;
    }

    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const offset = sectionCenter - viewportCenter;
    const progress = Math.max(-1, Math.min(1, offset / viewportHeight));

    heroPhotos.forEach((photo, index) => {
      const direction = index === 0 ? -1 : 1;
      const moveY = progress * 12 * direction;
      photo.style.setProperty("--parallax-y", `${moveY.toFixed(2)}px`);
    });

    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

function setupCountdown() {
  if (!countdownDays || !countdownHours || !countdownMinutes || !countdownSeconds) return;

  const eventDate = new Date("2027-03-27T19:00:00");
  const countdownValues = [
    countdownDays,
    countdownHours,
    countdownMinutes,
    countdownSeconds,
  ];
  const shouldAnimate = !reduceMotion.matches;

  const setCountdownValue = (element, value) => {
    if (!element) return;
    if (element.textContent === value) return;

    element.textContent = value;

    if (!shouldAnimate) return;

    element.classList.remove("is-changing");
    void element.offsetWidth;
    element.classList.add("is-changing");
  };

  if (shouldAnimate) {
    countdownValues.forEach((element) => {
      element.addEventListener("animationend", () => {
        element.classList.remove("is-changing");
      });
    });
  }

  const updateCountdown = () => {
    const now = new Date();
    const distance = eventDate.getTime() - now.getTime();

    if (distance <= 0) {
      setCountdownValue(countdownDays, "00");
      setCountdownValue(countdownHours, "00");
      setCountdownValue(countdownMinutes, "00");
      setCountdownValue(countdownSeconds, "00");
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    setCountdownValue(countdownDays, String(days).padStart(2, "0"));
    setCountdownValue(countdownHours, String(hours).padStart(2, "0"));
    setCountdownValue(countdownMinutes, String(minutes).padStart(2, "0"));
    setCountdownValue(countdownSeconds, String(seconds).padStart(2, "0"));
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

function setupClosingParallax() {
  const closingSection = document.querySelector(".closing");
  if (!closingSection) return;
  if (reduceMotion.matches) return;
  if (window.matchMedia("(max-width: 768px)").matches) return;

  let ticking = false;

  const updateParallax = () => {
    const rect = closingSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;

    if (rect.bottom <= 0 || rect.top >= viewportHeight) {
      closingSection.style.setProperty("--closing-parallax-y", "0px");
      ticking = false;
      return;
    }

    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const offset = sectionCenter - viewportCenter;
    const progress = Math.max(-1, Math.min(1, offset / viewportHeight));
    const moveY = progress * 10;

    closingSection.style.setProperty("--closing-parallax-y", `${moveY.toFixed(2)}px`);
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}
