(function () {
  "use strict";

  /* ---------------------------------------------------
     Interactive player-journey demonstration.
     Visual demonstration only: nothing selected here is
     stored, saved or transmitted anywhere.
  --------------------------------------------------- */

  var questions = [
    {
      text: "How did the surface feel during this match?",
      options: ["Slow", "Medium", "Fast", "Not sure"]
    },
    {
      text: "Did lighting affect ball visibility?",
      options: ["No", "Slightly", "Significantly", "Not sure"]
    },
    {
      text: "Did the roof interfere with play?",
      options: ["Never", "Occasionally", "Frequently", "Not sure"]
    }
  ];

  var ANSWERED_HEADING = "Thank you. Your answer will contribute to aggregated court information.";
  var ANSWERED_DETAIL = "Individual answers are never published or shown to the venue. Over a full pilot, responses like this build into the aggregated court picture shown below.";
  var SKIPPED_HEADING = "No problem — that's fine.";
  var SKIPPED_DETAIL = "The question is optional. You can always answer next time, and skipping is recorded no differently to any other response.";

  var currentQuestionIndex = 0;

  var stage1 = document.querySelector('[data-stage="1"]');
  var stage2 = document.querySelector('[data-stage="2"]');
  var stage3 = document.querySelector('[data-stage="3"]');
  var questionHeading = document.getElementById("demo-question");
  var optionsContainer = document.getElementById("demo-options");
  var startButton = document.getElementById("demo-start");
  var skipButton = document.getElementById("demo-skip");
  var anotherButton = document.getElementById("demo-another");
  var resultHeading = document.getElementById("demo-result-heading");
  var resultDetail = document.getElementById("demo-result-detail");
  var stepIndicators = document.querySelectorAll("[data-step-indicator]");

  function setActiveStep(stepNumber) {
    stepIndicators.forEach(function (el) {
      var isActive = el.getAttribute("data-step-indicator") === String(stepNumber);
      el.style.borderColor = isActive ? "var(--turquoise-dark)" : "";
      el.style.color = isActive ? "var(--navy)" : "";
      el.style.fontWeight = isActive ? "700" : "";
    });
  }

  function showStage(stage) {
    [stage1, stage2, stage3].forEach(function (el) {
      if (!el) return;
      el.hidden = el !== stage;
    });
  }

  function renderQuestion() {
    var question = questions[currentQuestionIndex];
    if (!questionHeading || !optionsContainer) return;

    questionHeading.textContent = question.text;
    optionsContainer.innerHTML = "";

    question.options.forEach(function (optionLabel) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "demo-option";
      button.textContent = optionLabel;
      button.addEventListener("click", function () {
        showResult(false);
      });
      optionsContainer.appendChild(button);
    });
  }

  function showResult(wasSkipped) {
    if (resultHeading) resultHeading.textContent = wasSkipped ? SKIPPED_HEADING : ANSWERED_HEADING;
    if (resultDetail) resultDetail.textContent = wasSkipped ? SKIPPED_DETAIL : ANSWERED_DETAIL;
    showStage(stage3);
    setActiveStep(3);
    if (resultHeading) resultHeading.focus();
  }

  if (startButton) {
    startButton.addEventListener("click", function () {
      renderQuestion();
      showStage(stage2);
      setActiveStep(2);
    });
  }

  if (skipButton) {
    skipButton.addEventListener("click", function () {
      showResult(true);
    });
  }

  if (anotherButton) {
    anotherButton.addEventListener("click", function () {
      currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
      showStage(stage1);
      setActiveStep(1);
    });
  }

  setActiveStep(1);

  /* ---------------------------------------------------
     Contact modal: opens on button click, closes via
     close button, backdrop click or the Escape key.
  --------------------------------------------------- */

  var openModalButton = document.getElementById("open-contact-modal");
  var closeModalButton = document.getElementById("close-contact-modal");
  var modalBackdrop = document.getElementById("contact-modal-backdrop");
  var modal = document.getElementById("contact-modal");
  var lastFocusedElement = null;

  function openModal() {
    if (!modalBackdrop) return;
    lastFocusedElement = document.activeElement;
    modalBackdrop.hidden = false;
    if (closeModalButton) closeModalButton.focus();
    document.addEventListener("keydown", handleModalKeydown);
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.hidden = true;
    document.removeEventListener("keydown", handleModalKeydown);
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function handleModalKeydown(event) {
    if (event.key === "Escape") {
      closeModal();
    }
  }

  if (openModalButton) {
    openModalButton.addEventListener("click", openModal);
  }

  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", function (event) {
      if (event.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  if (modal) {
    modal.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }
})();
