---
title: "Iscrizione Confermata!"
date: 2025-04-12
draft: false
layout: "minimal"
description: "La tua iscrizione alla newsletter è stata confermata con successo."
robots: "noindex, nofollow"
exclude_from_list: true
---

Grazie per aver confermato il tuo indirizzo email.

Sei ora ufficialmente iscritto alla newsletter *The Scalability Compass*. Riceverai i prossimi aggiornamenti direttamente nella tua casella di posta.

## Vuoi personalizzare la tua esperienza?

Facci conoscere il tuo nome per permetterci di personalizzare le nostre comunicazioni:

<div id="mlb2-subscription-details" 
     class="ml-form-embedContainer ml-subscribe-form"
     data-form-id="24694811">
  <div style="max-width: 24em; margin: 2em auto;"> 
    <form id="profile-completion-form" 
      class="newsletter-form" 
      action="https://static.mailerlite.com/webforms/submit/n9m3w4"
      method="post">
      <div class="form-group mb-2">
        <input type="text" 
              name="fields[name]"
              placeholder="Il tuo nome"
              class="newsletter-form__input" 
              aria-label="Inserisci il tuo nome"
              id="profile-name"
              autocomplete="given-name">
      </div>
      <div class="form-group mb-2">
        <input type="text" 
              name="fields[last_name]"
              placeholder="Il tuo cognome (opzionale)"
              class="newsletter-form__input" 
              aria-label="Inserisci il tuo cognome"
              id="profile-lastname"
              autocomplete="family-name">
      </div>
      <input type="hidden" name="fields[language]" value="it">
      <input type="hidden" name="ml-submit" value="1">
      <input type="hidden" name="anticsrf" value="true">
      
      <button type="submit"
              class="newsletter-form__button" 
              aria-label="Salva le mie informazioni">
        Salva le mie informazioni
      </button>
    </form>
    <small style="display: block; text-align: center; margin-top: 0.5rem; color: var(--color-tx-muted);">Questo passaggio è opzionale ma ci aiuta a personalizzare la tua esperienza.</small>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('profile-completion-form');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('profile-name').value;
      var lastname = document.getElementById('profile-lastname').value;
      
      // Submit via AJAX
      var xhr = new XMLHttpRequest();
      xhr.open('POST', form.action, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            form.innerHTML = '<p style="text-align: center;">Grazie, ' + (name || 'iscritto') + '! Le tue informazioni sono state salvate.</p>';
          }
        }
      };
      
      var formData = new FormData(form);
      var urlEncoded = new URLSearchParams(formData).toString();
      xhr.send(urlEncoded);
    });
  });
</script>

Puoi tornare alla [Homepage](/it/) o esplorare l'[Archivio Newsletter](/it/newsletter/).
