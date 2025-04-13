# Checklist Implementazione Newsletter (Versione Italiana)

## Fase 1: Verifica Configurazione Hugo (IT)

* [x] **1.1 File i18n:** Verifica che il file `i18n/it.yaml` esista e sia correttamente configurato.
* [x] **1.2 Chiave URL Form:** Verifica che in `i18n/it.yaml` esista una chiave per l'URL `action` del form MailerLite (es. `newsletterFormAction`) e che contenga l'URL corretto del *form italiano* ottenuto da MailerLite.
* [x] **1.3 Integrazione Form:** Verifica che il partial/shortcode del form newsletter sia correttamente incluso nei template Hugo dove deve apparire (es. `layouts/partials/newsletter-form.html`, footer, pagine dedicate).
* [x] **1.4 Campi Form (HTML):** Verifica che il codice HTML del form:
  * [x] Includa un campo input per l'email (`type="email"`, `name="fields[email]"` o simile secondo la struttura MailerLite).
  * [x] Includa un campo nascosto per la lingua: `<input type="hidden" name="fields[language]" value="it">` (verifica il nome esatto del campo `language` in MailerLite).
  * [x] L'attributo `action` del tag `<form>` usi la chiave da `i18n/it.yaml` (punto 1.2).
* [x] **1.5 Pagine Statiche:** Verifica che le seguenti pagine esistano in `content/it/newsletter/` e abbiano il contenuto appropriato:
  * [x] `grazie.md` (Pagina visualizzata *dopo* l'invio del form, *prima* della conferma email).
  * [x] `confermato.md` (Pagina visualizzata *dopo* aver cliccato il link di conferma nell'email).

## Fase 2: Configurazione MailerLite (Form IT)

* [x] **2.1 Individua Form:** Accedi a MailerLite -> Forms -> Embedded forms e seleziona il form dedicato all'italiano.
* [x] **2.2 Impostazioni Form:**
  * [x] **Success Page:** Verifica che sia impostato il redirect all'URL assoluto della pagina `grazie.md` (es. `https://tuosito.com/it/newsletter/grazie/`).
  * [x] **Campi Form:** Assicurati che il form MailerLite includa il campo Email e il campo personalizzato `Language` (o come lo hai chiamato). Verifica che il campo `Language` sia di tipo "Hidden" e abbia come valore predefinito `it`.
  * [x] **Double Opt-in:** Assicurati che il double opt-in sia abilitato per questo form o per il gruppo associato.
* [x] **2.3 URL Action:** Copia/verifica l'URL `action` di questo form per confrontarlo/aggiornarlo nel file `i18n/it.yaml` (vedi punto 1.2).

## Fase 3: Configurazione MailerLite (Double Opt-in IT)

* [x] **3.1 Impostazioni Conferma:** Vai nelle impostazioni di MailerLite relative al double opt-in (potrebbero essere in "Subscriber settings", "Settings -> Subscription Settings" o nelle impostazioni del gruppo a cui il form aggiunge gli iscritti).
* [x] **3.2 Pagina Conferma:** Verifica che la "Confirmation thank you page" sia impostata nell'URL assoluto della pagina `confermato.md` (es. `https://tuosito.com/it/newsletter/confermato/`).
* [x] **3.3 Email Conferma (IT):**
  * [x] Modifica il template dell'email di conferma ("Confirmation Email").
  * [x] Traduci/adatta l'oggetto e il corpo dell'email in italiano.
  * [x] Assicurati che il link/bottone di conferma (`{$confirmation_link}` o simile) sia presente e funzionante.

## Fase 4: Test Flusso Italiano

* [x] **4.1 Test Iscrizione:**
  * [x] Vai su una pagina del sito live/preview che contiene il form italiano.
  * [x] Inserisci un indirizzo email di test.
  * [x] Invia il form.
* [x] **4.2 Verifica Redirect Grazie:** Conferma di essere stato reindirizzato correttamente alla pagina `/it/newsletter/grazie/`.
* [x] **4.3 Verifica Email Conferma:**
  * [x] Controlla la casella di posta dell'indirizzo di test.
  * [x] Verifica di aver ricevuto l'email di conferma.
  * [x] Controlla che l'oggetto e il corpo siano in italiano e corretti.
* [x] **4.4 Conferma Iscrizione:** Clicca sul link/bottone di conferma nell'email.
* [x] **4.5 Verifica Redirect Confermato:** Conferma di essere stato reindirizzato correttamente alla pagina `/it/newsletter/confermato/`.
* [x] **4.6 Verifica MailerLite:**
  * [x] Accedi a MailerLite e controlla gli iscritti nel gruppo italiano.
  * [x] Verifica che l'indirizzo email di test sia presente.
  * [x] Verifica che lo stato sia "Active" o "Confirmed".
  * [x] Verifica che il campo `Language` per questo iscritto sia impostato su `it`.
