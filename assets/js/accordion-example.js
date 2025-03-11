/**
 * Esempio di utilizzo della classe Accordion
 * 
 * HTML richiesto:
 * <button class="details-toggle" aria-expanded="false" aria-controls="content-1">
 *   <span class="chevron">></span>
 *   Toggle
 * </button>
 * <div id="content-1" class="details-content" hidden>
 *   Contenuto dell'accordion
 * </div>
 */

// Importa la classe se stai usando moduli ES6
// import Accordion from './accordion.js';

document.addEventListener('DOMContentLoaded', function() {
    // Inizializza l'accordion con le opzioni di default
    const basicAccordion = new Accordion();

    // Oppure con opzioni personalizzate
    const customAccordion = new Accordion({
        toggleSelector: '.my-custom-toggle',
        activeClass: 'opened',
        iconSelector: '.my-icon',
        contentAttribute: 'data-content',
        onToggle: (toggle, isExpanded) => {
            console.log(`Accordion toggled: ${isExpanded}`);
        }
    });

    // Esempi di utilizzo dei metodi
    
    // Apri un accordion specifico
    basicAccordion.open('content-1');

    // Chiudi un accordion specifico
    basicAccordion.close('content-1');

    // Apri tutti gli accordion
    basicAccordion.openAll();

    // Chiudi tutti gli accordion
    basicAccordion.closeAll();
}); 