// Controlla se c'è una preferenza salvata
const getStoredTheme = () => localStorage.getItem('theme')

// Controlla se il sistema usa dark mode
const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
        return storedTheme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Applica il tema
const setTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('theme-dark')
    } else {
        document.documentElement.classList.remove('theme-dark')
    }
    localStorage.setItem('theme', theme)
    
    // Aggiorna l'attributo aria-checked del toggle
    const toggle = document.getElementById('theme-toggle')
    if (toggle) {
        toggle.setAttribute('aria-checked', theme === 'dark')
    }
}

// Inizializza il tema
const theme = getPreferredTheme()
setTheme(theme)

// Gestisce il click sul toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('theme-dark')
    setTheme(isDark ? 'light' : 'dark')
})

// Opzionale: reagisce ai cambiamenti delle preferenze di sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
    if (!getStoredTheme()) {
        setTheme(matches ? 'dark' : 'light')
    }
})