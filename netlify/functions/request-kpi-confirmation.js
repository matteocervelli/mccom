const jwt = require('jsonwebtoken');
const axios = require('axios');

// Helper per validare email
function isValidEmail(email) {
  // Semplice regex, potrebbe essere più robusta se necessario
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).toLowerCase());
}

// Funzione per generare il token JWT
function generateConfirmationToken(email, language, secret) {
  const payload = { email, language };
  // Imposta scadenza breve (es. 30 minuti)
  const options = { expiresIn: '30m' }; 
  
  return jwt.sign(payload, secret, options);
}

// Funzione per inviare email tramite MailerSend
async function sendConfirmationEmail(email, language, confirmationUrl) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const senderEmail = process.env.EMAIL_FROM || 'newsletter@adlimen.com'; // Usa EMAIL_FROM generico
  const senderName = 'Matteo Cervelli';
  
  if (!apiKey) {
    console.error('MAILERSEND_API_KEY non configurata');
    return false;
  }

  const subjects = {
    it: 'Conferma la tua richiesta per il Calcolatore KPI di Scalabilità',
    en: 'Confirm Your Request for the Scalability KPI Calculator'
  };
  
  const htmlContents = {
    it: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Conferma Richiesta</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; } 
          .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; } 
        </style>
      </head>
      <body>
        <h2>Conferma la tua richiesta</h2>
        <p>Ciao,</p>
        <p>Grazie per aver richiesto il Calcolatore KPI di Scalabilità!</p>
        <p>Per completare la tua iscrizione e assicurarti di ricevere il materiale, clicca sul pulsante qui sotto:</p>
        <p><a href="${confirmationUrl}" class="button">Conferma la tua email</a></p>
        <p>Se non hai richiesto tu questo strumento, puoi semplicemente ignorare questa email.</p>
        <p>Questo link scadrà tra 30 minuti.</p>
        <p>Grazie,<br>Matteo Cervelli</p>
      </body>
      </html>
    `,
    en: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; } 
          .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; } 
        </style>
      </head>
      <body>
        <h2>Confirm Your Request</h2>
        <p>Hi,</p>
        <p>Thank you for requesting the Scalability KPI Calculator!</p>
        <p>To complete your subscription and ensure you receive the materials, please click the button below:</p>
        <p><a href="${confirmationUrl}" class="button">Confirm Your Email</a></p>
        <p>If you did not request this tool, you can simply ignore this email.</p>
        <p>This link will expire in 30 minutes.</p>
        <p>Thanks,<br>Matteo Cervelli</p>
      </body>
      </html>
    `
  };
  
  const lang = language === 'it' ? 'it' : 'en'; // Default a EN
  
  const payload = {
    from: { name: senderName, email: senderEmail },
    to: [{ email: email }],
    subject: subjects[lang],
    html: htmlContents[lang]
  };
  
  try {
    await axios.post('https://api.mailersend.com/v1/email', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    console.log(`Confirmation email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email via MailerSend:', error.response?.data || error.message);
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
    const baseUrl = process.env.BASE_URL || event.headers.host || 'https://example.com'; 
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