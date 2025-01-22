var darkModeToggle = document.querySelector("#theme-toggle");

function toggleTheme() {
  document.body.classList.toggle("theme-dark");
  updateThemeState();
}

function updateThemeState() {
  let isDarkMode = document.body.classList.contains("theme-dark");
  let theme = isDarkMode ? "dark" : "light";
  localStorage.setItem("theme", theme);
  darkModeToggle.setAttribute("aria-checked", isDarkMode.toString());
}

function initializeTheme() {
  let isDarkMode = document.body.classList.contains("theme-dark");
  darkModeToggle.setAttribute("aria-checked", isDarkMode.toString());
}

darkModeToggle.addEventListener("click", toggleTheme);

window.addEventListener('keydown', function(e) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
      return;
    }
    if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey) {
      toggleTheme();
    }
});

initializeTheme();