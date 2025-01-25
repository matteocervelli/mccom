document.addEventListener('DOMContentLoaded', function() {
    const footnoteRefs = document.querySelectorAll('.footnote-ref');
    let tooltipTimeout;

    // Aggiungi il titolo alla sezione footnotes
    const footnotesSection = document.querySelector('.footnotes');
    if (footnotesSection) {
        // Prendi la lingua corrente dalla pagina
        const lang = document.documentElement.lang;
        // Imposta il titolo appropriato
        const title = lang === 'it' ? 'Note a piè di pagina' : 'Footnotes';
        
        // Crea l'elemento per il titolo
        const titleHeading = document.createElement('h2');
        titleHeading.textContent = title;
        titleHeading.className = 'footnotes-title';
        
        // Inserisci il titolo dopo l'hr esistente
        const hr = footnotesSection.querySelector('hr');
        if (hr) {
            hr.after(titleHeading);
        }
    }

    // Rimuovi le frecce di ritorno esistenti e aggiungine una nuova
    document.querySelectorAll('.footnotes li').forEach(footnote => {
        // Rimuovi tutte le frecce di ritorno esistenti
        footnote.querySelectorAll('.footnote-backref').forEach(ref => ref.remove());
        
        // Aggiungi una nuova freccia di ritorno
        const id = footnote.id;
        const refId = `fnref:${id.replace('fn:', '')}`;
        
        // Crea il link per il numero
        const numberText = footnote.firstChild.textContent.trim();
        const numberLink = document.createElement('a');
        numberLink.href = `#${refId}`;
        numberLink.className = 'footnote-number-link';
        numberLink.textContent = numberText;
        footnote.replaceChild(numberLink, footnote.firstChild);
        
        // Aggiungi la freccia alla fine
        const backLink = document.createElement('a');
        backLink.href = `#${refId}`;
        backLink.className = 'footnote-backref';
        backLink.innerHTML = '↩';
        backLink.title = 'Torna al testo';
        footnote.appendChild(backLink);
    });

    footnoteRefs.forEach(ref => {
        ref.addEventListener('mouseenter', function(e) {
            const footnoteId = this.getAttribute('href').substring(1);
            const footnoteContent = document.getElementById(footnoteId);
            
            if (!footnoteContent) return;
            
            tooltipTimeout = setTimeout(() => {
                const tooltip = document.createElement('div');
                tooltip.className = 'footnote-tooltip';
                
                // Clona il contenuto e rimuovi le frecce di ritorno
                const contentClone = footnoteContent.cloneNode(true);
                contentClone.querySelectorAll('.footnote-backref').forEach(ref => ref.remove());
                tooltip.innerHTML = contentClone.innerHTML;
                
                // Posiziona il tooltip sopra il riferimento
                const rect = this.getBoundingClientRect();
                tooltip.style.left = `${rect.left}px`;
                tooltip.style.top = `${rect.top - 10}px`;
                
                document.body.appendChild(tooltip);
                
                // Anima l'entrata del tooltip
                setTimeout(() => tooltip.classList.add('show'), 10);
            }, 1000);
        });

        ref.addEventListener('mouseleave', function() {
            clearTimeout(tooltipTimeout);
            const tooltip = document.querySelector('.footnote-tooltip');
            if (tooltip) {
                tooltip.classList.remove('show');
                setTimeout(() => tooltip.remove(), 200);
            }
        });
    });
}); 