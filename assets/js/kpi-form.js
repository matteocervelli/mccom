// assets/js/tools/kpi-form.js

// Funzione per mostrare messaggi di stato
function showKpiStatus(statusElement, message, type) {
    statusElement.textContent = message;
    statusElement.className = `form-status form-status--${type}`;
    statusElement.style.display = 'block';
}

// Funzione per attivare/disattivare stato di caricamento
function toggleKpiLoading(button, isLoading, lang) {
    button.disabled = isLoading;
    button.classList.toggle('is-loading', isLoading);
    button.setAttribute('aria-busy', isLoading);

    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = lang === 'it' ? 'Attendere...' : 'Please wait...';
    } else if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('kpi-download-form');
    if (!form) return; // Esci se il form non è presente

    const submitBtn = document.getElementById('kpi-submit');
    const statusMessage = document.getElementById('kpi-form-status');
    const language = form.dataset.lang || 'en'; // Leggi la lingua dal data attribute
    const thankYouUrl = language === 'it' ? '/it/tools/kpi-grazie/' : '/en/tools/kpi-thank-you/';
    const toolId = 'kpi-dashboard'; // ID dello strumento fisso per questo form

    // Gestione invio form
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const emailInput = document.getElementById('kpi-email');
        const email = emailInput.value.trim();

        // Validazione email base
        if (!email || !email.includes('@') || !email.includes('.')) {
            showKpiStatus(
                statusMessage,
                language === 'it' ? 'Inserisci un indirizzo email valido.' : 'Please enter a valid email address.',
                'error'
            );
            return;
        }

        // Attiva stato di caricamento
        toggleKpiLoading(submitBtn, true, language);
        statusMessage.style.display = 'none';

        try {
            // Chiamata alla funzione Netlify generica handle-tool-download
            const response = await fetch('/.netlify/functions/handle-tool-download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    toolId: toolId,
                    language: language
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Successo: Reindirizza alla pagina di ringraziamento
                window.location.href = thankYouUrl;
                // Opzionale: puoi mostrare un messaggio temporaneo prima del redirect se lo desideri
                // showKpiStatus(statusMessage, result.message || (language === 'it' ? 'Invio riuscito...' : 'Success...'), 'success');
                // setTimeout(() => { window.location.href = thankYouUrl; }, 1000); // Esempio con ritardo
            } else {
                // Errore API
                showKpiStatus(statusMessage, result.message || (language === 'it' ? 'Si è verificato un errore. Riprova.' : 'An error occurred. Please try again.'), 'error');
                toggleKpiLoading(submitBtn, false, language); // Disattiva loading solo in caso di errore
            }
        } catch (error) {
            // Errore Network/altro
            console.error('KPI Form Error:', error);
            showKpiStatus(
                statusMessage,
                language === 'it' ? 'Errore di rete. Riprova più tardi.' : 'Network error. Please try again later.',
                'error'
            );
            toggleKpiLoading(submitBtn, false, language); // Disattiva loading
        }
        // Nota: toggleLoading(false) viene chiamato solo in caso di errore,
        // altrimenti il redirect avviene prima.
    });
});