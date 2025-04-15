document.addEventListener('DOMContentLoaded', () => {
  // Seleziona tutti i form di profilo newsletter presenti nella pagina
  const profileForms = document.querySelectorAll('.newsletter-profile-form');

  profileForms.forEach(form => {
    // Leggi i dati dagli attributi data-*
    const formId = form.dataset.formId;
    const language = form.dataset.language;
    const labelSubmit = form.dataset.labelSubmit;
    const msgSubmitting = form.dataset.msgSubmitting;
    const msgSuccessPrefix = form.dataset.msgSuccessPrefix;
    const msgSuccessFallback = form.dataset.msgSuccessFallback;
    const msgSuccessSuffix = form.dataset.msgSuccessSuffix;
    const msgError = form.dataset.msgError;
    const msgErrorMissingEmail = form.dataset.msgErrorMissingEmail;

    const nameInput = form.querySelector('input[name="fields[name]"]');
    const lastnameInput = form.querySelector('input[name="fields[last_name]"]');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Recupero email dall'URL e verifico la sua presenza
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');

      // Rimuovi eventuali messaggi di errore precedenti
      const existingError = form.parentElement.querySelector('.form-error-message');
      if (existingError) {
        existingError.remove();
      }

      if (!email) {
        console.error("Parametro email mancante nell'URL.");
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = labelSubmit;
        }
        displayMessage(form, msgErrorMissingEmail, 'error');
        return; // Interrompo l'esecuzione
      }

      const name = nameInput ? nameInput.value : '';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = msgSubmitting;
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', form.action, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = labelSubmit;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            const successMsg = `${msgSuccessPrefix} ${name || msgSuccessFallback}! ${msgSuccessSuffix}`;
            // Sostituisci l'intero wrapper del form con il messaggio di successo
            const formWrapper = form.closest('.ml-form-embedContainer');
            if(formWrapper){
              formWrapper.innerHTML = `<p style="text-align: center; padding: 1rem 0;">${successMsg}</p>`;
            }
          } else {
            displayMessage(form, msgError, 'error');
          }
        }
      };

      const formData = new FormData(form);
      formData.append('fields[email]', email);

      const urlEncoded = new URLSearchParams(formData).toString();
      xhr.send(urlEncoded);
    });
  });

  // Funzione helper per visualizzare messaggi
  function displayMessage(formElement, message, type = 'error') {
    const noteElement = formElement.nextElementSibling;
    const messageElement = document.createElement('p');
    messageElement.classList.add('form-message'); // Classe generica per styling
    messageElement.classList.add(type === 'error' ? 'form-error-message' : 'form-success-message');
    messageElement.style.color = type === 'error' ? 'red' : 'green'; // Stili base
    messageElement.style.textAlign = 'center';
    messageElement.style.marginTop = '1rem';
    messageElement.textContent = message;

    // Inserisci il messaggio dopo la nota se esiste, altrimenti dopo il form
    if (noteElement && noteElement.classList.contains('newsletter-profile-form__note')) {
        noteElement.parentNode.insertBefore(messageElement, noteElement.nextSibling);
    } else {
        formElement.parentNode.appendChild(messageElement);
    }
  }
}); 