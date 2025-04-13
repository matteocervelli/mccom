# Flusso di Registrazione Newsletter (Hugo + MailerLite)

Questo documento descrive i passaggi del processo di iscrizione alla newsletter *The Scalability Compass* per gli utenti italiani e inglesi.

**Premessa:**

- Il sito Hugo utilizza i18n per gestire i contenuti in italiano (`it`) e inglese (`en`).
- I form di iscrizione sono incorporati nelle pagine del sito.
- MailerLite gestisce la raccolta degli iscritti, il double opt-in e (potenzialmente) le email.
- Esiste un campo personalizzato `Language` in MailerLite.
- Sono state create pagine statiche dedicate in Hugo per le fasi del processo.

## Passaggi del Workflow

1. **Invio del Form (Utente sul sito Hugo)**
   - L'utente compila il form di iscrizione sulla versione italiana o inglese del sito.
   - Il form inviato a MailerLite contiene:
     - L'indirizzo email dell'utente.
     - (Opzionale nel form, ma inviato nascosto) Un campo `Language` con valore `it` o `en`.

   *Nota: Si richiede solo l'indirizzo email nel form iniziale per minimizzare l'attrito e massimizzare le conversioni. Dati aggiuntivi come Nome e Cognome possono essere richiesti successivamente (Progressive Profiling).*

2. **Redirect Post-Invio (MailerLite -> Hugo)**
   - MailerLite riceve i dati.
   - Immediatamente, MailerLite reindirizza l'utente alla pagina di "ringraziamento pre-conferma" configurata nel form specifico:
     - **Form Italiano:** Reindirizza a `[URL_SITO]/it/newsletter/grazie/`.
     - **Form Inglese:** Reindirizza a `[URL_SITO]/en/newsletter/thank-you/`.
   - L'utente visualizza la pagina Hugo che lo invita a controllare la propria email per confermare l'iscrizione.

3. **Email di Conferma Double Opt-in (MailerLite)**
   - MailerLite invia un'email all'indirizzo fornito.
   - **Contenuto Email:**
     - *Ideale:* Il contenuto dell'email (oggetto, testo) è nella lingua corrispondente (`it` o `en`), gestito tramite gruppi separati o automazioni in MailerLite che leggono il campo `Language`.
     - *Base:* Se si usa l'email di conferma standard unica, il testo sarà in una lingua predefinita.
   - L'email contiene un link univoco di conferma.

4. **Conferma Email (Utente)**
   - L'utente apre l'email e clicca sul link/bottone di conferma.

5. **Redirect Post-Conferma (MailerLite -> Hugo)**
   - Il click conferma l'iscrizione in MailerLite.
   - MailerLite reindirizza l'utente alla pagina di "iscrizione confermata" configurata (a livello globale, di gruppo o di form, a seconda delle capacità di MailerLite):
     - **Utente Italiano:** Reindirizza a `[URL_SITO]/it/newsletter/confermato/`.
     - **Utente Inglese:** Reindirizza a `[URL_SITO]/en/newsletter/confirmed/`.
   - L'utente visualizza la pagina Hugo che conferma l'avvenuta iscrizione.

6. **Iscrizione Attiva (MailerLite)**
   - L'utente è ora un iscritto attivo nel gruppo MailerLite corrispondente.
   - Lo stato è confermato e il campo `Language` è registrato.
   - *A questo punto, l'email è l'unico dato utente sicuramente presente (oltre alla lingua).*

7. **(Opzionale) Raccolta Dati Aggiuntivi (Post-Conferma)**
   - **Obiettivo:** Raccogliere Nome/Cognome per personalizzazione.
   - **Metodi:**
     - **Form su Pagina Confermata:** Includere un mini-form opzionale sulle pagine `confermato.md`/`confirmed.md` che invita a inserire il nome per personalizzare le comunicazioni.
     - **Link Aggiornamento Profilo:** Includere un link nell'email/sequenza di benvenuto che porta a un form MailerLite per aggiornare/completare il profilo utente.
   - *Questo passaggio è separato dall'iscrizione iniziale per non ostacolarla.*

8. **(Opzionale) Automazione di Benvenuto (MailerLite)**
   - Un'automazione in MailerLite può essere attivata quando un iscritto viene aggiunto/confermato a un gruppo.
   - Questa automazione può:
     - Inviare un'email di benvenuto.
     - Avviare una sequenza di onboarding.
     - Segmentare ulteriormente l'utente.
     - Il contenuto dell'automazione può essere personalizzato in base al campo `Language`.

---

*Nota: Sostituire `[URL_SITO]` con l'URL base effettivo del sito web.* 