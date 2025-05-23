// Placeholder per lo script di reinvio conferma newsletter 

document.addEventListener('DOMContentLoaded', function() {
  const resendContainer = document.querySelector('.resend-section');
  if (!resendContainer) return; // Esci se il contenitore non esiste

  const resendLink = resendContainer.querySelector('.resend-link');
  const messageEl = resendContainer.querySelector('.resend-message');
  const language = document.documentElement.lang || 'it'; // Ottieni la lingua dall'attributo lang dell'HTML
  let isSending = false;

  if (!resendLink || !messageEl) return; // Esci se gli elementi non esistono

  // Recupera email dai parametri URL
  const urlParams = new URLSearchParams(window.location.search);
  let email = urlParams.get('email') || '';

  // Ottieni i testi dal dataset dell'elemento link (li aggiungeremo nel Markdown)
  const initialLinkText = resendLink.dataset.textInitial || "Non hai ricevuto l'email di conferma? Clicca qui per richiederne un nuovo invio";
  const sendingLinkText = resendLink.dataset.textSending || "Invio in corso...";
  const promptText = resendLink.dataset.textPrompt || "Inserisci il tuo indirizzo email per richiedere un nuovo invio:";
  const invalidEmailText = resendLink.dataset.textInvalidEmail || "Per favore, inserisci un indirizzo email valido.";
  const successMessage = resendLink.dataset.messageSuccess || "Richiesta inviata! Controlla la tua casella di posta (anche spam) per l'email di conferma.";
  const errorMessage = resendLink.dataset.messageError || "Si è verificato un errore. Riprova più tardi o contatta il supporto.";

  // Imposta il testo iniziale del link
  resendLink.textContent = initialLinkText;

  resendLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (isSending) return;

    let emailToUse = email;

    if (!emailToUse) {
      const userEmail = prompt(promptText);
      if (!userEmail || !isValidEmail(userEmail)) {
        showMessage(invalidEmailText, 'error');
        return;
      }
      emailToUse = userEmail;
    }

    sendConfirmationRequest(emailToUse);
  });

  function sendConfirmationRequest(emailAddress) {
    isSending = true;
    resendLink.classList.add('sending');
    resendLink.textContent = sendingLinkText;
    showMessage('', '');

    // Usa il percorso diretto della funzione Netlify
    const apiUrl = '/.netlify/functions/resend-confirmation';
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAddress, language: language })
    };

    fetch(apiUrl, fetchOptions)
    .then(response => {
      // Controlla se la risposta è OK prima di tentare il parsing JSON
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Fetch failed with status:', response.status, response.statusText);
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        });
      }
      return response.json();
    })
    .then(data => {
      showMessage(successMessage, 'success');
    })
    .catch(error => {
      console.error('Error sending confirmation request:', error);
      showMessage(errorMessage, 'error'); 
    })
    .finally(() => {
      isSending = false;
      resendLink.classList.remove('sending');
      resendLink.textContent = initialLinkText;
    });
  }

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'resend-message ' + type;
    messageEl.style.display = text ? 'block' : 'none';
  }

  function isValidEmail(emailToCheck) {
    return /\S+@\S+\.\S+/.test(emailToCheck);
  }
}); 