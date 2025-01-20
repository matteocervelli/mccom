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