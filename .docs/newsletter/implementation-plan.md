# Piano di Implementazione: Migrazione Newsletter a MailerLite e Archivio su Hugo

Questo documento traccia i passaggi necessari per migrare la newsletter da ConvertKit a MailerLite, implementare un archivio sul sito Hugo (WEB_mccom) e configurare le sequenze di benvenuto.

## Checklist

**1. Configurazione MailerLite:**

- [x] **1.1 Creare gruppi:** Definiti e creati gruppi per lingua (`Newsletter IT`, `Newsletter EN`), per stato (`Prospect`), per azioni (`Booked Call`, `Booked Free Consultancy`, `Download_KPI_template`, `Scanned QR BusinessCard`, `Sent Outbound Email`, `Contacted By Email`). *Completato.* `[Data Completamento: YYYY-MM-DD]`
- [x] **1.2 Strategia Migrazione Contatti:** Confermata strategia di **re-opt-in**. Si procederà con email che richiede conferma esplicita. *Completato.* `[Data Completamento: YYYY-MM-DD]`
- [x] **1.3 Generare Chiave API:** Chiave API generata su MailerLite e salvata nel file `.env` (variabile `MAILERLITE_API_KEY`). *Completato.* `[Data Completamento: YYYY-MM-DD]`
- [x] **1.4 Definire Campi Personalizzati:** Creati campi `language`, `Customer`, `Ex Customer`. *Completato.* `[Data Completamento: YYYY-MM-DD]`

**2. Struttura Sito Hugo (WEB_mccom):**

- [x] **2.1 Creare Sezione Contenuti:** Create le cartelle `content/it/newsletter/` e `content/en/newsletter/`. *Completato.* `[Data Completamento: YYYY-MM-DD]`
- [x] **2.2 Creare Archetype:** Creato il file `archetypes/newsletter.md`. *Completato.* `[Data Completamento: YYYY-MM-DD]`
- [x] **2.3 Sviluppare Layout Archivio:** Layout `list.html` creato e funzionante. Layout `single.html` creato con struttura base funzionante (semplificata per risolvere errore). *Parzialmente Completato.* `[Data Completamento: YYYY-MM-DD]`
    - [x] **2.3.1 Rifinire Layout Single:** Implementare la hero section personalizzata (stile immagine esempio, colori brand) e risolvere eventuali conflitti di template per `layouts/newsletter/single.html`. *Completato.* `[Data Completamento: YYYY-MM-DD]`
- [x] **2.4 Creare Pagine Indice:** Creati i file `content/it/newsletter/_index.md` e `content/en/newsletter/_index.md` con titolo e introduzione. *Completato.* `[Data Completamento: YYYY-MM-DD]`

**3. Contenuti Archivio:**

- [x] **3.1 Creare File Newsletter Passate:** Creati i file Markdown per le newsletter #1 (3 Pillars) e #2 (5 KPI) in italiano e inglese. *Completato.* `[Data Completamento: YYYY-MM-DD]`

**4. Integrazione Form Iscrizione:**

- [x] **4.1 Aggiornare Footer:** Modificare `layouts/partials/site-footer.html` per collegare i form di iscrizione IT ed EN ai rispettivi gruppi/form MailerLite. *Completato.* `[Data Completamento: YYYY-MM-DD]` Aggiornato il partial newsletter.html mantenendo un design semplice e utilizzando le traduzioni per gestire form IT/EN, poi ripristinato design originale risolvendo problemi tecnici di redirect JS.
- [x] **4.2 Aggiungere Iscrizione su Pagina Archivio:** Inserire link/form di iscrizione nelle pagine `newsletter/_index.md` (create al punto 2.4). *Completato.* `[Data Completamento: YYYY-MM-DD]` Create le pagine di conferma (`grazie.md` e `confermato.md` in italiano, `thank-you.md` e `confirmed.md` in inglese) e configurato il redirect su MailerLite e nel partial Hugo. Escluse le pagine di conferma dalla lista archivio.
- [ ] **4.3 Implementare Progressive Profiling (Raccolta Nome Post-Conferma)**

**5. Design Pagine Newsletter:**

- [x] **5.1 Rivedere Layout List/Single:** Ottimizzare il design delle pagine `list.html` e `single.html` della newsletter. Rimuovere sidebar laterale, posizionare form in `list.html`, implementare visualizzazione numero issue stile Justin Welsh.

**6. Automazione MailerLite (Welcome Sequence):**

- [ ] **6.1 Creare Automazione Base**
- [ ] **6.2 Differenziare Email per Lingua (IT/EN)**
- [ ] **6.3 Definire Contenuto Sequenza Benvenuto**

**7. Migrazione Contatti:**

- [ ] **7.1 Esportare da ConvertKit:** Scaricare la lista completa dei contatti da ConvertKit.
- [ ] **7.2 Campagna Re-Opt-in:** Inviare la campagna email di re-opt-in ai contatti esportati, utilizzando MailerLite.
- [ ] **7.3 Importare Contatti Attivi:** Importare in MailerLite solo i contatti che hanno confermato l'iscrizione tramite la campagna re-opt-in, assegnandoli ai gruppi corretti (IT/EN).

**8. Configurazione Deployment (Netlify):**

- [ ] **8.1 Impostare Variabili d'Ambiente:** Verificare che la variabile `MAILERLITE_API_KEY` sia impostata correttamente su Netlify quando necessario per le integrazioni.

**9. Test e Rilascio:**

- [x] **9.1 Test Form Iscrizione:** Verificare che l'iscrizione tramite i form sul sito aggiunga correttamente i contatti ai gruppi giusti su MailerLite. *Completato per IT*. Flusso di redirect corretto dopo aggiunta script JS e struttura HTML MailerLite.
- [x] **9.2 Test Visualizzazione Archivio:** Controllare che le pagine `list.html` e `single.html` della sezione newsletter funzionino come previsto. *Completato per IT*. Escluse pagine di servizio, rimosse sidebar/colonne.
- [ ] **9.3 Test Welcome Sequence:** Iscriversi come test per verificare che le automazioni partano correttamente e inviino le email giuste per ogni lingua.
- [ ] **9.4 Monitoraggio Migrazione:** Tenere sotto controllo i risultati della campagna del punto 7.2 e l'importazione del punto 7.3.

**10. Post-Lancio:**

- [ ] **10.1 Aggiornamento Piano:** Rivedere questo piano e segnare tutti i punti come completati.
- [ ] **10.2 Monitoraggio Continuo:** Controllare periodicamente le performance dei form, delle automazioni e della deliverability.
- [ ] **10.3 Backup ConvertKit:** Una volta sicuri della migrazione, effettuare un backup finale di ConvertKit e considerare la chiusura dell'account.
