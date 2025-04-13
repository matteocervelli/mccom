# Checklist Implementazione Newsletter (Versione Inglese)

## Fase 1: Verifica Configurazione Hugo (EN)

* [x] **1.1 File i18n:** Verifica che il file `i18n/en.yaml` esista e sia correttamente configurato.
* [x] **1.2 Chiave URL Form:** Verifica che in `i18n/en.yaml` esista una chiave per l'URL `action` del form MailerLite (es. `newsletter_form_action`) e che contenga l'URL corretto del *form inglese* ottenuto da MailerLite.
  * ✅ **CORRETTO**: L'URL nel file `i18n/en.yaml` è stato aggiornato da `151309607914964876` (ID form italiano) a `151481753002837465` (ID form inglese).
* [x] **1.3 Integrazione Form:** Verifica che il partial/shortcode del form newsletter sia correttamente incluso nei template Hugo dove deve apparire.
  * ✅ **CORRETTO**: Il partial newsletter.html è stato aggiornato e ora è correttamente configurato.
* [x] **1.4 Campi Form (HTML):** Verifica che il codice HTML del form:
  * [x] Includa un campo input per l'email (`type="email"`, `name="fields[email]"` o simile secondo la struttura MailerLite).
  * [x] Includa un campo nascosto per la lingua: `<input type="hidden" name="fields[language]" value="en">`.
  * [x] L'attributo `action` del tag `<form>` usi la chiave da `i18n/en.yaml` (punto 1.2).
* [x] **1.5 Pagine Statiche:** Verifica che le seguenti pagine esistano in `content/en/newsletter/` e abbiano il contenuto appropriato:
  * [x] `thank-you.md` (Pagina visualizzata *dopo* l'invio del form, *prima* della conferma email).
  * [x] `confirmed.md` (Pagina visualizzata *dopo* aver cliccato il link di conferma nell'email).

## Fase 2: Configurazione MailerLite (Form EN)

* [x] **2.1 Individua Form:** Accedi a MailerLite -> Forms -> Embedded forms e seleziona il form dedicato all'inglese.
* [x] **2.2 Impostazioni Form:**
  * [x] **Success Page:** Verifica che sia impostato il redirect all'URL assoluto della pagina `thank-you.md` (es. `https://tuosito.com/en/newsletter/thank-you/`).
  * [x] **Campi Form:** Assicurati che il form MailerLite includa il campo Email e il campo personalizzato `Language`. Verifica che il campo `Language` sia di tipo "Hidden" e abbia come valore predefinito `en`.
  * [x] **Double Opt-in:** Assicurati che il double opt-in sia abilitato per questo form o per il gruppo associato.
* [x] **2.3 URL Action:** Copia/verifica l'URL `action` di questo form per confrontarlo/aggiornarlo nel file `i18n/en.yaml`.

## Fase 3: Configurazione MailerLite (Double Opt-in EN)

* [x] **3.1 Impostazioni Conferma:** Vai nelle impostazioni di MailerLite relative al double opt-in.
* [x] **3.2 Pagina Conferma:** Verifica che la "Confirmation thank you page" sia impostata nell'URL assoluto della pagina `confirmed.md` (es. `https://tuosito.com/en/newsletter/confirmed/`).
* [x] **3.3 Email Conferma (EN):**
  * [x] Verifica il template dell'email di conferma ("Confirmation Email").
  * [x] Assicurati che l'oggetto e il corpo dell'email siano in inglese e correttamente formulati.
  * [x] Assicurati che il link/bottone di conferma (`{$confirmation_link}` o simile) sia presente e funzionante.

## Fase 4: Test Flusso Inglese

* [x] **4.1 Test Iscrizione:**
  * [x] Vai su una pagina del sito live/preview che contiene il form inglese.
  * [x] Inserisci un indirizzo email di test.
  * [x] Invia il form.
* [x] **4.2 Verifica Redirect Grazie:** Conferma di essere stato reindirizzato correttamente alla pagina `/en/newsletter/thank-you/`.
* [x] **4.3 Verifica Email Conferma:**
  * [x] Controlla la casella di posta dell'indirizzo di test.
  * [x] Verifica di aver ricevuto l'email di conferma.
  * [x] Controlla che l'oggetto e il corpo siano in inglese e corretti.
* [x] **4.4 Conferma Iscrizione:** Clicca sul link/bottone di conferma nell'email.
* [x] **4.5 Verifica Redirect Confermato:** Conferma di essere stato reindirizzato correttamente alla pagina `/en/newsletter/confirmed/`.
* [x] **4.6 Verifica MailerLite:**
  * [x] Accedi a MailerLite e controlla gli iscritti nel gruppo inglese.
  * [x] Verifica che l'indirizzo email di test sia presente.
  * [x] Verifica che lo stato sia "Active" o "Confirmed".
  * [x] Verifica che il campo `Language` per questo iscritto sia impostato su `en`.

## Note Finali

* [x] Tutti i controlli sono stati completati con successo
* [x] La funzione di reinvio non funziona in maniera consistente, pertanto è stata rimossa dalle pagine di ringraziamento (`thank-you.md` e `grazie.md`)
* [x] Il flusso di iscrizione EN è stato verificato e funziona correttamente

**✅ Implementazione completata con successo! Data: [Inserire data di oggi]**
