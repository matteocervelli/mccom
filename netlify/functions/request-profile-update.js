const axios = require('axios');
const crypto = require('crypto');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Log modulo caricato
console.log('Modulo request-profile-update caricato');

// Carica il template dell'email
function loadEmailTemplate() {
  try {
    const templatePath = path.resolve(__dirname, '../../static/email-templates/profile-update-template.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(template);
  } catch (error) {
    console.error('Errore nel caricamento del template email:', error);
    // Template fallback
    const fallbackTemplate = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>{{title}}</title>
    </head>
    <body>
      <h1>{{heading}}</h1>
      <p>{{greeting}}</p>
      <p>{{main_text}}</p>
      <div>
        <p>Email: {{email}}</p>
        <p>{{updates_label}}: {{#if name}}{{name}}{{/if}} {{#if last_name}}{{last_name}}{{/if}} {{#if language}}{{language}}{{/if}}</p>
      </div>
      <p><a href="{{confirm_url}}">{{button_text}}</a></p>
      <p>{{expiry_note}}</p>
      <p>{{closing}}</p>
      <p>{{help_text}}<br>{{confirm_url}}</p>
    </body>
    </html>`;
    return handlebars.compile(fallbackTemplate);
  }
}

// Funzione per caricare le traduzioni dal file YAML
function loadTranslations() {
  try {
    const enPath = path.resolve(__dirname, '../../i18n/en.yaml');
    const itPath = path.resolve(__dirname, '../../i18n/it.yaml');
    
    const enContent = fs.readFileSync(enPath, 'utf8');
    const itContent = fs.readFileSync(itPath, 'utf8');
    
    // Parsing YAML
    const enTranslations = yaml.load(enContent);
    const itTranslations = yaml.load(itContent);
    
    return {
      en: enTranslations,
      it: itTranslations
    };
  } catch (error) {
    console.error('Errore nel caricamento delle traduzioni:', error);
    // Fallback con traduzioni di base
    return {
      en: {
        profile_update_title: { other: "Confirm Your Profile Updates" },
        profile_update_heading: { other: "Confirm Profile Updates" },
        profile_update_greeting: { other: "Hello%s," },
        profile_update_main_text: { other: "We've received a request to update your profile information. Please review the changes below and confirm by clicking the button." },
        profile_update_email_label: { other: "Email" },
        profile_update_updates_label: { other: "Changes requested" },
        profile_update_button: { other: "Confirm Updates" },
        profile_update_expiry_note: { other: "This confirmation link will expire in 24 hours for your security." },
        profile_update_closing: { other: "If you didn't request these changes, please ignore this email or contact us for assistance." },
        profile_update_help_text: { other: "If you're having trouble with the button above, copy and paste the URL into your web browser." },
        email_rights: { other: "All rights reserved." },
        email_privacy: { other: "Privacy Policy" },
        email_unsubscribe: { other: "Unsubscribe" }
      },
      it: {
        profile_update_title: { other: "Conferma gli Aggiornamenti del Profilo" },
        profile_update_heading: { other: "Conferma Aggiornamenti Profilo" },
        profile_update_greeting: { other: "Ciao%s," },
        profile_update_main_text: { other: "Abbiamo ricevuto una richiesta di aggiornamento delle informazioni del tuo profilo. Controlla le modifiche qui sotto e conferma cliccando il pulsante." },
        profile_update_email_label: { other: "Email" },
        profile_update_updates_label: { other: "Modifiche richieste" },
        profile_update_button: { other: "Conferma Aggiornamenti" },
        profile_update_expiry_note: { other: "Questo link di conferma scadrà tra 24 ore per la tua sicurezza." },
        profile_update_closing: { other: "Se non hai richiesto queste modifiche, ignora questa email o contattaci per assistenza." },
        profile_update_help_text: { other: "Se hai problemi con il pulsante sopra, copia e incolla l'URL nel tuo browser web." },
        email_rights: { other: "Tutti i diritti riservati." },
        email_privacy: { other: "Privacy Policy" },
        email_unsubscribe: { other: "Cancellati" }
      }
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

// Funzione per inviare email tramite MailerSend
async function sendEmail(to, lang, data) {
  const mailersendApiKey = process.env.MAILERSEND_API_KEY;
  if (!mailersendApiKey) {
    console.error('MAILERSEND_API_KEY non configurata');
    throw new Error('MAILERSEND_API_KEY non configurata');
  }
  
  // Carica traduzioni
  const translations = loadTranslations();
  const i18n = lang.toLowerCase() === 'en' ? translations.en : translations.it;
  
  // Prepara il template
  const compiledTemplate = loadEmailTemplate();
  
  // Estrai nome per il saluto personalizzato
  const nameString = data.name ? ` ${data.name}` : '';
  
  // Prepara i dati per il template
  const templateData = {
    title: i18n.profile_update_title?.other || "Profile Update",
    heading: i18n.profile_update_heading?.other || "Confirm Profile Updates",
    greeting: (i18n.profile_update_greeting?.other || "Hello%s,").replace('%s', nameString),
    main_text: i18n.profile_update_main_text?.other || "We've received a request to update your profile information.",
    email: data.email,
    updates_label: i18n.profile_update_updates_label?.other || "Changes requested",
    name: data.name,
    last_name: data.last_name,
    language: data.language,
    confirm_url: data.confirm_url,
    button_text: i18n.profile_update_button?.other || "Confirm Updates",
    expiry_note: i18n.profile_update_expiry_note?.other || "This confirmation link will expire in 24 hours.",
    closing: i18n.profile_update_closing?.other || "If you didn't request these changes, please ignore this email.",
    help_text: i18n.profile_update_help_text?.other || "If you're having trouble with the button above, copy and paste the URL into your web browser.",
    email_rights: i18n.email_rights?.other || "All rights reserved.",
    email_privacy: i18n.email_privacy?.other || "Privacy Policy",
    email_unsubscribe: i18n.email_unsubscribe?.other || "Unsubscribe"
  };
  
  // Genera il contenuto HTML dell'email
  const emailHtml = compiledTemplate(templateData);
  
  // Costruisci il payload per MailerSend
  const emailPayload = {
    from: {
      email: process.env.EMAIL_FROM || "no-reply@adlimen.com",
      name: "Adlimen"
    },
    to: [
      {
        email: to,
        name: data.name && data.last_name ? `${data.name} ${data.last_name}` : (data.name || to)
      }
    ],
    subject: templateData.title,
    html: emailHtml,
    text: `${templateData.heading}\n\n${templateData.greeting}\n\n${templateData.main_text}\n\nEmail: ${data.email}\n${templateData.updates_label}: ${data.name || ''} ${data.last_name || ''} ${data.language || ''}\n\n${templateData.button_text}: ${data.confirm_url}\n\n${templateData.expiry_note}\n\n${templateData.closing}\n\n${templateData.help_text}\n${data.confirm_url}`
  };
  
  // Rimuoviamo la logica per usare il template_id di MailerSend
  // Usiamo sempre l'HTML generato localmente
  return axios.post(
    'https://api.mailersend.com/v1/email',
    emailPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mailersendApiKey}`
      }
    }
  );
}

// Funzione handler della richiesta
exports.handler = async (event, context) => {
  console.log('Funzione request-profile-update invocata');
  console.log('Metodo HTTP:', event.httpMethod);
  console.log('Body presente:', !!event.body);
  
  if (event.httpMethod !== 'POST') {
    console.log('Errore: metodo non consentito', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Metodo non consentito' })
    };
  }
  
  try {
    // Estrai dati dalla richiesta
    const data = JSON.parse(event.body);
    console.log('Dati ricevuti:', JSON.stringify(data, null, 2));
    
    // Validazione base
    if (!data.email || !data.email.includes('@')) {
      console.log('Errore: email non valida');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'Email non valida' })
      };
    }
    
    // Genera token che includa i dati da aggiornare
    const updateData = {
      email: data.email,
      name: data.name || '',
      last_name: data.last_name || '',
      language: data.language || ''
    };
    console.log('Dati per token:', JSON.stringify(updateData));
    
    const token = generateToken(updateData);
    console.log('Token generato (mostrati primi 15 caratteri):', token.substring(0, 15) + '...');
    
    // Costruisci URL di conferma
    const baseUrl = process.env.URL || 'http://localhost:8888';
    const confirmUrl = `${baseUrl}/.netlify/functions/process-profile-update?token=${token}`;
    console.log('URL conferma generato');
    
    // Invia email di conferma
    await sendEmail(
      data.email, 
      data.language || 'it', 
      {
        ...updateData,
        confirm_url: confirmUrl
      }
    );
    console.log('Email inviata con successo a:', data.email);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        message: data.language === 'en' ? 
          'Check your email to confirm the profile update.' : 
          'Controlla la tua email per confermare l\'aggiornamento del profilo.' 
      })
    };
    
  } catch (error) {
    console.error('Errore durante l\'elaborazione:', error.message);
    if (error.response) {
      console.error('Dettagli errore API:', error.response.status, error.response.data);
    }
    
    const errorMessage = error.message.includes('MAILERSEND_API_KEY') ?
      'Errore di configurazione del server. Contattare l\'amministratore.' :
      'Si è verificato un errore. Riprova più tardi.';
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: errorMessage })
    };
  }
}; 