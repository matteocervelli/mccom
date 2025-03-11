/**
 * Classe per gestire gli accordion nel sito
 */
class Accordion {
    /**
     * @param {Object} options - Opzioni di configurazione
     * @param {string} options.toggleSelector - Selettore per i pulsanti toggle
     * @param {string} options.activeClass - Classe da aggiungere quando l'accordion è aperto
     * @param {string} options.iconSelector - Selettore per l'icona toggle (opzionale)
     * @param {string} options.contentAttribute - Attributo che contiene l'ID del contenuto da mostrare
     * @param {Function} options.onToggle - Callback chiamata quando l'accordion viene aperto/chiuso (opzionale)
     */
    constructor(options = {}) {
        this.options = {
            toggleSelector: '.details-toggle',
            activeClass: 'active',
            iconSelector: '.chevron',
            contentAttribute: 'aria-controls',
            onToggle: null,
            ...options
        };

        this.toggles = document.querySelectorAll(this.options.toggleSelector);
        console.debug(`[Accordion] Initialized with ${this.toggles.length} toggles`);
        this.init();
    }

    /**
     * Inizializza gli event listener per gli accordion
     */
    init() {
        this.toggles.forEach((toggle, index) => {
            console.debug(`[Accordion] Setting up toggle ${index}:`, {
                element: toggle,
                controls: toggle.getAttribute(this.options.contentAttribute),
                hasIcon: !!toggle.querySelector(this.options.iconSelector)
            });
            
            toggle.addEventListener('click', (e) => this.handleToggle(e));
        });
    }

    /**
     * Gestisce il click su un toggle
     * @param {Event} e - Evento click
     */
    handleToggle(e) {
        e.preventDefault();
        e.stopPropagation();

        const toggle = e.currentTarget;
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const newExpandedState = !isExpanded;
        
        console.debug(`[Accordion] Toggle clicked:`, {
            element: toggle,
            wasExpanded: isExpanded,
            willBe: newExpandedState
        });

        // Aggiorna lo stato del toggle
        toggle.setAttribute('aria-expanded', newExpandedState);
        toggle.classList.toggle(this.options.activeClass, newExpandedState);

        // Trova e aggiorna il contenuto
        const targetId = toggle.getAttribute(this.options.contentAttribute);
        if (targetId) {
            const content = document.getElementById(targetId);
            if (content) {
                if (newExpandedState) {
                    content.removeAttribute('hidden');
                    content.classList.add(this.options.activeClass);
                } else {
                    content.setAttribute('hidden', '');
                    content.classList.remove(this.options.activeClass);
                }
                console.debug(`[Accordion] Content updated:`, {
                    id: targetId,
                    element: content,
                    isVisible: newExpandedState
                });
            } else {
                console.warn(`[Accordion] Content element not found for id: ${targetId}`);
            }
        }

        // Gestisce l'icona se presente
        const icon = toggle.querySelector(this.options.iconSelector);
        if (icon) {
            // Usa una trasformazione che include sia la rotazione che lo scale
            icon.style.transform = newExpandedState ? 'rotate(90deg) scaleY(1.5)' : 'rotate(-90deg) scaleY(1.5)';
            console.debug(`[Accordion] Icon updated:`, {
                element: icon,
                transform: icon.style.transform
            });
        } else {
            console.debug(`[Accordion] No icon found with selector: ${this.options.iconSelector}`);
        }

        // Chiama il callback se definito
        if (typeof this.options.onToggle === 'function') {
            this.options.onToggle(toggle, newExpandedState);
        }
    }

    /**
     * Apre un accordion specifico
     * @param {string} id - ID dell'elemento da aprire
     */
    open(id) {
        const toggle = document.querySelector(`[${this.options.contentAttribute}="${id}"]`);
        if (toggle && toggle.getAttribute('aria-expanded') !== 'true') {
            toggle.click();
        }
    }

    /**
     * Chiude un accordion specifico
     * @param {string} id - ID dell'elemento da chiudere
     */
    close(id) {
        const toggle = document.querySelector(`[${this.options.contentAttribute}="${id}"]`);
        if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
            toggle.click();
        }
    }

    /**
     * Apre tutti gli accordion
     */
    openAll() {
        this.toggles.forEach(toggle => {
            if (toggle.getAttribute('aria-expanded') !== 'true') {
                toggle.click();
            }
        });
    }

    /**
     * Chiude tutti gli accordion
     */
    closeAll() {
        this.toggles.forEach(toggle => {
            if (toggle.getAttribute('aria-expanded') === 'true') {
                toggle.click();
            }
        });
    }
}

// Esporta la classe per l'uso con moduli ES6
export default Accordion;

// Supporto per l'uso senza moduli
if (typeof window !== 'undefined') {
    window.Accordion = Accordion;
} 