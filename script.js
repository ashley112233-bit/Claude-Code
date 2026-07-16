(function () {
  "use strict";

  /* ---------------------------------------------------
     Interactive player-journey demonstration.
     Visual demonstration only: nothing selected here is
     stored, saved or transmitted anywhere.
  --------------------------------------------------- */

  var questions = [
    {
      text: "How did the surface play?",
      options: ["Slow", "Medium", "Fast"]
    },
    {
      text: "Did lighting affect ball visibility?",
      options: ["No", "Slightly", "Significantly"]
    },
    {
      text: "Did the roof interfere with play?",
      options: ["Never", "Occasionally", "Frequently"]
    }
  ];

  var currentQuestionIndex = 0;

  var stage1 = document.querySelector('[data-stage="1"]');
  var stage2 = document.querySelector('[data-stage="2"]');
  var stage3 = document.querySelector('[data-stage="3"]');
  var questionHeading = document.getElementById("demo-question");
  var optionsContainer = document.getElementById("demo-options");
  var startButton = document.getElementById("demo-start");
  var anotherButton = document.getElementById("demo-another");
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
        showStage(stage3);
        setActiveStep(3);
        if (stage3) {
          var heading = stage3.querySelector("h3");
          if (heading) heading.focus();
        }
      });
      optionsContainer.appendChild(button);
    });
  }

  if (startButton) {
    startButton.addEventListener("click", function () {
      renderQuestion();
      showStage(stage2);
      setActiveStep(2);
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
