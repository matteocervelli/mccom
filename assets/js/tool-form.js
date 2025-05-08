// assets/js/tool-form.js

// Configurazione degli strumenti
const TOOL_CONFIGS = {
  'decision-compass': {
    mailerLiteGroups: {
      it: '84827395827395', // ID gruppo italiano
      en: '84827395827396'  // ID gruppo inglese
    },
    emailTemplate: {
      subject: {
        it: 'La tua Bussola Decisionale è pronta!',
        en: 'Your Decision Compass is Ready!'
      },
      links: {
        it: [
          'https://matteocervelli.com/it/tools/decision-compass'
        ],
        en: [
          'https://matteocervelli.com/en/tools/decision-compass'
        ]
      },
      thankYouPage: {
        it: '/it/tools/decision-compass-grazie/',
        en: '/en/tools/decision-compass-thank-you/'
      }
    }
  },
  'kpi-dashboard': {
    mailerLiteGroups: {
      it: '84827395827397',
      en: '84827395827398'
    },
    emailTemplate: {
      subject: {
        it: 'La tua Dashboard KPI è pronta!',
        en: 'Your KPI Dashboard is Ready!'
      },
      links: {
        it: ['https://matteocervelli.com/it/tools/kpi-dashboard'],
        en: ['https://matteocervelli.com/en/tools/kpi-dashboard']
      },
      thankYouPage: {
        it: '/it/tools/kpi-dashboard-grazie/',
        en: '/en/tools/kpi-dashboard-thank-you/'
      }
    }
  },
  'weekly-dashboard': {
    mailerLiteGroups: {
      it: '84827395827399',
      en: '84827395827400'
    },
    emailTemplate: {
      subject: {
        it: 'Il tuo Pannello di Controllo Settimanale è pronto!',
        en: 'Your Weekly Control Panel is Ready!'
      },
      links: {
        it: ['https://matteocervelli.com/it/tools/weekly-dashboard'],
        en: ['https://matteocervelli.com/en/tools/weekly-dashboard']
      },
      thankYouPage: {
        it: '/it/tools/weekly-dashboard-thank-you/',
        en: '/en/tools/weekly-dashboard-thank-you/'
      }
    }
  }
}

// Funzione per mostrare messaggi di stato
function showToolStatus(statusElement, message, type) {
    statusElement.textContent = message;
    statusElement.className = `form-status form-status--${type}`;
    statusElement.style.display = 'block';
}

// Funzione per attivare/disattivare stato di caricamento
function toggleToolLoading(button, isLoading, lang) {
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

// Gestione del form
function handleToolForm(event, toolId, language) {
  event.preventDefault();
  
  const form = event.target;
  const email = form.querySelector('input[type="email"]').value;
  const config = TOOL_CONFIGS[toolId];
  
  if (!config) {
    console.error(`Tool configuration not found for ${toolId}`);
    return;
  }

  // Mostra loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = language === 'it' ? 'Invio in corso...' : 'Sending...';

  // Chiama la funzione serverless
  fetch('/.netlify/functions/handle-tool-download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      toolId,
      language,
      groupId: config.mailerLiteGroups[language],
      emailTemplate: {
        subject: config.emailTemplate.subject[language],
        links: config.emailTemplate.links[language]
      }
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = config.emailTemplate.thankYouPage[language];
    } else {
      throw new Error(data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    submitButton.innerHTML = language === 'it' ? 
      'Errore, riprova più tardi' : 
      'Error, please try again later';
  })
  .finally(() => {
    submitButton.disabled = false;
    setTimeout(() => {
      submitButton.innerHTML = originalButtonText;
    }, 3000);
  });
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('tool-download-form');
    if (!form) return; // Esci se il form non è presente

    const submitBtn = document.getElementById('tool-submit');
    const statusMessage = document.getElementById('tool-form-status');
    const language = form.dataset.lang || 'en'; // Leggi la lingua dal data attribute
    const toolId = form.dataset.tool; // Leggi l'ID dello strumento

    if (!toolId) {
        console.error('Tool ID (data-tool) not found on the form.');
        return;
    }

    // Costruisci l'URL della pagina di ringraziamento
    const thankYouUrl = language === 'it' ? `/it/tools/${toolId}-grazie/` : `/en/tools/${toolId}-thank-you/`;

    // Gestione invio form
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const emailInput = document.getElementById('tool-email');
        const email = emailInput.value.trim();

        // Validazione email base
        if (!email || !email.includes('@') || !email.includes('.')) {
            showToolStatus(
                statusMessage,
                language === 'it' ? 'Inserisci un indirizzo email valido.' : 'Please enter a valid email address.',
                'error'
            );
            return;
        }

        // Attiva stato di caricamento
        toggleToolLoading(submitBtn, true, language);
        statusMessage.style.display = 'none';

        try {
            // Chiamata alla funzione Netlify generica handle-tool-download
            const response = await fetch(`/.netlify/functions/handle-tool-download`, {
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
            } else {
                // Errore API
                showToolStatus(statusMessage, result.message || (language === 'it' ? 'Si è verificato un errore. Riprova.' : 'An error occurred. Please try again.'), 'error');
                toggleToolLoading(submitBtn, false, language); // Disattiva loading solo in caso di errore
            }
        } catch (error) {
            // Errore Network/altro
            console.error('Tool Form Error:', error);
            showToolStatus(
                statusMessage,
                language === 'it' ? 'Errore di rete. Riprova più tardi.' : 'Network error. Please try again later.',
                'error'
            );
            toggleToolLoading(submitBtn, false, language); // Disattiva loading
        }
    });
}); 