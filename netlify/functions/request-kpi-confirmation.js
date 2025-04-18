const jwt = require('jsonwebtoken');
const axios = require('axios');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Funzione per caricare le traduzioni (integrata direttamente invece di caricare i18n)
function getTranslations(language) {
  // Fallback hardcoded
  return language.toLowerCase() === 'en' ? {
    kpi_download_title: { other: "Confirm Your KPI Calculator Request" },
    kpi_download_heading: { other: "Confirm Your Request" },
    kpi_download_greeting: { other: "Hi%s," },
    kpi_download_main_text: { other: "Thanks for requesting the Scalability KPI Calculator! Please click the button below to confirm your email and receive the tool." },
    kpi_download_button_text: { other: "Confirm Your Email" },
    kpi_expiry_note: { other: "This confirmation link will expire in 30 minutes." },
    kpi_closing: { other: "If you didn't request this, please ignore this email." },
    kpi_help_text: { other: "If you're having trouble, copy/paste this URL:" },
    kpi_benefits_title: { other: "What you'll get:" },
    kpi_benefits_1: { other: "Clarity on your business scalability metrics" },
    kpi_benefits_2: { other: "Ready-to-use dashboard with instructions" },
    kpi_benefits_3: { other: "Benchmark data to compare your performance" },
    kpi_benefits_4: { other: "Insights to drive strategic decisions" },
    email_rights: { other: "All rights reserved." },
    email_privacy: { other: "Privacy Policy" },
    email_unsubscribe: { other: "Unsubscribe" }
  } : {
    kpi_download_title: { other: "Conferma Richiesta Calcolatore KPI" },
    kpi_download_heading: { other: "Conferma la tua richiesta" },
    kpi_download_greeting: { other: "Ciao%s," },
    kpi_download_main_text: { other: "Grazie per aver richiesto il Calcolatore KPI di Scalabilità! Clicca il pulsante qui sotto per confermare la tua email e ricevere lo strumento." },
    kpi_download_button_text: { other: "Conferma la tua email" },
    kpi_expiry_note: { other: "Questo link di conferma scadrà tra 30 minuti." },
    kpi_closing: { other: "Se non hai richiesto tu questo strumento, ignora questa email." },
    kpi_help_text: { other: "Se hai problemi, copia/incolla questo URL:" },
    kpi_benefits_title: { other: "Cosa otterrai:" },
    kpi_benefits_1: { other: "Chiarezza sui parametri di scalabilità della tua azienda" },
    kpi_benefits_2: { other: "Dashboard pronta all'uso con istruzioni" },
    kpi_benefits_3: { other: "Dati di riferimento per confrontare le tue performance" },
    kpi_benefits_4: { other: "Insight per guidare decisioni strategiche" },
    email_rights: { other: "Tutti i diritti riservati." },
    email_privacy: { other: "Privacy Policy" },
    email_unsubscribe: { other: "Cancellati" }
  };
}

// Funzione per caricare e compilare il template
function loadEmailTemplate() {
  try {
    // Definiamo il template direttamente nel codice invece di caricarlo da file
    const template = `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{kpi_download_title}}</title>

    <!--[if !mso]><!-->
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Raleway:400,500,600,700&family=Lora:400,500,600&display=swap');
    </style>
    <!--<![endif]-->

    <style type="text/css" rel="stylesheet" media="all">
        /* Base Styles */
        body {
            font-family: 'Raleway', Helvetica, Arial, sans-serif;
            width: 100% !important;
            height: 100%;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
            background-color: #F5F5F5;
            color: #1B2631;
        }

        p {
            margin-top: 20px;
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 28px;
            color: #1B2631;
        }

        h1, h2, h3, h4 {
            font-family: 'Lora', Georgia, serif;
            margin: 0 0 16px;
            color: #1B2631;
            font-weight: 600;
        }

        h1 {
            font-size: 28px;
            line-height: 36px;
            margin-bottom: 24px;
        }

        a {
            color: #008080;
            text-decoration: none;
        }

        .small {
            font-size: 14px;
            line-height: 21px;
            color: #B3B6B7;
        }

        /* Layout Components */
        .ms-body {
            background-color: #F5F5F5;
            width: 100%;
        }

        .ms-container {
            width: 100%;
        }

        .ms-content {
            background-color: #FFFFFF;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .ms-content-body {
            padding: 50px 40px;
        }

        .ms-header, .ms-footer {
            padding: 20px 0;
        }

        /* Button Styles */
        .ms-button {
            background-color: #008080;
            color: #FFFFFF !important;
            display: inline-block;
            padding: 12px 30px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            transition: background-color 0.2s;
        }

        .ms-button:hover {
            background-color: #006666;
        }

        /* Info Box Styles */
        .info-box {
            background-color: #F8F9F9;
            border-radius: 6px;
            padding: 20px;
            margin: 30px 0;
        }

        .benefits-list {
            padding-left: 20px;
            margin: 20px 0;
        }

        .benefits-list li {
            margin-bottom: 10px;
        }

        /* Responsive Styles */
        @media screen and (max-width: 640px) {
            .ms-content {
                width: 100% !important;
            }

            .ms-content-body {
                padding: 40px 25px !important;
            }

            h1 {
                font-size: 24px !important;
                line-height: 32px !important;
            }

            .mobile-full-width {
                width: 100% !important;
            }

            .mobile-center {
                text-align: center !important;
            }
        }
    </style>
</head>

<body>
<table class="ms-body" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
        <td align="center">

            <table class="ms-container" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center">

                        <table class="ms-header" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td height="40">
                                    &nbsp;
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
                <tr>
                    <td align="center">

                        <table class="ms-content" width="640" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                                <td class="ms-content-body">

                                    <p style="text-align: center">
                                        <img src="https://cdn.adlimen.com/logos/adlimen-consulting/logo-horizontal.png" alt="Adlimen Consulting" width="200" style="max-width: 200px; height: auto;">
                                    </p>

                                    <h1>{{kpi_download_heading}}</h1>

                                    <p>{{kpi_download_greeting}}</p>

                                    <p>{{kpi_download_main_text}}</p>

                                    <!-- Pulsante Download KPI -->
                                    <table width="100%" align="center" cellpadding="0" cellspacing="0" role="presentation">
                                        <tr>
                                            <td align="center" style="padding: 20px 0;">
                                                <table class="mobile-wide" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                                    <tr>
                                                        <td align="center">
                                                            <a href="{{DownloadURL}}" target="_blank" class="ms-button">{{kpi_download_button_text}}</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Sezione Vantaggi -->
                                    <div class="info-box">
                                        <h3>{{kpi_benefits_title}}</h3>
                                        <ul class="benefits-list">
                                            <li>{{kpi_benefits_1}}</li>
                                            <li>{{kpi_benefits_2}}</li>
                                            <li>{{kpi_benefits_3}}</li>
                                            <li>{{kpi_benefits_4}}</li>
                                        </ul>
                                    </div>

                                    <p class="small">{{kpi_expiry_note}}</p>

                                    <p>{{kpi_closing}}</p>

                                    <!-- Fallback URL -->
                                    <p class="small">
                                        {{kpi_help_text}}<br>
                                        <a href="{{DownloadURL}}" target="_blank">{{DownloadURL}}</a>
                                    </p>

                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
                <tr>
                    <td align="center">

                        <table class="ms-footer" width="640" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                                <td align="center" style="padding: 20px 0; text-align: center;" class="small">
                                    <p>
                                        &copy; {{CurrentYear}} Adlimen. {{email_rights}}
                                    </p>
                                    <p>
                                        <a href="https://adlimen.com/privacy">{{email_privacy}}</a> |
                                        <a href="%unsubscribe_url%">{{email_unsubscribe}}</a>
                                    </p>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>
</body>
</html>`;
    
    return handlebars.compile(template);
  } catch (error) {
    console.error('Errore compilazione template email KPI:', error);
    // Fallback molto semplice
    return handlebars.compile('<h1>{{kpi_download_heading}}</h1><p>{{kpi_download_greeting}}</p><p>{{kpi_download_main_text}}</p><a href="{{DownloadURL}}">{{kpi_download_button_text}}</a><p>{{kpi_expiry_note}}</p>');
  }
}

// Helper per validare email
function isValidEmail(email) {
  const regex = /^[^ \s@]+@[^ \s@]+\.[^ \s@]+$/u;
  return regex.test(String(email).toLowerCase());
}

// Funzione per generare il token JWT
function generateConfirmationToken(email, language, secret) {
  const payload = { email, language };
  const options = { expiresIn: '30m' };
  return jwt.sign(payload, secret, options);
}

// Funzione per inviare email tramite MailerSend - AGGIORNATA
async function sendConfirmationEmail(email, language, confirmationUrl) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const senderEmail = process.env.EMAIL_FROM || 'newsletter@adlimen.com';
  const senderName = 'Matteo Cervelli'; // O un nome più generico se preferisci

  if (!apiKey) {
    console.error('MAILERSEND_API_KEY non configurata');
    return false;
  }

  try {
    // Carica traduzioni e template
    const translations = getTranslations(language);
    const compiledTemplate = loadEmailTemplate();
    const currentYear = new Date().getFullYear();
    const privacyUrl = language.toLowerCase() === 'en' ? '/en/legal/privacy-policy' : '/it/legal/privacy-policy';

    // Prepara dati per il template
    // Nota: il template usa placeholder come {{.DownloadURL}} per il link, lo passiamo come `confirmationUrl`
    // e usa `.Name` per il nome (se disponibile, altrimenti vuoto)
    const templateData = {
      // Usa le chiavi i18n. Assicurati che esistano nel file YAML.
      kpi_download_title: translations.kpi_download_title?.other || "Confirm Request",
      kpi_download_heading: translations.kpi_download_heading?.other || "Confirm Your Request",
      kpi_download_greeting: (translations.kpi_download_greeting?.other || "Hi%s,").replace('%s', ''), // Al momento non abbiamo il nome qui
      Name: '', // Il nome non è passato a questa funzione
      kpi_download_main_text: translations.kpi_download_main_text?.other || "Click to confirm.",
      DownloadURL: confirmationUrl, // Passiamo l'URL di conferma qui
      kpi_download_button_text: translations.kpi_download_button_text?.other || "Confirm Email",
      kpi_expiry_note: translations.kpi_expiry_note?.other || "Link expires in 30 minutes.",
      kpi_closing: translations.kpi_closing?.other || "Ignore if not requested.",
      kpi_help_text: translations.kpi_help_text?.other || "Problem? Copy/paste:",
      kpi_benefits_title: translations.kpi_benefits_title?.other || "What you'll get:",
      kpi_benefits_1: translations.kpi_benefits_1?.other || "Clarity on your business scalability metrics",
      kpi_benefits_2: translations.kpi_benefits_2?.other || "Ready-to-use dashboard with instructions",
      kpi_benefits_3: translations.kpi_benefits_3?.other || "Benchmark data to compare your performance",
      kpi_benefits_4: translations.kpi_benefits_4?.other || "Insights to drive strategic decisions",
      email_rights: translations.email_rights?.other || "All rights reserved.",
      email_privacy: translations.email_privacy?.other || "Privacy Policy",
      email_unsubscribe: translations.email_unsubscribe?.other || "Unsubscribe",
      CurrentYear: currentYear,
      PrivacyURL: privacyUrl,
      LogoURL: "https://cdn.adlimen.com/logos/adlimen-consulting/logo-horizontal.png" // Assicurati sia l'URL corretto
      // Aggiungi altre variabili se richieste dal template (es. kpi_benefits)
    };

    // Compila HTML
    const emailHtml = compiledTemplate(templateData);

    const payload = {
      from: { name: senderName, email: senderEmail },
      to: [{ email: email }],
      subject: templateData.kpi_download_title,
      html: emailHtml
      // Aggiungi `text` se vuoi una versione plain text
    };

    await axios.post('https://api.mailersend.com/v1/email', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    console.log(`Email di conferma KPI inviata (usando template) a ${email}`);
    return true;
  } catch (error) {
    console.error('Errore invio email KPI via MailerSend (usando template):', error.response?.data || error.message);
    // Loggare l'errore dettagliato se possibile
    if (error.response) {
        console.error('MailerSend Error Status:', error.response.status);
        console.error('MailerSend Error Body:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

exports.handler = async (event, context) => {
  // Gestione CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // Sii più specifico in produzione!
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Solo metodo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Invalid request body' })
    };
  }

  const { email, language } = data;
  const lang = (language || 'en').toLowerCase(); // Default a 'en'

  // Validazione input
  if (!email || !isValidEmail(email)) {
    const message = lang === 'it' ? 'Indirizzo email non valido.' : 'Invalid email address.';
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: message })
    };
  }

  const secret = process.env.JWT_CONFIRM_SECRET;
  if (!secret) {
    console.error('JWT_CONFIRM_SECRET non configurata');
    const message = lang === 'it' ? 'Errore di configurazione del server.' : 'Server configuration error.';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: message })
    };
  }

  try {
    // Genera token
    const token = generateConfirmationToken(email, lang, secret);
    
    // Costruisci URL di conferma
    // Assicurati che BASE_URL sia configurata in Netlify o usa un default
    let baseUrl = process.env.URL || event.headers.host || 'example.com';
    // Rimuovi eventuali protocolli esistenti prima di aggiungere https://
    baseUrl = baseUrl.replace(/^(https?:\/\/)?/, '');
    const confirmationUrl = `https://${baseUrl}/.netlify/functions/confirm-kpi-download?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&language=${lang}`;
    
    // Invia email
    const emailSent = await sendConfirmationEmail(email, lang, confirmationUrl);
    
    if (!emailSent) {
      const message = lang === 'it' ? 'Impossibile inviare l\'email di conferma. Riprova.' : 'Failed to send confirmation email. Please try again.';
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: message })
      };
    }

    // Successo
    const successMessage = lang === 'it' ? 'Email di conferma inviata! Controlla la tua casella di posta.' : 'Confirmation email sent! Check your inbox.';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: successMessage })
    };
    
  } catch (error) {
    console.error('Error in request-kpi-confirmation:', error);
    const message = lang === 'it' ? 'Si è verificato un errore interno.' : 'An internal error occurred.';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: message })
    };
  }
}; 