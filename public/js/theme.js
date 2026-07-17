(function() {
  var saved = localStorage.getItem("theme");
  var theme = saved;
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
  window.__theme = theme;
  window.__setTheme = function(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    window.__theme = t;
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.innerHTML = t === "dark" ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
      if (typeof lucide !== "undefined") { try { lucide.createIcons(); } catch(e) {} }
    }
  };
  document.addEventListener("click", function(e) {
    var btn = e.target.closest ? e.target.closest("#theme-toggle") : null;
    if (btn) {
      var t = window.__theme === "dark" ? "light" : "dark";
      window.__setTheme(t);
    }
  });
})();
