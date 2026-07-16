(function () {
  'use strict';

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('copyrightYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  function closeNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    primaryNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNav();
      }
    });
  }

  /* ---------- Generic focus-trapping dialog helper ---------- */
  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );
  }

  function trapFocus(container, event) {
    if (event.key !== 'Tab') return;
    var focusable = getFocusable(container);
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightboxImage');
  var lightboxTitle = document.getElementById('lightboxTitle');
  var lightboxDesc = document.getElementById('lightboxDesc');
  var lastFocusedBeforeLightbox = null;

  function openLightbox(trigger) {
    var img = trigger.getAttribute('data-lightbox-img');
    var title = trigger.getAttribute('data-lightbox-title') || '';
    var desc = trigger.getAttribute('data-lightbox-desc') || '';

    lightboxImage.src = img;
    lightboxImage.alt = title;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;

    lastFocusedBeforeLightbox = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    var closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.style.overflow = '';
    if (lastFocusedBeforeLightbox) {
      lastFocusedBeforeLightbox.focus();
    }
  }

  if (lightbox) {
    document.querySelectorAll('[data-lightbox-img]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        openLightbox(trigger);
      });
    });

    lightbox.querySelectorAll('[data-close-lightbox]').forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') {
        closeLightbox();
      } else {
        trapFocus(lightbox.querySelector('.lightbox__dialog'), event);
      }
    });
  }

  /* ---------- Privacy / Accessibility modals ---------- */
  var modalTriggers = {
    openPrivacy: 'privacyModal',
    openAccessibility: 'accessibilityModal'
  };
  var lastFocusedBeforeModal = null;

  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    lastFocusedBeforeModal = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedBeforeModal) {
      lastFocusedBeforeModal.focus();
    }
  }

  Object.keys(modalTriggers).forEach(function (triggerId) {
    var trigger = document.getElementById(triggerId);
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      openModal(modalTriggers[triggerId]);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (el) {
    el.addEventListener('click', function () {
      closeModal(el.getAttribute('data-close-modal'));
    });
  });

  document.addEventListener('keydown', function (event) {
    var openModalEl = document.querySelector('.modal:not([hidden])');
    if (!openModalEl) return;
    if (event.key === 'Escape') {
      closeModal(openModalEl.id);
    } else {
      trapFocus(openModalEl.querySelector('.modal__dialog'), event);
    }
  });

  /* ---------- Enquiry form ---------- */
  var form = document.getElementById('enquiryForm');
  var formStatus = document.getElementById('formStatus');

  function setError(fieldId, message) {
    var errorEl = document.getElementById('err-' + fieldId);
    if (errorEl) errorEl.textContent = message || '';
  }

  function clearAllErrors() {
    form.querySelectorAll('.field-error').forEach(function (el) {
      el.textContent = '';
    });
  }

  function showStatus(message, isError) {
    formStatus.textContent = message;
    formStatus.classList.add('is-visible');
    formStatus.classList.toggle('is-error', !!isError);
  }

  function validate(data) {
    var valid = true;
    var firstInvalid = null;

    function fail(fieldId, message, el) {
      setError(fieldId, message);
      valid = false;
      if (!firstInvalid) firstInvalid = el;
    }

    if (!data.fullName.trim()) {
      fail('fullName', 'Please enter your name.', form.elements['fullName']);
    }

    var emailValue = data.email.trim();
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      fail('email', 'Please enter your email address.', form.elements['email']);
    } else if (!emailPattern.test(emailValue)) {
      fail('email', 'Please enter a valid email address.', form.elements['email']);
    }

    if (!data.jewelleryType) {
      fail('jewelleryType', 'Please choose a type of jewellery.', form.elements['jewelleryType']);
    }

    if (!data.orderType) {
      fail('orderType', 'Please choose ready-made or bespoke.', form.querySelector('input[name="orderType"]'));
    }

    if (!data.budget) {
      fail('budget', 'Please choose a budget range.', form.elements['budget']);
    }

    if (!data.consent) {
      fail('consent', 'Please confirm you are happy for us to use these details to reply.', form.elements['consent']);
    }

    return { valid: valid, firstInvalid: firstInvalid };
  }

  function buildEmailBody(data) {
    var lines = [
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
      data.message || '(No message added)'
    ];
    return lines.join('\n');
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearAllErrors();
      formStatus.classList.remove('is-visible', 'is-error');

      var formData = new FormData(form);

      // Honeypot check: if this hidden field has been filled in, quietly stop.
      if (formData.get('website')) {
        return;
      }

      var data = {
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
        consent: formData.get('consent') === 'on'
      };

      var result = validate(data);
      if (!result.valid) {
        showStatus('Please check the highlighted fields and try again.', true);
        if (result.firstInvalid) result.firstInvalid.focus();
        return;
      }

      var subject = 'C J Jewellery enquiry';
      var body = buildEmailBody(data);
      var mailtoUrl = 'mailto:cmjosephs@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      window.location.href = mailtoUrl;

      showStatus(
        'Your email application should now have opened with your enquiry ready to send. ' +
        'Please check the message and press send from your own email application. ' +
        'If nothing opened, please email cmjosephs@gmail.com directly.',
        false
      );
    });
  }
})();
