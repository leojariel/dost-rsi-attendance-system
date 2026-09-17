(function () {
 const form = document.getElementById("registrationForm");
 const progressBar = document.getElementById("progressBar");
 const progressFill = document.getElementById("progressFill");
 const progressDot = document.getElementById("progressDot");
 const progressValue = document.getElementById("progressValue");
 const progressStatus = document.getElementById("progressStatus");
 const continueBtn = document.getElementById("continueBtn");

 const modal = document.getElementById("signatureModal");
 const canvas = document.getElementById("signaturePad");
 const placeholder = document.getElementById("signaturePlaceholder");
 const clearBtn = document.getElementById("clearSignature");
 const cancelBtn = document.getElementById("cancelSignature");
 const closeModalIcon = document.getElementById("closeModalIcon");
 const confirmBtn = document.getElementById("confirmSignature");
 const signatureStatus = document.getElementById("signatureStatus");

 const TOTAL_REQUIRED = 10;

 function isFilled(el) {
  if (!el) return false;
  if (el.type === "checkbox" || el.type === "radio") return el.checked;
  return el.value.trim() !== "";
 }

 function getRequiredGroups() {
  return {
   privacyConsent: [document.getElementById("privacyConsent")],
   firstName: [document.getElementById("firstName")],
   lastName: [document.getElementById("lastName")],
   gender: [document.getElementById("gender")],
   ageRange: Array.from(document.querySelectorAll('input[name="ageRange"]')),
   classification: [document.getElementById("classification")],
   contactEmail: [document.getElementById("contactEmail")],
   visitorType: Array.from(
    document.querySelectorAll('input[name="visitorType"]'),
   ),
   affiliation: [document.getElementById("affiliation")],
   region: [document.getElementById("region")],
  };
 }

 function computeProgress() {
  const groups = getRequiredGroups();
  let filled = 0;
  Object.values(groups).forEach((group) => {
   if (group.some(isFilled)) filled += 1;
  });
  return filled;
 }

 function updateProgress() {
  const filled = computeProgress();
  const pct = (filled / TOTAL_REQUIRED) * 100;
  progressFill.style.width = pct + "%";
  progressDot.style.left = "calc(" + pct + "% - 3px)";
  progressBar.setAttribute("aria-valuenow", String(filled));
  progressValue.textContent = filled + " / " + TOTAL_REQUIRED;

  if (filled === TOTAL_REQUIRED) {
   progressStatus.textContent = "Complete";
   progressStatus.classList.remove("text-[#7c868a]");
   progressStatus.classList.add("text-[#00adec]");
  } else {
   progressStatus.textContent = "Incomplete";
   progressStatus.classList.add("text-[#7c868a]");
   progressStatus.classList.remove("text-[#00adec]");
  }

  continueBtn.disabled = filled !== TOTAL_REQUIRED;
 }

 form.addEventListener("input", updateProgress);
 form.addEventListener("change", updateProgress);

 form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (continueBtn.disabled) return;

  const email = document.getElementById("contactEmail");
  if (email && !email.checkValidity()) {
   email.reportValidity();
   return;
  }

  openModal();
 });

 let ctx = null;
 let drawing = false;
 let hasSignature = false;
 let lastX = 0;
 let lastY = 0;
 let strokes = [];
 let currentStroke = null;
 
 function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#002735";
  ctx.fillStyle = "#ebf5f8";
  ctx.fillRect(0, 0, rect.width, rect.height);
 }

 function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const point = e.touches ? e.touches[0] : e;
  return {x: point.clientX - rect.left, y: point.clientY - rect.top};
 }

function startDraw(e) {
    e.preventDefault();

    drawing = true;

    const p = getPos(e);

    lastX = p.x;
    lastY = p.y;

    currentStroke = [
        {
            x: p.x,
            y: p.y,
            t: Date.now(),
            p: e.pressure || 0
        }
    ];

    strokes.push(currentStroke);
}

function draw(e) {
    if (!drawing || !ctx) return;

    e.preventDefault();

    const p = getPos(e);

    // Draw the signature
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    // Record the point
    if (currentStroke) {
        currentStroke.push({
            x: p.x,
            y: p.y,
            t: Date.now(),
            p: e.pressure || 0
        });
    }

    lastX = p.x;
    lastY = p.y;

    if (!hasSignature) {
        hasSignature = true;
        confirmBtn.disabled = false;
        signatureStatus.textContent = "Signature captured";
        signatureStatus.classList.remove("text-[#7c868a]");
        signatureStatus.classList.add("text-[#00adec]");

        if (placeholder) {
            placeholder.style.display = "none";
        }
    }
}

function endDraw() {
    drawing = false;
    currentStroke = null;
}

 function clearCanvas() {
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  ctx.fillStyle = "#ebf5f8";
  ctx.fillRect(0, 0, rect.width, rect.height);
strokes = [];
currentStroke = null;
  hasSignature = false;
  confirmBtn.disabled = true;
  signatureStatus.textContent = "Awaiting signature";
  signatureStatus.classList.add("text-[#7c868a]");
  signatureStatus.classList.remove("text-[#00adec]");
  if (placeholder) placeholder.style.display = "";
 }

 function openModal() {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
   resizeCanvas();
   canvas.focus();
  });
 }

 function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
 }

 canvas.addEventListener("mousedown", startDraw);
 canvas.addEventListener("mousemove", draw);
 canvas.addEventListener("mouseup", endDraw);
 canvas.addEventListener("mouseleave", endDraw);

 canvas.addEventListener("touchstart", startDraw, {passive: false});
 canvas.addEventListener("touchmove", draw, {passive: false});
 canvas.addEventListener("touchend", endDraw);

 clearBtn.addEventListener("click", clearCanvas);
 cancelBtn.addEventListener("click", closeModal);
 closeModalIcon.addEventListener("click", closeModal);
confirmBtn.addEventListener("click", function () {
    if (!hasSignature) return;

    const formData = new FormData(form);


const signatureInfo = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    strokes: strokes
};

formData.append(
    "signature_data",
    JSON.stringify(signatureInfo)
);

    fetch(form.action, {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (response.ok) {
            closeModal();
            alert("Registration submitted successfully.");
        } else {
            alert("There was a problem submitting the registration.");
        }
    })
    .catch(error => {
        console.error("Submission error:", error);
        alert("There was a problem submitting the registration.");
    });
});

 document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
   closeModal();
  }
 });

 window.addEventListener("resize", function () {
  if (!modal.classList.contains("hidden") && ctx) {
   const existing = canvas.toDataURL();
   resizeCanvas();
   const img = new Image();
   img.onload = () =>
    ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);
   img.src = existing;
  }
 });

 updateProgress();
})();
