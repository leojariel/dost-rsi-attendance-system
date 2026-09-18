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

 function collectFormData() {
  const fd = new FormData(form);
  const ageRange = form.querySelector('input[name="ageRange"]:checked');
  const visitorType = form.querySelector('input[name="visitorType"]:checked');

  return {
   privacyConsent: document.getElementById("privacyConsent").checked,
   firstName: (fd.get("firstName") || "").toString().trim(),
   middleName: (fd.get("middleName") || "").toString().trim(),
   lastName: (fd.get("lastName") || "").toString().trim(),
   gender: (fd.get("gender") || "").toString(),
   ageRange: ageRange ? ageRange.value : "",
   classification: (fd.get("classification") || "").toString(),
   contactEmail: (fd.get("contactEmail") || "").toString().trim(),
   visitorType: visitorType ? visitorType.value : "",
   affiliation: (fd.get("affiliation") || "").toString().trim(),
   region: (fd.get("region") || "").toString(),
  };
 }

 function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => {
   el.textContent = "";
   el.classList.remove("visible");
  });
  document.querySelectorAll(".field-error").forEach((el) => {
   el.classList.remove("field-error");
  });
 }

 function showErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
   const msg = document.querySelector(`.error-msg[data-error-for="${field}"]`);
   if (msg) {
    msg.textContent = message;
    msg.classList.add("visible");
   }

   const el =
    document.getElementById(field) ||
    document.querySelector(`input[name="${field}"]`);

   if (el) {
    el.classList.add("field-error");
    el.setAttribute("aria-invalid", "true");
    el.setAttribute("aria-describedby", `error-${field}`);
    if (msg) msg.id = `error-${field}`;
   }

   if (field === "ageRange" || field === "visitorType") {
    document.querySelectorAll(`input[name="${field}"]`).forEach((r) => {
     r.classList.add("field-error");
     r.setAttribute("aria-invalid", "true");
    });
   }
  });

  const firstKey = Object.keys(errors)[0];
  const firstEl =
   document.getElementById(firstKey) ||
   document.querySelector(`input[name="${firstKey}"]`);
  if (firstEl && typeof firstEl.focus === "function") {
   firstEl.focus({preventScroll: false});
   firstEl.scrollIntoView({behavior: "smooth", block: "center"});
  }
 }

 form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (continueBtn.disabled) return;

  clearErrors();
  continueBtn.disabled = true;

  const originalLabel = continueBtn.querySelector("span").textContent;
  continueBtn.querySelector("span").textContent = "Validating...";

  try {
   const res = await fetch("../public/api/validate.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(collectFormData()),
   });
   const data = await res.json();

   if (!data.ok) {
    showErrors(data.errors || {error: "Validation failed."});
    continueBtn.disabled = false;
    continueBtn.querySelector("span").textContent = originalLabel;
    return;
   }

   continueBtn.disabled = false;
   continueBtn.querySelector("span").textContent = originalLabel;
   openModal();
  } catch (err) {
   console.error(err);
   continueBtn.disabled = false;
   continueBtn.querySelector("span").textContent = originalLabel;
   alert("Network error. Please try again.");
  }
 });

 let ctx = null;
 let drawing = false;
 let hasSignature = false;
 let lastX = 0;
 let lastY = 0;

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
  ctx.clearRect(0, 0, rect.width, rect.height);
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
 }

 function draw(e) {
  if (!drawing || !ctx) return;
  e.preventDefault();
  const p = getPos(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  lastX = p.x;
  lastY = p.y;

  if (!hasSignature) {
   hasSignature = true;
   confirmBtn.disabled = false;
   signatureStatus.textContent = "Signature captured";
   signatureStatus.classList.remove("text-[#7c868a]");
   signatureStatus.classList.add("text-[#00adec]");
   if (placeholder) placeholder.style.display = "none";
  }
 }

 function endDraw() {
  drawing = false;
 }

 function clearCanvas() {
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
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

 confirmBtn.addEventListener("click", async function () {
  if (!hasSignature) return;

  const signatureDataUrl = canvas.toDataURL("image/png");
  const payload = Object.assign(collectFormData(), {
   signature: signatureDataUrl,
  });

  const originalLabel = confirmBtn.textContent;
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Submitting...";

  try {
   const res = await fetch("../public/api/register.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
   });

   const data = await res.json();

   if (!data.ok) {
    if (data.errors) {
     closeModal();
     showErrors(data.errors);
    } else {
     alert(data.error || "Registration failed.");
    }
    confirmBtn.disabled = false;
    confirmBtn.textContent = originalLabel;
    return;
   }

   closeModal();
   document.body.style.overflow = "";
   showSuccessMessage(data.uuid);
  } catch (err) {
   console.error("Submit failed:", err);
   alert("Submit failed: " + (err && err.message ? err.message : String(err)));
   confirmBtn.disabled = false;
   confirmBtn.textContent = originalLabel;
  }
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

 function showSuccessMessage(uuid) {
  const existing = document.getElementById("rsiSuccessOverlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "rsiSuccessOverlay";
  overlay.className =
   "fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b1214]/85 backdrop-blur-sm px-4";
  overlay.innerHTML = `
      <div class="w-full max-w-md bg-white border border-[#7c868a]/30 p-8 text-center">
        <p class="font-inter text-[10px] tracking-[0.25em] uppercase text-[#00adec] mb-3">Registration Complete</p>
        <h2 class="font-inter text-2xl font-light text-[#002735] mb-3">You're on the list.</h2>
        <p class="font-serif text-sm text-[#35393a] leading-relaxed mb-5">
          A QR pass will be sent to your registered email. Present it at the entrance on event day.
        </p>
        <p class="font-inter text-[10px] tracking-widest uppercase text-[#7c868a] mb-6">
          Reference: ${uuid}
        </p>
        <button type="button" id="successClose"
          class="w-full bg-[#00adec] text-white font-inter font-medium text-[10px] tracking-[0.25em] uppercase py-3 px-4 border border-[#00adec] hover:bg-[#005b7b] hover:border-[#005b7b] transition-colors">
          Close
        </button>
      </div>
    `;

  document.body.appendChild(overlay);

  const btn = overlay.querySelector("#successClose");
  if (!btn) return;
  btn.addEventListener("click", function (e) {
   e.preventDefault();
   e.stopPropagation();
   overlay.remove();
  });
 }

 updateProgress();
})();
