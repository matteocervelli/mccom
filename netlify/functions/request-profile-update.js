const axios = require('axios');
const crypto = require('crypto');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { MailerSend, EmailParams, Recipient, Sender } = require('mailersend');

// Log modulo caricato
console.log('Modulo request-profile-update caricato');

// Helper per validare email
function isValidEmail(email) {
  const regex = /^[^ \s@]+@[^ \s@]+\.[^ \s@]+$/u;
  return regex.test(String(email).toLowerCase());
}

// Funzione per ottenere le traduzioni
function getTranslations(language) {
  // Traduzioni predefinite
  if (language === 'it') {
    return {
      profile_update_title: { other: "Conferma Aggiornamenti del Profilo" },
      profile_update_heading: { other: "Conferma Aggiornamenti del Profilo" },
      profile_update_greeting: { other: "Ciao%s," },
      profile_update_main_text: { other: "Abbiamo ricevuto una richiesta di aggiornamento delle informazioni del tuo profilo." },
      profile_update_email_label: { other: "Email" },
      profile_update_name_label: { other: "Nome" },
      profile_update_last_name_label: { other: "Cognome" },
      profile_update_language_label: { other: "Lingua" },
      profile_update_updates_label: { other: "Modifiche richieste" },
      profile_update_button: { other: "Conferma Modifiche" },
      profile_update_expiry_note: { other: "Questo link di conferma scadrà tra 24 ore." },
      profile_update_closing: { other: "Se non hai richiesto queste modifiche, ignora questa email." },
      profile_update_help_text: { other: "Se hai problemi con il pulsante sopra, copia e incolla l'URL nel tuo browser web." },
      email_rights: { other: "Tutti i diritti riservati." },
      email_privacy: { other: "Informativa sulla Privacy" },
      email_unsubscribe: { other: "Cancellati" }
    };
  } else {
    // Inglese (default)
    return {
      profile_update_title: { other: "Confirm Profile Updates" },
      profile_update_heading: { other: "Confirm Profile Updates" },
      profile_update_greeting: { other: "Hello%s," },
      profile_update_main_text: { other: "We've received a request to update your profile information." },
      profile_update_email_label: { other: "Email" },
      profile_update_name_label: { other: "Name" },
      profile_update_last_name_label: { other: "Last Name" },
      profile_update_language_label: { other: "Language" },
      profile_update_updates_label: { other: "Changes requested" },
      profile_update_button: { other: "Confirm Updates" },
      profile_update_expiry_note: { other: "This confirmation link will expire in 24 hours." },
      profile_update_closing: { other: "If you didn't request these changes, please ignore this email." },
      profile_update_help_text: { other: "If you're having trouble with the button above, copy and paste the URL into your web browser." },
      email_rights: { other: "All rights reserved." },
      email_privacy: { other: "Privacy Policy" },
      email_unsubscribe: { other: "Unsubscribe" }
    };
  }
}

// Funzione per generare un token sicuro
function generateToken(payload) {
  const tokenExpiry = 24 * 60 * 60 * 1000; // 24 ore in millisecondi
  const tokenData = {
    ...payload,
    timestamp: Date.now() + tokenExpiry
  };
  const payloadString = JSON.stringify(tokenData);
  const payloadBase64 = Buffer.from(payloadString).toString('base64');
  
  const secret = process.env.TOKEN_SECRET || 'default-secret-key';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString);
  const signature = hmac.digest('hex');
  
  return `${payloadBase64}.${signature}`;
}

// Funzione per generare il template HTML dell'email
function getEmailTemplate(data) {
  // Template HTML di base
  const template = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body {
            font-family: 'Raleway', Arial, sans-serif;
            color: #333333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .logo {
            max-width: 140px;
            margin-bottom: 20px;
        }
        
        .content {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 50px 40px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        h1 {
            font-family: 'Lora', Georgia, serif;
            color: #008080;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: bold;
        }
        
        p {
            margin-bottom: 16px;
            font-size: 16px;
        }
        
        .info-box {
            background-color: #f5f5f5;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .info-item {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 100px;
        }
        
        .button {
            display: inline-block;
            background-color: #008080;
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        
        .expire-note {
            font-size: 14px;
            color: #666666;
            font-style: italic;
        }
        
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 30px;
        }
        
        .footer a {
            color: #008080;
            text-decoration: none;
        }
        
        .url-fallback {
            word-break: break-all;
            font-size: 14px;
            color: #666666;
            margin-top: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .content {
                padding: 40px 25px;
            }
            
            h1 {
                font-size: 22px;
            }
            
            .button {
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <img src="https://adlimen.com/images/adlimen-logo.png" alt="Adlimen Logo" class="logo">
        
        <div class="content">
            <h1>{{heading}}</h1>
            <p>{{greeting}}</p>
            <p>{{main_text}}</p>
            
            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">{{email_label}}:</span>
                    <span>{{email}}</span>
                </div>
                {{#if name}}
                <div class="info-item">
                    <span class="info-label">{{name_label}}:</span>
                    <span>{{name}}</span>
                </div>
                {{/if}}
                {{#if last_name}}
                <div class="info-item">
                    <span class="info-label">{{last_name_label}}:</span>
                    <span>{{last_name}}</span>
                </div>
                {{/if}}
                {{#if language}}
                <div class="info-item">
                    <span class="info-label">{{language_label}}:</span>
                    <span>{{language}}</span>
                </div>
                {{/if}}
            </div>
            
            <a href="{{confirm_url}}" class="button">{{button_text}}</a>
            
            <p class="expire-note">{{expiry_note}}</p>
            <p>{{closing}}</p>
            
            <div class="url-fallback">
                <p>{{help_text}}</p>
                <p>{{confirm_url}}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Adlimen. {{email_rights}}</p>
            <p>
                <a href="https://adlimen.com/it/privacy-policy/">{{email_privacy}}</a> | 
                <a href="https://adlimen.com/it/newsletter/unsubscribe/">{{email_unsubscribe}}</a>
            </p>
        </div>
    </div>
</body>
</html>`;

  // Prepara le traduzioni basate sulla lingua
  const lang = data.language?.toLowerCase() || 'en';
  const nameString = data.name ? ` ${data.name}` : '';
  
  // Traduzioni di base (fallback)
  const translations = {
    it: {
      title: "Conferma Aggiornamenti del Profilo",
      heading: "Conferma Aggiornamenti del Profilo",
      greeting: `Ciao${nameString},`,
      main_text: "Abbiamo ricevuto una richiesta di aggiornamento delle informazioni del tuo profilo.",
      email_label: "Email",
      name_label: "Nome",
      last_name_label: "Cognome",
      language_label: "Lingua",
      updates_label: "Modifiche richieste",
      button_text: "Conferma Aggiornamenti",
      expiry_note: "Questo link di conferma scadrà tra 24 ore.",
      closing: "Se non hai richiesto queste modifiche, ignora questa email.",
      help_text: "Se hai problemi con il pulsante sopra, copia e incolla l'URL nel tuo browser web.",
      email_rights: "Tutti i diritti riservati.",
      email_privacy: "Privacy Policy",
      email_unsubscribe: "Annulla iscrizione"
    },
    en: {
      title: "Confirm Your Profile Updates",
      heading: "Confirm Profile Updates",
      greeting: `Hello${nameString},`,
      main_text: "We've received a request to update your profile information.",
      email_label: "Email",
      name_label: "Name",
      last_name_label: "Last Name",
      language_label: "Language",
      updates_label: "Changes requested",
      button_text: "Confirm Updates",
      expiry_note: "This confirmation link will expire in 24 hours.",
      closing: "If you didn't request these changes, please ignore this email.",
      help_text: "If you're having trouble with the button above, copy and paste the URL into your web browser.",
      email_rights: "All rights reserved.",
      email_privacy: "Privacy Policy",
      email_unsubscribe: "Unsubscribe"
    }
  };
  
  // Seleziona le traduzioni corrette
  const tr = translations[lang] || translations.en;
  
  // Sostituisci i placeholder nel template
  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate({
    title: tr.title,
    heading: tr.heading,
    greeting: tr.greeting,
    main_text: tr.main_text,
    email_label: tr.email_label,
    name_label: tr.name_label,
    last_name_label: tr.last_name_label,
    language_label: tr.language_label,
    updates_label: tr.updates_label,
    email: data.email,
    name: data.name,
    last_name: data.last_name,
    language: data.language,
    confirm_url: data.confirm_url,
    button_text: tr.button_text,
    expiry_note: tr.expiry_note,
    closing: tr.closing,
    help_text: tr.help_text,
    email_rights: tr.email_rights,
    email_privacy: tr.email_privacy,
    email_unsubscribe: tr.email_unsubscribe
  });
}

// Funzione per inviare l'email di conferma
async function sendEmail(data) {
  try {
    console.log('Preparazione invio email a:', data.email);
    
    // Verifica presenza API key
    if (!process.env.MAILERSEND_API_KEY) {
      throw new Error('MAILERSEND_API_KEY non configurata');
    }
    
    const mailersend = new MailerSend({
      api_key: process.env.MAILERSEND_API_KEY,
    });
    
    // Prepara il contenuto dell'email
    const emailContent = getEmailTemplate(data);
    
    // Configura i dettagli dell'email
    const sentFrom = new Sender(process.env.EMAIL_FROM || "newsletter@adlimen.com", "Adlimen");
    const recipients = [
      new Recipient(data.email, `${data.name} ${data.last_name}`.trim())
    ];
    
    // Determina l'oggetto dell'email in base alla lingua
    const subject = data.language === 'it' 
      ? "Conferma Aggiornamenti del Profilo"
      : "Confirm Your Profile Updates";
    
    // Crea l'email
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(emailContent);
    
    // Invia l'email
    console.log('Invio email in corso...');
    const response = await mailersend.email.send(emailParams);
    console.log('Email inviata con successo a:', data.email);
    
    return {
      success: true,
      message: `Email inviata con successo a: ${data.email}`
    };
    
  } catch (error) {
    // Log più dettagliato dell'errore
    console.error('Errore dettagliato nell\'invio dell\'email:', JSON.stringify(error, null, 2)); 
    console.error('Errore nell\'invio dell\'email (messaggio):', error?.message); // Mantiene il log originale ma più sicuro
    throw error; // Rilancia l'errore per la gestione esterna
  }
}

// Funzione handler principale per gestire le richieste
exports.handler = async (event, context) => {
  // Verifica se la richiesta è di tipo POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Metodo non consentito" })
    };
  }

  try {
    // Ottieni i dati dal corpo della richiesta
    const data = JSON.parse(event.body);
    console.log('Dati ricevuti:', data);

    // Controllo validità dell'email
    if (!data.email || !isValidEmail(data.email)) {
      console.log('Email invalida:', data.email);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email non valida" })
      };
    }

    // Crea un token per il link di conferma
    const payload = {
      email: data.email,
      name: data.name,
      last_name: data.last_name,
      language: data.language || 'en',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Scade dopo 24 ore
    };

    const token = generateToken(payload);
    
    // URL base del sito
    const baseUrl = process.env.URL || 'https://adlimen.com';
    
    // Determina la lingua per il percorso dell'URL
    const urlLang = data.language === 'it' ? '/it' : '';
    
    // Crea l'URL di conferma
    const confirmationUrl = `${baseUrl}${urlLang}/newsletter/confirm-update/?token=${token}`;
    
    // Prepara i dati dell'email
    const emailData = {
      email: data.email,
      name: data.name || '',
      last_name: data.last_name || '',
      language: data.language || 'en',
      confirm_url: confirmationUrl
    };

    // Invia l'email
    const result = await sendEmail(emailData);
    console.log('Risultato invio email:', result);

    // Risposta di successo
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email di conferma inviata con successo" })
    };
  } catch (error) {
    console.error('Errore nella gestione della richiesta:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Errore nella gestione della richiesta", error: error.message })
    };
  }
}; 