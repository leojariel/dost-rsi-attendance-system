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
 const successModal = document.getElementById("registrationSuccess");
 const closeSuccess = document.getElementById("closeSuccess");

 function isFilled(el) {
  if (!el) return false;
  if (el.type === "checkbox" || el.type === "radio") return el.checked;
  return el.value.trim() !== "";
 }

 function getRequiredGroups() {
   const groups = new Map();
   form.querySelectorAll("[required][name]").forEach((control) => {
    if (!groups.has(control.name)) groups.set(control.name, []);
    groups.get(control.name).push(control);
   });
   return Array.from(groups.values());
 }

 function computeProgress() {
  const groups = [
   {controls: [document.getElementById("privacyConsent")]},
   {
    controls: [
     document.getElementById("firstName"),
     document.getElementById("lastName"),
    ],
    requireAll: false,
   },
   {controls: [document.getElementById("gender")]},
   {controls: [document.getElementById("classification")]},
   {controls: [document.getElementById("contactEmail")]},
   {controls: Array.from(form.querySelectorAll('input[name="visitorType"]'))},
   {controls: [document.getElementById("affiliation")]},
   {controls: [document.getElementById("region")]},
   {controls: Array.from(form.querySelectorAll('input[name="activities"]'))},
  ];
  const filled = groups.filter((group) =>
   group.requireAll
    ? group.controls.every(isFilled)
    : group.controls.some(isFilled),
  ).length;
  const requiredComplete = getRequiredGroups().every((group) =>
   group.some(isFilled),
  );
  return {filled, total: groups.length, requiredComplete};
 }

 function updateProgress() {
  const {filled, total, requiredComplete} = computeProgress();
  const pct = total ? (filled / total) * 100 : 100;
  progressFill.style.width = pct + "%";
  progressDot.style.left = "calc(" + pct + "% - 4px)";
  progressBar.setAttribute("aria-valuenow", String(filled));
  progressBar.setAttribute("aria-valuemax", String(total));
  progressValue.textContent = filled + " / " + total;

  if (filled === total) {
   progressStatus.textContent = "Complete";
   progressStatus.classList.remove("text-[#7c868a]");
   progressStatus.classList.add("text-[#00adec]");
  } else if (requiredComplete) {
   progressStatus.textContent = "Ready";
   progressStatus.classList.remove("text-[#7c868a]");
   progressStatus.classList.add("text-[#00adec]");
  } else {
   progressStatus.textContent = "Incomplete";
   progressStatus.classList.add("text-[#7c868a]");
   progressStatus.classList.remove("text-[#00adec]");
  }

  continueBtn.disabled = !requiredComplete;
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
  ctx.fillStyle = "#ebf5f8";
  ctx.fillRect(0, 0, rect.width, rect.height);
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

 function showSuccess() {
  closeModal();
  successModal.classList.remove("hidden");
  successModal.classList.add("flex");
  closeSuccess.focus();
 }

 function closeSuccessModal() {
  successModal.classList.add("hidden");
  successModal.classList.remove("flex");
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
 closeSuccess.addEventListener("click", closeSuccessModal);
 confirmBtn.addEventListener("click", function () {
  if (!hasSignature) return;
  showSuccess();
 });

 document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
   if (!modal.classList.contains("hidden")) closeModal();
   if (!successModal.classList.contains("hidden")) closeSuccessModal();
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
