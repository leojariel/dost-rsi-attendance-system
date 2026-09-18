(function () {
 const themeToggle = document.getElementById("themeToggle");
 const root = document.documentElement;

 function applyTheme(isDark) {
  if (isDark) {
   root.classList.add("dark");
   localStorage.setItem("rsi-theme", "dark");
  } else {
   root.classList.remove("dark");
   localStorage.setItem("rsi-theme", "light");
  }
 }

 if (themeToggle) {
  themeToggle.addEventListener("click", function () {
   const isDark = root.classList.contains("dark");
   applyTheme(!isDark);
  });
 }

 applyTheme(root.classList.contains("dark"));
})();

(function () {
 const SUPER_ADMIN_PASSWORD = "thescript";
 const STORAGE_ADMINS = "rsi-admins";

 const authGate = document.getElementById("authGate");
 const superAdminStep = document.getElementById("superAdminStep");
 const adminAuthStep = document.getElementById("adminAuthStep");
 const superPassword = document.getElementById("superPassword");
 const superError = document.getElementById("superError");
 const superSubmit = document.getElementById("superSubmit");

 const adminRegisterForm = document.getElementById("adminRegisterForm");
 const adminLoginForm = document.getElementById("adminLoginForm");
 const adminAuthTitle = document.getElementById("adminAuthTitle");
 const adminAuthSubtitle = document.getElementById("adminAuthSubtitle");

 const regName = document.getElementById("regName");
 const regPassword = document.getElementById("regPassword");
 const regConfirm = document.getElementById("regConfirm");
 const regError = document.getElementById("regError");
 const regSubmit = document.getElementById("regSubmit");
 const toLogin = document.getElementById("toLogin");
 const toRegister = document.getElementById("toRegister");

 const loginName = document.getElementById("loginName");
 const loginPassword = document.getElementById("loginPassword");
 const loginError = document.getElementById("loginError");
 const loginSubmit = document.getElementById("loginSubmit");

 const appShell = document.getElementById("appShell");
 const globalSearch = document.getElementById("globalSearch");
 const userMenuBtn = document.getElementById("userMenuBtn");
 const userDropup = document.getElementById("userDropup");
 const logoutBtn = document.getElementById("logoutBtn");
 const userNameDisplay = document.getElementById("userNameDisplay");
 const userInitials = document.getElementById("userInitials");

 const navItems = document.querySelectorAll(".nav-item");
 const pages = document.querySelectorAll(".page");

 const profileInitials = document.getElementById("profileInitials");
 const profileName = document.getElementById("profileName");
 const profileFullName = document.getElementById("profileFullName");
 const profileEmail = document.getElementById("profileEmail");
 const currentPassword = document.getElementById("currentPassword");
 const newPassword = document.getElementById("newPassword");
 const confirmPassword = document.getElementById("confirmPassword");
 const passwordMsg = document.getElementById("passwordMsg");
 const updatePasswordBtn = document.getElementById("updatePasswordBtn");

 const addAttendeeBtn = document.getElementById("addAttendeeBtn");
 const attendeeModal = document.getElementById("attendeeModal");
 const closeAttendeeModal = document.getElementById("closeAttendeeModal");
 const cancelAttendeeBtn = document.getElementById("cancelAttendeeBtn");
 const saveAttendeeBtn = document.getElementById("saveAttendeeBtn");
 const attendeeModalTitle = document.getElementById("attendeeModalTitle");
 const attendeeModalLabel = document.getElementById("attendeeModalLabel");

 const confirmModal = document.getElementById("confirmModal");
 const confirmLabel = document.getElementById("confirmLabel");
 const confirmTitle = document.getElementById("confirmTitle");
 const confirmMessage = document.getElementById("confirmMessage");
 const confirmCancelBtn = document.getElementById("confirmCancelBtn");
 const confirmOkBtn = document.getElementById("confirmOkBtn");

 const cameraModal = document.getElementById("cameraModal");
 const closeCameraModal = document.getElementById("closeCameraModal");

 const certModal = document.getElementById("certModal");
 const certModalContent = document.getElementById("certModalContent");
 const certCloseBtn = document.getElementById("certCloseBtn");
 const certPrintBtn = document.getElementById("certPrintBtn");
 const certPrintArea = document.getElementById("certPrintArea");
 const certGrid = document.getElementById("certGrid");
 const printAllCerts = document.getElementById("printAllCerts");

 const confirmedList = document.getElementById("confirmedList");
 const confirmedCount = document.getElementById("confirmedCount");
 const sortField = document.getElementById("sortField");
 const sortDir = document.getElementById("sortDir");
 const refreshConfirmed = document.getElementById("refreshConfirmed");
 const simulateScan = document.getElementById("simulateScan");
 const lastScanLabel = document.getElementById("lastScanLabel");
 const toggleCamera = document.getElementById("toggleCamera");

 const attendeesBody = document.getElementById("attendeesBody");
 const confirmedTableBody = document.getElementById("confirmedTableBody");
 const absentTableBody = document.getElementById("absentTableBody");

 let currentUser = null;
 let currentPage = "dashboard";
 let editingAttendeeId = null;
 let sortDirection = "desc";
 let confirmCallback = null;

 const baseAttendees = [
  {
   id: "RSI-0001",
   firstName: "Maria",
   middleName: "Lopez",
   lastName: "Santos",
   gender: "Female",
   age: "31-59",
   classification: "Government Employee",
   email: "maria.santos@dost.gov.ph",
   visitorType: "Participant / Walk-in",
   affiliation: "DOST CALABARZON",
   region: "Region IV-A (CALABARZON)",
   status: "confirmed",
   confirmedAt: "2026-10-12 10:42",
  },
  {
   id: "RSI-0002",
   firstName: "Juan",
   middleName: "Reyes",
   lastName: "Dela Cruz",
   gender: "Male",
   age: "31-59",
   classification: "Government Employee",
   email: "juan.delacruz@dost.gov.ph",
   visitorType: "Speaker",
   affiliation: "DOST Central Office",
   region: "NCR (National Capital Region)",
   status: "confirmed",
   confirmedAt: "2026-10-12 10:38",
  },
  {
   id: "RSI-0003",
   firstName: "Andres",
   middleName: "",
   lastName: "Bonifacio",
   gender: "Male",
   age: "31-59",
   classification: "Business / Entrepreneur",
   email: "andres.b@example.com",
   visitorType: "Exhibitor",
   affiliation: "Katipunan Enterprises",
   region: "NCR (National Capital Region)",
   status: "confirmed",
   confirmedAt: "2026-10-12 10:31",
  },
  {
   id: "RSI-0004",
   firstName: "Jose",
   middleName: "Protacio",
   lastName: "Rizal",
   gender: "Male",
   age: "31-59",
   classification: "Student / Academe",
   email: "jose.rizal@example.com",
   visitorType: "Volunteer",
   affiliation: "University of the Philippines",
   region: "Region IV-A (CALABARZON)",
   status: "confirmed",
   confirmedAt: "2026-10-12 10:22",
  },
  {
   id: "RSI-0005",
   firstName: "Gabriela",
   middleName: "Silang",
   lastName: "Apolinario",
   gender: "Female",
   age: "31-59",
   classification: "Government Employee",
   email: "gabriela.a@example.com",
   visitorType: "Participant / Walk-in",
   affiliation: "DOST CALABARZON",
   region: "Region IV-A (CALABARZON)",
   status: "confirmed",
   confirmedAt: "2026-10-12 09:58",
  },
  {
   id: "RSI-0006",
   firstName: "Emilio",
   middleName: "Famy",
   lastName: "Aguinaldo",
   gender: "Male",
   age: "60+",
   classification: "Government Employee",
   email: "emilio.a@example.com",
   visitorType: "Organizer / Facilitator",
   affiliation: "DOST Central Office",
   region: "NCR (National Capital Region)",
   status: "confirmed",
   confirmedAt: "2026-10-12 09:45",
  },
  {
   id: "RSI-0007",
   firstName: "Melchora",
   middleName: "Aquino",
   lastName: "Ramos",
   gender: "Female",
   age: "60+",
   classification: "Homemaker",
   email: "melchora.r@example.com",
   visitorType: "Participant / Walk-in",
   affiliation: "Community",
   region: "Region IV-A (CALABARZON)",
   status: "absent",
   confirmedAt: "",
  },
  {
   id: "RSI-0008",
   firstName: "Apolinario",
   middleName: "Dela Cruz",
   lastName: "Mabini",
   gender: "Male",
   age: "31-59",
   classification: "Student / Academe",
   email: "apolinario.m@example.com",
   visitorType: "Participant / Walk-in",
   affiliation: "Batangas State University",
   region: "Region IV-A (CALABARZON)",
   status: "absent",
   confirmedAt: "",
  },
  {
   id: "RSI-0009",
   firstName: "Marcelo",
   middleName: "Hilario",
   lastName: "Del Pilar",
   gender: "Male",
   age: "31-59",
   classification: "Media",
   email: "marcelo.d@example.com",
   visitorType: "Participant / Walk-in",
   affiliation: "Daily Tribune",
   region: "NCR (National Capital Region)",
   status: "absent",
   confirmedAt: "",
  },
  {
   id: "RSI-0010",
   firstName: "Gregoria",
   middleName: "de Jesus",
   lastName: "Silang",
   gender: "Female",
   age: "31-59",
   classification: "Business / Entrepreneur",
   email: "gregoria.s@example.com",
   visitorType: "Exhibitor",
   affiliation: "Ilocos Crafts",
   region: "Region I (Ilocos Region)",
   status: "absent",
   confirmedAt: "",
  },
  {
   id: "RSI-0011",
   firstName: "Lapu",
   middleName: "",
   lastName: "Lapu",
   gender: "Male",
   age: "31-59",
   classification: "Others",
   email: "lapu.lapu@example.com",
   visitorType: "Volunteer",
   affiliation: "Cebu Heritage",
   region: "Region VII (Central Visayas)",
   status: "absent",
   confirmedAt: "",
  },
  {
   id: "RSI-0012",
   firstName: "Teresa",
   middleName: "Magbanua",
   lastName: "Ferraris",
   gender: "Female",
   age: "31-59",
   classification: "Government Employee",
   email: "teresa.f@example.com",
   visitorType: "Participant / Walk-in",
   affiliation: "DOST Region VI",
   region: "Region VI (Western Visayas)",
   status: "absent",
   confirmedAt: "",
  },
 ];

 const regionsList = [
  "BARMM (Bangsamoro)",
  "CAR (Cordillera Administrative Region)",
  "NCR (National Capital Region)",
  "Region I (Ilocos Region)",
  "Region II (Cagayan Valley)",
  "Region III (Central Luzon)",
  "Region IV-A (CALABARZON)",
  "Region IV-B (MIMAROPA)",
  "Region V (Bicol Region)",
  "Region VI (Western Visayas)",
  "Region VII (Central Visayas)",
  "Region VIII (Eastern Visayas)",
  "Region IX (Zamboanga Peninsula)",
  "Region X (Northern Mindanao)",
  "Region XI (Davao Region)",
  "Region XII (SOCCSKSARGEN)",
  "Region XIII (CARAGA)",
 ];

 let attendees = JSON.parse(JSON.stringify(baseAttendees));

 function getAdmins() {
  try {
   return JSON.parse(localStorage.getItem(STORAGE_ADMINS)) || [];
  } catch {
   return [];
  }
 }

 function saveAdmins(list) {
  localStorage.setItem(STORAGE_ADMINS, JSON.stringify(list));
 }

 function initialsFrom(name) {
  return name
   .split(/\s+/)
   .filter(Boolean)
   .slice(0, 2)
   .map((n) => n[0].toUpperCase())
   .join("");
 }

 superSubmit.addEventListener("click", function () {
  if (superPassword.value.trim() !== SUPER_ADMIN_PASSWORD) {
   superError.textContent = "Invalid super admin password. Access denied.";
   superPassword.value = "";
   return;
  }
  superError.textContent = "";
  superAdminStep.classList.add("hidden");
  adminAuthStep.classList.remove("hidden");
  showAdminLogin();
 });

 function showAdminRegister() {
  adminAuthTitle.textContent = "Create Admin Account";
  adminAuthSubtitle.textContent = "Register a new administrator account.";
  adminRegisterForm.classList.remove("hidden");
  adminLoginForm.classList.add("hidden");
  regError.textContent = "";
 }

 function showAdminLogin() {
  adminAuthTitle.textContent = "Admin Login";
  adminAuthSubtitle.textContent = "Sign in to access the console.";
  adminLoginForm.classList.remove("hidden");
  adminRegisterForm.classList.add("hidden");
  loginError.textContent = "";
 }

 toLogin.addEventListener("click", showAdminLogin);
 toRegister.addEventListener("click", showAdminRegister);

 regSubmit.addEventListener("click", function () {
  const name = regName.value.trim();
  const pwd = regPassword.value;
  const confirm = regConfirm.value;

  if (name.length < 2) {
   regError.textContent = "Please enter your full name.";
   return;
  }
  if (pwd.length < 8) {
   regError.textContent = "Password must be at least 8 characters.";
   return;
  }
  if (pwd !== confirm) {
   regError.textContent = "Passwords do not match.";
   return;
  }

  const admins = getAdmins();
  if (admins.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
   regError.textContent = "An admin with this name already exists.";
   return;
  }

  admins.push({name: name, password: pwd});
  saveAdmins(admins);
  regError.textContent = "";
  loginName.value = name;
  showAdminLogin();
  loginError.textContent = "Registration complete. Please log in.";
 });

 loginSubmit.addEventListener("click", function () {
  const name = loginName.value.trim();
  const pwd = loginPassword.value;
  const admins = getAdmins();

  const match = admins.find(
   (a) => a.name.toLowerCase() === name.toLowerCase() && a.password === pwd,
  );

  if (!match) {
   loginError.textContent = "Invalid credentials. Please try again.";
   return;
  }

  currentUser = {name: match.name};
  loginError.textContent = "";
  enterAdmin();
 });

 function enterAdmin() {
  authGate.classList.add("hidden");
  appShell.classList.remove("hidden");

  const init = initialsFrom(currentUser.name) || "AD";
  userInitials.textContent = init;
  userNameDisplay.textContent = currentUser.name;
  profileInitials.textContent = init;
  profileName.textContent = currentUser.name;
  profileFullName.value = currentUser.name;
  profileEmail.value =
   currentUser.name.toLowerCase().replace(/\s+/g, ".") + "@dost.gov.ph";

  renderAll();
  navigateTo("dashboard");
 }

 logoutBtn.addEventListener("click", function () {
  currentUser = null;
  appShell.classList.add("hidden");
  authGate.classList.remove("hidden");
  superAdminStep.classList.remove("hidden");
  adminAuthStep.classList.add("hidden");
  superPassword.value = "";
  loginName.value = "";
  loginPassword.value = "";
  regName.value = "";
  regPassword.value = "";
  regConfirm.value = "";
 });

 userMenuBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  const isOpen = !userDropup.classList.contains("hidden");
  userDropup.classList.toggle("hidden");
  userMenuBtn.setAttribute("aria-expanded", String(!isOpen));
 });

 document.addEventListener("click", function (e) {
  if (!userDropup.contains(e.target) && e.target !== userMenuBtn) {
   userDropup.classList.add("hidden");
   userMenuBtn.setAttribute("aria-expanded", "false");
  }
 });

 navItems.forEach((item) => {
  item.addEventListener("click", function () {
   const target = item.getAttribute("data-page");
   if (target) {
    navigateTo(target);
    userDropup.classList.add("hidden");
    userMenuBtn.setAttribute("aria-expanded", "false");
   }
  });
 });

 function navigateTo(pageId) {
  currentPage = pageId;
  pages.forEach((p) => p.classList.toggle("active", p.id === "page-" + pageId));
  document.querySelectorAll(".nav-item[data-page]").forEach((n) => {
   const active = n.getAttribute("data-page") === pageId;
   n.classList.toggle("border-[#00adec]", active);
   n.classList.toggle("text-[#00adec]", active);
   n.classList.toggle("bg-[#ebf5f8]/60", active);
   n.classList.toggle("dark:bg-[#0b1214]/60", active);
  });
  if (pageId === "certificates") renderCertificates();
  if (pageId === "scanner") renderConfirmedList();
 }

 function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString("en-PH", {
   hour: "2-digit",
   minute: "2-digit",
   hour12: true,
  });
 }

 function renderConfirmedList() {
  const confirmed = attendees
   .filter((a) => a.status === "confirmed")
   .sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;
    if (sortField.value === "firstName")
     return a.firstName.localeCompare(b.firstName) * dir;
    if (sortField.value === "lastName")
     return a.lastName.localeCompare(b.lastName) * dir;
    return (a.confirmedAt || "").localeCompare(b.confirmedAt || "") * dir;
   });

  const container = confirmedList.querySelector("div");
  container.innerHTML = confirmed
   .map(
    (a) => `
      <div class="px-5 py-3 flex items-center gap-3">
        <span class="gradient-avatar w-8 h-8 rounded-full flex items-center justify-center text-[#ebf5f8] font-inter text-[10px] font-medium shrink-0">
          ${initialsFrom(a.firstName + " " + a.lastName)}
        </span>
        <div class="flex-1 min-w-0">
          <p class="font-inter text-sm text-[#002735] dark:text-[#ebf5f8] truncate">${a.firstName} ${a.lastName}</p>
          <p class="font-serif text-[11px] text-[#7c868a]">${a.gender} · ${a.age} · ${a.confirmedAt || ""}</p>
        </div>
        <span class="font-inter text-[10px] tracking-widest uppercase text-[#00adec] border border-[#00adec]/50 px-2 py-1 shrink-0">Confirmed</span>
      </div>
    `,
   )
   .join("");
  confirmedCount.textContent = String(confirmed.length);
 }

 sortField.addEventListener("change", renderConfirmedList);
 sortDir.addEventListener("click", function () {
  sortDirection = sortDirection === "asc" ? "desc" : "asc";
  sortDir.textContent = sortDirection.toUpperCase();
  renderConfirmedList();
 });
 refreshConfirmed.addEventListener("click", renderConfirmedList);

 simulateScan.addEventListener("click", function () {
  const pending = attendees.filter((a) => a.status === "absent");
  if (pending.length === 0) {
   lastScanLabel.textContent = "All attendees confirmed";
   return;
  }
  const next = pending[0];
  next.status = "confirmed";
  next.confirmedAt = "2026-10-12 " + formatTime();
  lastScanLabel.textContent =
   next.firstName + " " + next.lastName + " · " + next.confirmedAt;
  renderAll();
 });

 toggleCamera.addEventListener("click", function () {
  const isStopped = toggleCamera.textContent.trim() === "Start";
  toggleCamera.textContent = isStopped ? "Stop" : "Start";
 });

 closeCameraModal.addEventListener("click", function () {
  cameraModal.classList.add("hidden");
  cameraModal.classList.remove("flex");
 });

 function renderAttendeesTable() {
  attendeesBody.innerHTML = attendees
   .map(
    (a) => `
      <tr>
        <td class="py-3 px-4 text-[#0b1214] dark:text-[#ebf5f8]">${a.firstName} ${a.middleName ? a.middleName + " " : ""}${a.lastName}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.email}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.gender}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.age}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.visitorType}</td>
        <td class="py-3 px-4">
          ${
           a.status === "confirmed"
            ? `<span class="font-inter text-[10px] tracking-widest uppercase text-[#00adec] border border-[#00adec]/50 px-2 py-1">Confirmed</span>`
            : `<span class="font-inter text-[10px] tracking-widest uppercase text-[#7c868a] border border-[#7c868a]/40 px-2 py-1">Absent</span>`
          }
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <button type="button" data-action="edit" data-id="${a.id}" class="font-inter text-[10px] tracking-widest uppercase text-[#00adec] hover:underline mr-3">Edit</button>
          <button type="button" data-action="delete" data-id="${a.id}" class="font-inter text-[10px] tracking-widest uppercase text-[#7c868a] hover:text-[#00adec]">Delete</button>
        </td>
      </tr>
    `,
   )
   .join("");
 }

 attendeesBody.addEventListener("click", function (e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const attendee = attendees.find((a) => a.id === id);
  if (!attendee) return;

  if (btn.getAttribute("data-action") === "edit") {
   openAttendeeModal(attendee);
  } else if (btn.getAttribute("data-action") === "delete") {
   showConfirm(
    "Delete Attendee",
    `Remove ${attendee.firstName} ${attendee.lastName} from the registry?`,
    "Delete",
    function () {
     attendees = attendees.filter((a) => a.id !== id);
     renderAll();
    },
   );
  }
 });

 function renderConfirmedTable() {
  const confirmed = attendees.filter((a) => a.status === "confirmed");
  confirmedTableBody.innerHTML = confirmed
   .map(
    (a) => `
      <tr>
        <td class="py-3 px-4 text-[#0b1214] dark:text-[#ebf5f8]">${a.firstName} ${a.middleName ? a.middleName + " " : ""}${a.lastName}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.gender}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.age}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.classification}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.confirmedAt}</td>
      </tr>
    `,
   )
   .join("");
 }

 function renderAbsentTable() {
  const absent = attendees.filter((a) => a.status === "absent");
  absentTableBody.innerHTML = absent
   .map(
    (a) => `
      <tr>
        <td class="py-3 px-4 text-[#0b1214] dark:text-[#ebf5f8]">${a.firstName} ${a.middleName ? a.middleName + " " : ""}${a.lastName}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.email}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.gender}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.age}</td>
        <td class="py-3 px-4 text-[#7c868a]">${a.classification}</td>
      </tr>
    `,
   )
   .join("");
 }

 function certificateHTML(a) {
  return `
      <div class="cert-a4 flex flex-col justify-between p-16" style="font-family: 'Source Serif 4', Georgia, serif;">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3" style="color:#002735;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00adec" stroke-width="1.2">
              <path d="M12 3l9 6-9 6-9-6 9-6Z" stroke-linejoin="round" />
              <path d="M3 15l9 6 9-6" stroke-linejoin="round" />
            </svg>
            <div style="font-family:'Inter',sans-serif;letter-spacing:0.25em;font-size:11px;text-transform:uppercase;">
              DOST · 8th RSI Forum
            </div>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7c868a;">
            Certificate No. ${a.id}
          </div>
        </div>

        <div class="text-center my-8">
          <p style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#00adec;">Certificate of Attendance</p>
          <div style="width:80px;height:1px;background:#00adec;margin:18px auto;"></div>
          <p style="font-family:'Source Serif 4',serif;font-size:14px;color:#35393a;margin-bottom:22px;">This certifies that</p>
          <h2 style="font-family:'Source Serif 4',serif;font-size:52px;line-height:1.05;color:#002735;font-weight:600;margin-bottom:22px;">
            ${a.firstName} ${a.middleName ? a.middleName + " " : ""}${a.lastName}
          </h2>
          <p style="font-family:'Source Serif 4',serif;font-size:14px;color:#35393a;line-height:1.7;max-width:640px;margin:0 auto;">
            has successfully attended the <strong style="color:#002735;">8th Research, Statistics, and Innovation Forum</strong>,
            held on October 12–14, 2026 at the Quezon Convention Center, Lucena City, Quezon.
          </p>
        </div>

        <div class="flex items-end justify-between">
          <div>
            <div style="border-bottom:1px solid #002735;width:220px;margin-bottom:6px;height:34px;"></div>
            <p style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#35393a;">Event Chairperson</p>
          </div>
          <div class="text-right">
            <div style="border-bottom:1px solid #002735;width:220px;margin-bottom:6px;height:34px;"></div>
            <p style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#35393a;">DOST CALABARZON</p>
          </div>
        </div>
      </div>
    `;
 }

 function renderCertificates() {
  const confirmed = attendees.filter((a) => a.status === "confirmed");
  certGrid.innerHTML = confirmed
   .map(
    (a) => `
      <div class="bg-white dark:bg-[#002735] border border-[#7c868a]/25 p-4 flex flex-col">
        <div class="bg-[#ebf5f8]/60 dark:bg-[#0b1214]/60 border border-[#7c868a]/25 aspect-[1.4/1] flex items-center justify-center mb-3 overflow-hidden">
          <div style="transform: scale(0.24); transform-origin: center;">
            ${certificateHTML(a)}
          </div>
        </div>
        <p class="font-inter text-xs text-[#002735] dark:text-[#ebf5f8] truncate">${a.firstName} ${a.lastName}</p>
        <p class="font-serif text-[11px] text-[#7c868a] mb-3">${a.classification}</p>
        <button type="button" data-cert-id="${a.id}" class="cert-open-btn mt-auto font-inter text-[10px] tracking-[0.25em] uppercase border border-[#7c868a]/40 text-[#35393a] dark:text-[#ebf5f8] py-2 hover:border-[#00adec] hover:text-[#00adec] transition-colors">Open</button>
      </div>
    `,
   )
   .join("");
 }

 certGrid.addEventListener("click", function (e) {
  const btn = e.target.closest(".cert-open-btn");
  if (!btn) return;
  const id = btn.getAttribute("data-cert-id");
  const attendee = attendees.find((a) => a.id === id);
  if (!attendee) return;
  certModalContent.innerHTML = certificateHTML(attendee);
  certModalContent.style.transform = "scale(0.55)";
  certModalContent.style.transformOrigin = "top center";
  certModal.classList.remove("hidden");
  certModal.classList.add("flex");
 });

 certCloseBtn.addEventListener("click", function () {
  certModal.classList.add("hidden");
  certModal.classList.remove("flex");
 });

 function printCertificates(list) {
  certPrintArea.innerHTML = list.map(certificateHTML).join("");
  certPrintArea.classList.remove("hidden");
  window.print();
  setTimeout(() => certPrintArea.classList.add("hidden"), 500);
 }

 certPrintBtn.addEventListener("click", function () {
  const html = certModalContent.innerHTML;
  certPrintArea.innerHTML = html;
  certPrintArea.classList.remove("hidden");
  window.print();
  setTimeout(() => certPrintArea.classList.add("hidden"), 500);
 });

 printAllCerts.addEventListener("click", function () {
  const confirmed = attendees.filter((a) => a.status === "confirmed");
  printCertificates(confirmed);
 });

 function showConfirm(label, message, okText, callback) {
  confirmLabel.textContent = label;
  confirmTitle.textContent = "Please Confirm";
  confirmMessage.textContent = message;
  confirmOkBtn.textContent = okText;
  confirmCallback = callback;
  confirmModal.classList.remove("hidden");
  confirmModal.classList.add("flex");
 }

 confirmCancelBtn.addEventListener("click", function () {
  confirmModal.classList.add("hidden");
  confirmModal.classList.remove("flex");
  confirmCallback = null;
 });

 confirmOkBtn.addEventListener("click", function () {
  if (typeof confirmCallback === "function") confirmCallback();
  confirmModal.classList.add("hidden");
  confirmModal.classList.remove("flex");
  confirmCallback = null;
 });

 function openAttendeeModal(attendee) {
  if (attendee) {
   editingAttendeeId = attendee.id;
   attendeeModalTitle.textContent = "Edit Attendee";
   attendeeModalLabel.textContent = "Attendee · " + attendee.id;
   document.getElementById("mFirstName").value = attendee.firstName;
   document.getElementById("mMiddleName").value = attendee.middleName || "";
   document.getElementById("mLastName").value = attendee.lastName;
   document.getElementById("mEmail").value = attendee.email;
   document.getElementById("mGender").value = attendee.gender;
   document.getElementById("mAge").value = attendee.age;
   document.getElementById("mClassification").value = attendee.classification;
   document.getElementById("mVisitorType").value = attendee.visitorType;
   document.getElementById("mAffiliation").value = attendee.affiliation;
   document.getElementById("mRegion").value = attendee.region;
  } else {
   editingAttendeeId = null;
   attendeeModalTitle.textContent = "Add Attendee";
   attendeeModalLabel.textContent = "Attendee · New";
   document.getElementById("mFirstName").value = "";
   document.getElementById("mMiddleName").value = "";
   document.getElementById("mLastName").value = "";
   document.getElementById("mEmail").value = "";
   document.getElementById("mGender").value = "Male";
   document.getElementById("mAge").value = "15-30";
   document.getElementById("mClassification").value = "Student / Academe";
   document.getElementById("mVisitorType").value = "Participant / Walk-in";
   document.getElementById("mAffiliation").value = "";
   document.getElementById("mRegion").value = regionsList[6];
  }
  attendeeModal.classList.remove("hidden");
  attendeeModal.classList.add("flex");
 }

 function closeAttendeeModalFn() {
  attendeeModal.classList.add("hidden");
  attendeeModal.classList.remove("flex");
  editingAttendeeId = null;
 }

 addAttendeeBtn.addEventListener("click", () => openAttendeeModal(null));
 closeAttendeeModal.addEventListener("click", closeAttendeeModalFn);
 cancelAttendeeBtn.addEventListener("click", closeAttendeeModalFn);

 saveAttendeeBtn.addEventListener("click", function () {
  const data = {
   firstName: document.getElementById("mFirstName").value.trim(),
   middleName: document.getElementById("mMiddleName").value.trim(),
   lastName: document.getElementById("mLastName").value.trim(),
   email: document.getElementById("mEmail").value.trim(),
   gender: document.getElementById("mGender").value,
   age: document.getElementById("mAge").value,
   classification: document.getElementById("mClassification").value,
   visitorType: document.getElementById("mVisitorType").value,
   affiliation: document.getElementById("mAffiliation").value.trim(),
   region: document.getElementById("mRegion").value,
  };

  if (!data.firstName || !data.lastName || !data.email) {
   return;
  }

  if (editingAttendeeId) {
   const idx = attendees.findIndex((a) => a.id === editingAttendeeId);
   if (idx >= 0) attendees[idx] = Object.assign({}, attendees[idx], data);
  } else {
   const newId = "RSI-" + String(attendees.length + 1).padStart(4, "0");
   attendees.push(
    Object.assign({id: newId, status: "absent", confirmedAt: ""}, data),
   );
  }

  closeAttendeeModalFn();
  renderAll();
 });

 updatePasswordBtn.addEventListener("click", function () {
  const cur = currentPassword.value;
  const np = newPassword.value;
  const cp = confirmPassword.value;

  if (!cur || !np || !cp) {
   passwordMsg.textContent = "Please fill in all password fields.";
   passwordMsg.classList.add("text-[#00adec]");
   return;
  }
  if (np.length < 8) {
   passwordMsg.textContent = "New password must be at least 8 characters.";
   passwordMsg.classList.add("text-[#00adec]");
   return;
  }
  if (np !== cp) {
   passwordMsg.textContent = "New passwords do not match.";
   passwordMsg.classList.add("text-[#00adec]");
   return;
  }

  const admins = getAdmins();
  const idx = admins.findIndex((a) => a.name === currentUser.name);
  if (idx >= 0 && admins[idx].password !== cur) {
   passwordMsg.textContent = "Current password is incorrect.";
   passwordMsg.classList.add("text-[#00adec]");
   return;
  }
  if (idx >= 0) {
   admins[idx].password = np;
   saveAdmins(admins);
  }

  passwordMsg.textContent = "Password updated successfully.";
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
 });

 globalSearch.addEventListener("input", function () {
  const q = globalSearch.value.trim().toLowerCase();
  if (!q) return;
  const match = attendees.find(
   (a) =>
    (a.firstName + " " + a.lastName).toLowerCase().includes(q) ||
    a.email.toLowerCase().includes(q) ||
    a.id.toLowerCase().includes(q),
  );
  if (match) {
   if (currentPage !== "attendees") navigateTo("attendees");
   const row = attendeesBody.querySelector(`button[data-id="${match.id}"]`);
   if (row)
    row.closest("tr").scrollIntoView({behavior: "smooth", block: "center"});
  }
 });

 document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
   if (!attendeeModal.classList.contains("hidden")) closeAttendeeModalFn();
   if (!confirmModal.classList.contains("hidden")) {
    confirmModal.classList.add("hidden");
    confirmModal.classList.remove("flex");
   }
   if (!cameraModal.classList.contains("hidden")) {
    cameraModal.classList.add("hidden");
    cameraModal.classList.remove("flex");
   }
   if (!certModal.classList.contains("hidden")) {
    certModal.classList.add("hidden");
    certModal.classList.remove("flex");
   }
  }
 });

 function renderAll() {
  renderAttendeesTable();
  renderConfirmedTable();
  renderAbsentTable();
  renderConfirmedList();
  if (currentPage === "certificates") renderCertificates();
 }

 renderAll();
})();
