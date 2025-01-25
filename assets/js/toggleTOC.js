// Funzione per impostare l'altezza dell'header
function setHeaderHeight() {
    const main = document.querySelector('main');
    const mainH1 = main.querySelector('h1');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const header = document.querySelector('header');
    const logoSection = document.querySelector('div[role="logo and breadcrumb"]');
    
    if (main && toggleButton && mainH1) {
        requestAnimationFrame(() => {
            // Calcola il margin-right dell'header
            if (header) {
                const headerStyles = window.getComputedStyle(header);
                const headerMarginRight = headerStyles.marginRight;
                document.documentElement.style.setProperty('--header-margin-right', headerMarginRight);
            }

            // Calcola l'altezza della sezione logo includendo il margin-bottom
            if (logoSection) {
                const logoStyles = window.getComputedStyle(logoSection);
                const logoHeight = logoSection.offsetHeight;
                const logoMarginBottom = parseInt(logoStyles.marginBottom);
                const totalLogoHeight = logoHeight + logoMarginBottom;
                document.documentElement.style.setProperty('--logo-section-height', `${totalLogoHeight}px`);
            }
            
            // Calcola la posizione del TOC
            const h1Rect = mainH1.getBoundingClientRect();
            const tocPosition = h1Rect.top + window.scrollY + 20;
            document.documentElement.style.setProperty('--toc-position', `${tocPosition}px`);
        });
    }
}

// Funzione per controllare se siamo su mobile
function isMobile() {
    return window.innerWidth < 1560;
}

// Funzione per impostare lo stato iniziale della sidebar
function initializeSidebar() {
    setHeaderHeight();
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        if (isMobile()) {
            sidebar.classList.remove('active');
        } else {
            sidebar.classList.add('active');
        }
    }
}

// Funzione per gestire il toggle della sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Chiudi sidebar quando si clicca un link (solo su mobile)
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', () => {
        if (isMobile()) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// Inizializza lo stato della sidebar al caricamento della pagina
document.addEventListener('DOMContentLoaded', initializeSidebar);

// Gestisci il ridimensionamento della finestra
window.addEventListener('resize', initializeSidebar);

// Aggiungi l'evento resize per ricalcolare l'altezza dell'header quando necessario
window.addEventListener('resize', setHeaderHeight);