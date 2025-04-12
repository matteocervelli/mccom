---
title: "Grazie per l'iscrizione!"
date: 2025-04-12
draft: false
layout: "minimal"
description: "La tua richiesta di iscrizione alla newsletter è stata ricevuta."
robots: "noindex, nofollow"
exclude_from_list: true
---

## Grazie per l'iscrizione!

La tua richiesta di iscrizione a *The Scalability Compass* è stata ricevuta.

**Per completare l'iscrizione, conferma il tuo indirizzo email cliccando sul link nell'email che ti abbiamo appena inviato.**

Se non vedi l'email nella tua casella di posta, controlla nella cartella spam o promozioni.

<div class="resend-section">
  <p>
    <a href="javascript:void(0);" id="resend-link" class="resend-link">Non hai ricevuto l'email di conferma? Clicca qui per richiederne un nuovo invio</a>
  </p>
  <p id="resend-message" class="resend-message"></p>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const resendLink = document.getElementById('resend-link');
  const messageEl = document.getElementById('resend-message');
  let isSending = false; // Flag per evitare click multipli
  
  // Recupera email dai parametri URL
  const urlParams = new URLSearchParams(window.location.search);
  let email = urlParams.get('email') || '';
  
  // Gestisci il click sul link
  resendLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (isSending) return; // Previene invii multipli

    let emailToUse = email;
    
    // Se non abbiamo una email nell'URL, mostriamo un prompt
    if (!emailToUse) {
      const userEmail = prompt('Inserisci il tuo indirizzo email per richiedere un nuovo invio:');
      if (!userEmail || !isValidEmail(userEmail)) {
        showMessage('Per favore, inserisci un indirizzo email valido.', 'error');
        return;
      }
      emailToUse = userEmail;
    }
    
    sendConfirmationRequest(emailToUse);
  });
  
  function sendConfirmationRequest(emailAddress) {
    isSending = true;
    // Aggiorna UI
    resendLink.classList.add('sending');
    resendLink.textContent = 'Invio in corso...';
    showMessage('', ''); // Pulisce messaggio precedente
    
    // Invia richiesta
    fetch('/api/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAddress, language: 'it' })
    })
    .then(response => response.json())
    .then(data => {
      showMessage('Richiesta inviata! Controlla la tua casella di posta (anche spam) per l\'email di conferma.', 'success');
    })
    .catch(error => {
      console.error('Error:', error);
      showMessage('Si è verificato un errore. Riprova più tardi o contatta il supporto.', 'error');
    })
    .finally(() => {
      isSending = false;
      resendLink.classList.remove('sending');
      resendLink.textContent = 'Non hai ricevuto l'email di conferma? Clicca qui per richiederne un nuovo invio';
    });
  }
  
  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'resend-message ' + type;
    // Rende il messaggio visibile se c'è testo
    messageEl.style.display = text ? 'block' : 'none'; 
  }
  
  function isValidEmail(emailToCheck) {
    // Semplice regex per validazione email
    return /\S+@\S+\.\S+/.test(emailToCheck);
  }
});
</script>

Puoi tornare alla [Homepage](/it/) o esplorare l'[Archivio Newsletter](/it/newsletter/). 