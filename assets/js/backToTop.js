document.addEventListener('DOMContentLoaded', function() {
    // Creiamo il pulsante
    const button = document.createElement('button');
    button.className = 'back-to-top';
    document.body.appendChild(button);

    // Funzione per determinare la soglia in base alla viewport
    function getScrollThreshold() {
        return window.innerWidth <= 768 ? 250 : 450;
    }

    // Funzione per controllare lo scroll con debounce
    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = window.requestAnimationFrame(() => {
            const threshold = getScrollThreshold();
            
            if (window.scrollY > threshold) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        });
    }

    // Funzione per scrollare verso l'alto con animazione smooth
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Aggiungiamo gli event listener
    window.addEventListener('scroll', handleScroll);
    button.addEventListener('click', scrollToTop);

    // Gestione resize della finestra
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(handleScroll, 100);
    });
}); 