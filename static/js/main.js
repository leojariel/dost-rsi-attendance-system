console.log("MY JAVASCRIPT FILE IS RUNNING");

(function () {
 const registerBtn = document.getElementById("registerBtn");
 const calendarBtn = document.getElementById("calendarBtn");
 const shareBtn = document.getElementById("shareBtn");

 if (registerBtn) {
  registerBtn.addEventListener("click", function (e) {
   e.preventDefault();
  console.log("REGISTER BUTTON CLICKED");
   window.location.href = "/register/";
  });
 }

 if (calendarBtn) {
  calendarBtn.addEventListener("click", function (e) {
   e.preventDefault();
   alert(
    "Event added to your calendar: Oct 12–14, 2026 (Quezon Convention Center)",
   );
  });
 }

 if (shareBtn) {
  shareBtn.addEventListener("click", function (e) {
   e.preventDefault();
   if (navigator.share) {
    navigator
     .share({
      title: "8th Research, Statistic, and Innovation Forum",
      text: "Oct 12–14, 2026 · Quezon Convention Center, Lucena City",
      url: window.location.href,
     })
     .catch(() => {});
   } else {
    alert("Share link: " + window.location.href);
   }
  });
 }
})();
