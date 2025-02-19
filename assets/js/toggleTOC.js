// Funzione per impostare l'altezza dell'header
function setHeaderHeight() {
    const main = document.querySelector('main');
    const mainH1 = main.querySelector('h1');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const header = document.querySelector('header');
    const logoSection = document.querySelector('div[role="logo and breadcrumb"]');
    const heroSection = document.querySelector('.post-hero, .project-hero');
    const sidebar = document.querySelector('.sidebar');
    
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
            
            if (sidebar) {
                // Trova il primo elemento di contenuto
                let firstContentElement;
                if (heroSection) {
                    // Se siamo in una pagina con hero section, cerca il primo h2 o p dopo l'hero
                    const contentElements = main.querySelectorAll('h2, p');
                    for (const element of contentElements) {
                        if (element.getBoundingClientRect().top > heroSection.getBoundingClientRect().bottom) {
                            firstContentElement = element;
                            break;
                        }
                    }
                } else {
                    // Se non c'è hero section, usa il primo h2 o p disponibile
                    firstContentElement = main.querySelector('h2, p');
                }

                // Imposta la posizione iniziale della TOC
                const initialTocPosition = (firstContentElement ? 
                    firstContentElement.getBoundingClientRect().top + window.scrollY - 20 : 
                    mainH1.getBoundingClientRect().bottom + window.scrollY + 20);
                
                document.documentElement.style.setProperty('--toc-initial-position', `${initialTocPosition}px`);
                
                // Funzione per gestire lo scroll
                function handleScroll() {
                    const referenceElement = firstContentElement || mainH1;
                    const referenceRect = referenceElement.getBoundingClientRect();
                    
                    if (referenceRect.top <= 20) {
                        // Elemento di riferimento sta per uscire dalla vista, fissa la TOC
                        sidebar.style.position = 'fixed';
                        sidebar.style.top = '20px';
                    } else {
                        // Elemento di riferimento ancora visibile, TOC segue lo scroll
                        sidebar.style.position = 'absolute';
                        sidebar.style.top = 'var(--toc-initial-position)';
                    }
                }

                // Aggiungi listener per lo scroll
                window.addEventListener('scroll', handleScroll);
                // Rimuovi il listener precedente se esiste
                if (window.tocScrollHandler) {
                    window.removeEventListener('scroll', window.tocScrollHandler);
                }
                window.tocScrollHandler = handleScroll;
                // Chiamata iniziale per impostare la posizione corretta
                handleScroll();
            }
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