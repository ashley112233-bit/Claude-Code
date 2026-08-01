import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createIcons, ChevronLeft, ChevronRight, Play, Pause, Menu, X } from 'lucide';
import { createAssembly, paintSwatch } from './beads.js';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

// Images (including lazily-loaded ones) change document layout after they
// finish loading, which can leave earlier ScrollTrigger start positions
// stale. Refresh once everything has settled.
window.addEventListener('load', () => ScrollTrigger.refresh());
document.querySelectorAll('img').forEach((img) => {
  if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});

createIcons({ icons: { ChevronLeft, ChevronRight, Play, Pause, Menu, X } });

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = () => reducedMotionQuery.matches;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ============================================================
   Footer year
   ============================================================ */
const yearEl = document.getElementById('copyrightYear');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ============================================================
   Cinematic opening sequence
   ============================================================ */
(function cinematicHero() {
  const root = document.getElementById('cinematic');
  if (!root) return;

  const scenes = Array.from(root.querySelectorAll('.cinematic__scene'));
  const dashes = Array.from(root.querySelectorAll('.cinematic__dash'));
  const prevBtn = document.getElementById('scenePrev');
  const nextBtn = document.getElementById('sceneNext');
  const playPauseBtn = document.getElementById('scenePlayPause');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');

  const SCENE_DURATION = 3400; // ms — 4 scenes ≈ 13.6s total, within the 10–14s brief
  let index = 0;
  let playing = !prefersReducedMotion();
  let dashTween = null;
  let advanceTimer = null;

  function setActive(newIndex, { manual = false } = {}) {
    scenes[index].classList.remove('is-active');
    index = (newIndex + scenes.length) % scenes.length;
    scenes[index].classList.add('is-active');
    // The closing scene is light; the controls and outlined button sitting
    // over it have to switch from pearl to ink to stay visible.
    root.classList.toggle('is-final', scenes[index].classList.contains('cinematic__scene--final'));

    dashes.forEach((dash, i) => {
      dash.classList.toggle('is-done', i < index);
      const fill = dash.querySelector('.cinematic__dash-fill');
      if (i === index) {
        gsap.set(fill, { width: '0%' });
      } else if (i < index) {
        gsap.set(fill, { width: '100%' });
      } else {
        gsap.set(fill, { width: '0%' });
      }
    });

    if (manual) restartTimer();
  }

  function tweenActiveDash() {
    const fill = dashes[index].querySelector('.cinematic__dash-fill');
    if (dashTween) dashTween.kill();
    gsap.set(fill, { width: '0%' });
    dashTween = gsap.to(fill, { width: '100%', duration: SCENE_DURATION / 1000, ease: 'none' });
  }

  function clearTimer() {
    if (advanceTimer) clearInterval(advanceTimer);
    advanceTimer = null;
    if (dashTween) dashTween.pause();
  }

  function startTimer() {
    if (!playing || document.hidden) return;
    tweenActiveDash();
    advanceTimer = setInterval(() => {
      setActive(index + 1);
      tweenActiveDash();
    }, SCENE_DURATION);
  }

  function restartTimer() {
    clearTimer();
    startTimer();
  }

  function setPlaying(next) {
    playing = next;
    playIcon.style.display = playing ? 'none' : 'block';
    pauseIcon.style.display = playing ? 'block' : 'none';
    playPauseBtn.setAttribute('aria-label', playing ? 'Pause the introduction' : 'Play the introduction');
    if (playing) {
      if (dashTween) dashTween.resume();
      if (!advanceTimer) startTimer();
    } else {
      clearTimer();
    }
  }

  prevBtn.addEventListener('click', () => setActive(index - 1, { manual: true }));
  nextBtn.addEventListener('click', () => setActive(index + 1, { manual: true }));
  playPauseBtn.addEventListener('click', () => setPlaying(!playing));
  dashes.forEach((dash) => {
    dash.addEventListener('click', () => {
      setActive(Number(dash.dataset.index), { manual: true });
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimer();
    } else if (playing) {
      startTimer();
    }
  });

  reducedMotionQuery.addEventListener('change', (e) => {
    setPlaying(!e.matches);
  });

  // Initial state
  setActive(0);
  if (prefersReducedMotion()) {
    setPlaying(false);
  } else {
    startTimer();
  }
})();

/* ============================================================
   Header: transparent -> solid on scroll, mobile nav
   ============================================================ */
(function header() {
  const header = document.getElementById('siteHeader');
  const cinematic = document.getElementById('cinematic');
  if (!header || !cinematic) return;

  function onScroll() {
    const threshold = cinematic.offsetHeight - 90;
    header.classList.toggle('is-solid', window.scrollY > threshold);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const iconMenu = document.getElementById('navToggleIconMenu');
  const iconClose = document.getElementById('navToggleIconClose');

  function closeNav() {
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    iconMenu.style.display = 'block';
    iconClose.style.display = 'none';
  }
  function openNav() {
    primaryNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    iconMenu.style.display = 'none';
    iconClose.style.display = 'block';
  }
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });
  primaryNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
})();

/* ============================================================
   Scroll reveals (GSAP ScrollTrigger, reduced-motion aware)
   ============================================================ */
const mm = gsap.matchMedia();

mm.add(
  { reduced: '(prefers-reduced-motion: reduce)', full: '(prefers-reduced-motion: no-preference)' },
  (context) => {
    const { reduced } = context.conditions;

    document.querySelectorAll('.reveal').forEach((el, i) => {
      if (reduced) {
        el.classList.add('is-visible');
        gsap.set(el, { clearProps: 'all' });
        return;
      }
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => el.classList.add('is-visible'),
      });
    });

    // staggered gallery pieces
    document.querySelectorAll('.piece').forEach((el, i) => {
      if (reduced) return;
      const mask = el.querySelector('.piece__mask');
      gsap.fromTo(
        mask,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.1,
          ease: 'power3.out',
          delay: (i % 3) * 0.12,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onComplete: () => gsap.set(mask, { clearProps: 'clipPath' }),
        }
      );
    });

    // timeline
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      const stops = timeline.querySelectorAll('.timeline__stop');
      const fill = document.getElementById('timelineFill');
      if (reduced) {
        stops.forEach((s) => s.classList.add('is-visible'));
        if (fill) { fill.style.width = '100%'; fill.style.height = '100%'; }
      } else {
        ScrollTrigger.create({
          trigger: timeline,
          start: 'top 75%',
          end: 'bottom 60%',
          once: true,
          onEnter: () => {
            stops.forEach((stop, i) => {
              gsap.delayedCall(i * 0.22, () => stop.classList.add('is-visible'));
            });
            if (fill) {
              const isMobile = window.innerWidth <= 820;
              gsap.to(fill, {
                [isMobile ? 'height' : 'width']: '100%',
                duration: 1.4,
                ease: 'power2.out',
              });
            }
          },
        });
      }
    }

    // bracelet-thread "how it works"
    const path = document.querySelector('.thread-route__path');
    const beads = document.querySelectorAll('.thread-route--desktop .thread-bead');
    const mobileBeads = document.querySelectorAll('.thread-route--mobile .thread-bead');
    if (reduced) {
      if (path) path.classList.add('is-drawn');
      beads.forEach((b) => b.classList.add('is-visible'));
      mobileBeads.forEach((b) => b.classList.add('is-visible'));
    } else {
      const routeDesktop = document.querySelector('.thread-route--desktop');
      if (routeDesktop) {
        ScrollTrigger.create({
          trigger: routeDesktop,
          start: 'top 70%',
          once: true,
          onEnter: () => {
            if (path) path.classList.add('is-drawn');
            beads.forEach((b, i) => gsap.delayedCall(0.3 + i * 0.25, () => b.classList.add('is-visible')));
          },
        });
      }
      mobileBeads.forEach((b, i) => {
        ScrollTrigger.create({
          trigger: b,
          start: 'top 85%',
          once: true,
          onEnter: () => b.classList.add('is-visible'),
        });
      });
    }
  }
);

/* ============================================================
   Bead assembly sequence
   ============================================================ */
(function assemblySequence() {
  const section = document.getElementById('assembly');
  const canvas = document.getElementById('assemblyCanvas');
  if (!section || !canvas) return;

  const strand = createAssembly(canvas, { seed: 11 });
  const steps = Array.from(section.querySelectorAll('.assembly__step'));
  const track = document.getElementById('assemblyTrack');
  const photo = section.querySelector('.assembly__photo');

  function setStep(p) {
    const index = p < 0.26 ? 0 : p < 0.58 ? 1 : p < 0.80 ? 2 : 3;
    steps.forEach((step, i) => step.classList.toggle('is-current', i === index));
  }

  // The strand finishes threading well before the end of the scrub, leaving
  // room for the clasp to fasten and for the handover to the photograph.
  const STRAND_COMPLETE_AT = 0.62;

  function applyProgress(p) {
    strand.setProgress(clamp01(p / STRAND_COMPLETE_AT));
    if (track) track.style.transform = `scaleX(${p})`;
    setStep(p);
    // The finished strand dissolves into the real photograph at the very end.
    // The canvas fades out completely so the drawn beads never overlap the
    // photograph — the illustration hands over to the real piece.
    if (photo) {
      const reveal = clamp01((p - 0.76) / 0.16);
      const eased = reveal * reveal * (3 - 2 * reveal); // smoothstep
      photo.style.opacity = String(eased);
      photo.style.transform = `translate(-50%, -50%) scale(${0.985 + eased * 0.015})`;
      canvas.style.opacity = String(1 - eased);
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    strand.resize();
    strand.setProgress(strand.getProgress());
  });
  resizeObserver.observe(canvas);

  gsap.matchMedia().add(
    { reduced: '(prefers-reduced-motion: reduce)', full: '(prefers-reduced-motion: no-preference)' },
    (context) => {
      const { reduced } = context.conditions;

      if (reduced) {
        // No pinning, no scrub: show the completed strand and the photograph.
        section.classList.add('is-static');
        applyProgress(1);
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=200%',
        pin: section.querySelector('.assembly__sticky'),
        scrub: 0.6,
        onUpdate: (self) => applyProgress(self.progress),
        onRefresh: (self) => applyProgress(self.progress),
      });

      applyProgress(0);
      return () => trigger.kill();
    }
  );
})();

/* ============================================================
   Gallery lightbox
   ============================================================ */
(function lightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img = document.getElementById('lightboxImage');
  const title = document.getElementById('lightboxTitle');
  const desc = document.getElementById('lightboxDesc');
  let lastFocused = null;

  function getFocusable(container) {
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  }
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable(container);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(trigger) {
    img.src = trigger.getAttribute('data-lightbox-img');
    const t = trigger.getAttribute('data-lightbox-title') || '';
    img.alt = t;
    title.textContent = t;
    desc.textContent = trigger.getAttribute('data-lightbox-desc') || '';
    lastFocused = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lightbox__close').focus();
  }
  function close() {
    lb.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-lightbox-img]').forEach((trigger) => {
    trigger.addEventListener('click', () => open(trigger));
  });
  lb.querySelectorAll('[data-close-lightbox]').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else trapFocus(lb.querySelector('.lightbox__dialog'), e);
  });
})();

/* ============================================================
   Privacy / Accessibility modals
   ============================================================ */
(function modals() {
  const triggers = { openPrivacy: 'privacyModal', openAccessibility: 'accessibilityModal' };
  let lastFocused = null;

  function getFocusable(container) {
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  }
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable(container);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__close').focus();
  }
  function close(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  Object.entries(triggers).forEach(([triggerId, modalId]) => {
    const trigger = document.getElementById(triggerId);
    if (trigger) trigger.addEventListener('click', () => open(modalId));
  });
  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => close(el.getAttribute('data-close-modal')));
  });
  document.addEventListener('keydown', (e) => {
    const openModal = document.querySelector('.modal:not([hidden])');
    if (!openModal) return;
    if (e.key === 'Escape') close(openModal.id);
    else trapFocus(openModal.querySelector('.modal__dialog'), e);
  });
})();

/* ============================================================
   Bespoke builder — feeds selections into the enquiry form
   ============================================================ */
const bespokeChoices = {
  colours: new Set(),
  bead: null,
  clasp: new Set(),
  gift: new Set(),
  letters: '',
};

function renderChosen() {
  const wrap = document.getElementById('bespokeChosen');
  wrap.innerHTML = '';
  const all = [
    ...bespokeChoices.colours,
    ...(bespokeChoices.bead ? [bespokeChoices.bead] : []),
    ...bespokeChoices.clasp,
    ...bespokeChoices.gift,
    ...(bespokeChoices.letters ? [`"${bespokeChoices.letters}"`] : []),
  ];
  if (!all.length) {
    wrap.innerHTML = '<span class="bespoke__empty">Nothing selected yet</span>';
    return;
  }
  all.forEach((label) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = label;
    wrap.appendChild(tag);
  });
}

(function bespokeBuilder() {
  const colourGroup = document.getElementById('colourSwatches');
  const beadGroup = document.getElementById('beadChips');
  const claspGroup = document.getElementById('claspChips');
  const giftGroup = document.getElementById('giftChips');
  const lettersInput = document.getElementById('bespokeLetters');
  if (!colourGroup) return;

  // Paint each colour option as a real bead rather than a flat circle, so the
  // swatches match the strand in the assembly sequence.
  colourGroup.querySelectorAll('.swatch').forEach((btn) => {
    const c = btn.querySelector('canvas');
    if (c) paintSwatch(c, btn.dataset.bead);
  });

  colourGroup.querySelectorAll('.swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));
      const val = btn.dataset.value;
      pressed ? bespokeChoices.colours.delete(val) : bespokeChoices.colours.add(val);
      renderChosen();
    });
  });

  beadGroup.querySelectorAll('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wasPressed = btn.getAttribute('aria-pressed') === 'true';
      beadGroup.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      if (!wasPressed) {
        btn.setAttribute('aria-pressed', 'true');
        bespokeChoices.bead = btn.dataset.value;
      } else {
        bespokeChoices.bead = null;
      }
      renderChosen();
    });
  });

  [claspGroup, giftGroup].forEach((group, gi) => {
    const store = gi === 0 ? bespokeChoices.clasp : bespokeChoices.gift;
    group.querySelectorAll('.chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));
        const val = btn.dataset.value;
        pressed ? store.delete(val) : store.add(val);
        renderChosen();
      });
    });
  });

  lettersInput.addEventListener('input', () => {
    bespokeChoices.letters = lettersInput.value.trim();
    renderChosen();
  });

  document.getElementById('bespokeToForm').addEventListener('click', (e) => {
    const hasChoices =
      bespokeChoices.colours.size || bespokeChoices.bead || bespokeChoices.clasp.size ||
      bespokeChoices.gift.size || bespokeChoices.letters;
    if (!hasChoices) return; // just scrolls to the form via the href

    const stylePrefs = document.getElementById('stylePrefs');
    const orderTypeBespoke = document.querySelector('input[name="orderType"][value="Bespoke"]');
    const parts = [
      ...bespokeChoices.colours,
      bespokeChoices.bead,
      ...bespokeChoices.clasp,
      ...bespokeChoices.gift,
    ].filter(Boolean);
    if (bespokeChoices.letters) parts.push(`letters/name "${bespokeChoices.letters}"`);
    stylePrefs.value = parts.join(', ');
    if (orderTypeBespoke) orderTypeBespoke.checked = true;

    const wrap = document.getElementById('enquiryChosenWrap');
    const list = document.getElementById('enquiryChosenList');
    list.innerHTML = document.getElementById('bespokeChosen').innerHTML;
    wrap.hidden = false;
  });
})();

/* ============================================================
   Enquiry form — validation + mailto composition
   ============================================================ */
(function enquiryForm() {
  const form = document.getElementById('enquiryForm');
  const formStatus = document.getElementById('formStatus');
  if (!form) return;

  function setError(fieldId, message) {
    const el = document.getElementById('err-' + fieldId);
    if (el) el.textContent = message || '';
  }
  function clearAllErrors() {
    form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
  }
  function showStatus(message, isError) {
    formStatus.textContent = message;
    formStatus.classList.add('is-visible');
    formStatus.classList.toggle('is-error', !!isError);
  }

  function validate(data) {
    let valid = true;
    let firstInvalid = null;
    function fail(fieldId, message, el) {
      setError(fieldId, message);
      valid = false;
      if (!firstInvalid) firstInvalid = el;
    }
    if (!data.fullName.trim()) fail('fullName', 'Please enter your name.', form.elements.fullName);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) fail('email', 'Please enter your email address.', form.elements.email);
    else if (!emailPattern.test(data.email.trim())) fail('email', 'Please enter a valid email address.', form.elements.email);
    if (!data.jewelleryType) fail('jewelleryType', 'Please choose a type of jewellery.', form.elements.jewelleryType);
    if (!data.orderType) fail('orderType', 'Please choose ready-made or bespoke.', form.querySelector('input[name="orderType"]'));
    if (!data.budget) fail('budget', 'Please choose a budget range.', form.elements.budget);
    if (!data.consent) fail('consent', 'Please confirm you are happy for us to use these details to reply.', form.elements.consent);
    return { valid, firstInvalid };
  }

  function buildEmailBody(data) {
    const lines = [
      'New enquiry from the C J Jewellery website',
      '',
      'Name: ' + data.fullName,
      'Email: ' + data.email,
      'Telephone: ' + (data.telephone || 'Not provided'),
      'Type of jewellery: ' + data.jewelleryType,
      'Ready-made or bespoke: ' + data.orderType,
      'Preferred colours or style: ' + (data.stylePrefs || 'Not provided'),
      'Wrist size / measurements: ' + (data.measurements || 'Not provided'),
      'Budget: ' + data.budget,
      'Required by: ' + (data.requiredDate || 'Not specified'),
      '',
      'Message:',
      data.message || '(No message added)',
    ];
    return lines.join('\n');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearAllErrors();
    formStatus.classList.remove('is-visible', 'is-error');

    const formData = new FormData(form);
    if (formData.get('website')) return; // honeypot

    const data = {
      fullName: formData.get('fullName') || '',
      email: formData.get('email') || '',
      telephone: formData.get('telephone') || '',
      jewelleryType: formData.get('jewelleryType') || '',
      orderType: formData.get('orderType') || '',
      stylePrefs: formData.get('stylePrefs') || '',
      measurements: formData.get('measurements') || '',
      budget: formData.get('budget') || '',
      requiredDate: formData.get('requiredDate') || '',
      message: formData.get('message') || '',
      consent: formData.get('consent') === 'on',
    };

    const result = validate(data);
    if (!result.valid) {
      showStatus('Please check the highlighted fields and try again.', true);
      if (result.firstInvalid) result.firstInvalid.focus();
      return;
    }

    const subject = 'C J Jewellery enquiry';
    const body = buildEmailBody(data);
    const mailtoUrl = 'mailto:cmjosephs@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = mailtoUrl;

    showStatus(
      'Your email application should now have opened with your enquiry ready to send. Please check the message and press send from your own email application. If nothing opened, please email cmjosephs@gmail.com directly.',
      false
    );
  });
})();
