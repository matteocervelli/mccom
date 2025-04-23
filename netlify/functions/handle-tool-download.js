const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Funzione di validazione email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Funzione per aggiungere subscriber a MailerLite
async function addSubscriberToMailerLite(email, toolId, language) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    console.error('MAILERLITE_API_KEY non configurata');
    return false;
  }

  const toolConfigs = {
    'decision-compass': {
      groups: {
        it: '152402149129585837', // Download_Decision_Compass_IT
        en: '152402156744345254'  // Download_Decision_Compass_EN
      }
    },
    'kpi-dashboard': {
      groups: {
        it: '151299805553886624', // Download_Scalability_KPI_Dashboard_IT
        en: '151763289938855658'  // Download_Scalability_KPI_Dashboard_EN
      }
    }
  };

  const groupId = toolConfigs[toolId]?.groups[language];
  if (!groupId) {
    console.error(`Gruppo MailerLite non trovato per tool ${toolId} e lingua ${language}`);
    return false;
  }

  try {
    const response = await axios.post(
      'https://connect.mailerlite.com/api/subscribers',
      {
        email: email,
        groups: [groupId]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    console.log(`Subscriber aggiunto con successo al gruppo MailerLite: ${groupId}`);
    return true;
  } catch (error) {
    console.error('Errore aggiunta subscriber a MailerLite:', error.response?.data || error.message);
    return false;
  }
}

// Template HTML per le email
const EMAIL_TEMPLATES = {
  'decision-compass': {
    it: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Conferma Download Decision Compass</h1>
        <p>Ciao,</p>
        <p>Grazie per il tuo interesse nel Decision Compass. Per scaricare lo strumento, clicca sul pulsante qui sotto:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{confirmation_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Scarica Decision Compass</a>
        </div>
        <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
        <p>{{confirmation_url}}</p>
        <p>Il link scadrà tra 30 minuti per motivi di sicurezza.</p>
        <p>Cordiali saluti,<br>Matteo Cervelli</p>
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Confirm Decision Compass Download</h1>
        <p>Hello,</p>
        <p>Thank you for your interest in the Decision Compass. To download the tool, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{confirmation_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Download Decision Compass</a>
        </div>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p>{{confirmation_url}}</p>
        <p>The link will expire in 30 minutes for security reasons.</p>
        <p>Best regards,<br>Matteo Cervelli</p>
      </div>
    `
  },
  'kpi-dashboard': {
    it: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Conferma Download KPI Dashboard</h1>
        <p>Ciao,</p>
        <p>Grazie per il tuo interesse nella KPI Dashboard. Per scaricare lo strumento, clicca sul pulsante qui sotto:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{confirmation_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Scarica KPI Dashboard</a>
        </div>
        <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
        <p>{{confirmation_url}}</p>
        <p>Il link scadrà tra 30 minuti per motivi di sicurezza.</p>
        <p>Cordiali saluti,<br>Matteo Cervelli</p>
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Confirm KPI Dashboard Download</h1>
        <p>Hello,</p>
        <p>Thank you for your interest in the KPI Dashboard. To download the tool, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{confirmation_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Download KPI Dashboard</a>
        </div>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p>{{confirmation_url}}</p>
        <p>The link will expire in 30 minutes for security reasons.</p>
        <p>Best regards,<br>Matteo Cervelli</p>
      </div>
    `
  }
};

exports.handler = async (event, context) => {
  // Verifica metodo HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        success: false,
        error: 'Method Not Allowed'
      })
    };
  }

  try {
    // Verifica variabili d'ambiente necessarie
    const requiredEnvVars = {
      MAILERSEND_API_KEY: process.env.MAILERSEND_API_KEY,
      MAILERLITE_API_KEY: process.env.MAILERLITE_API_KEY,
      JWT_CONFIRM_SECRET: process.env.JWT_CONFIRM_SECRET,
      EMAIL_FROM: process.env.EMAIL_FROM
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.error(`Missing required environment variable: ${key}`);
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: 'Server configuration error',
            details: `Missing ${key}`
          })
        };
      }
    }

    // Parse del body
    let email, toolId, language;
    try {
      const body = JSON.parse(event.body);
      email = body.email;
      toolId = body.toolId;
      language = body.language;
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Invalid request body',
          details: 'Request body must be valid JSON'
        })
      };
    }

    // Validazione input
    if (!email || !isValidEmail(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email address'
        })
      };
    }

    if (!toolId || !language) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields',
          details: 'toolId and language are required'
        })
      };
    }

    if (!['it', 'en'].includes(language)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Invalid language',
          details: 'Language must be either "it" or "en"'
        })
      };
    }

    // Configurazione tool-specifica
    const toolConfigs = {
      'decision-compass': {
        redirectUrl: {
          it: '/it/tools/decision-compass-download/',
          en: '/en/tools/decision-compass-download/'
        }
      },
      'kpi-dashboard': {
        redirectUrl: {
          it: '/it/tools/kpi-dashboard-download/',
          en: '/en/tools/kpi-dashboard-download/'
        }
      }
    };

    const config = toolConfigs[toolId];
    if (!config) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Invalid tool ID',
          details: `Tool configuration not found for ${toolId}`
        })
      };
    }

    // Genera token JWT
    const token = jwt.sign(
      { email, toolId, language },
      process.env.JWT_CONFIRM_SECRET,
      { expiresIn: '30m' }
    );

    // Costruisci URL di conferma
    let baseUrl = process.env.URL || event.headers.host || 'matteocervelli.com';
    // Rimuovi eventuali protocolli dall'URL base
    baseUrl = baseUrl.replace(/^https?:\/\//, '');
    const confirmationUrl = `https://${baseUrl}/.netlify/functions/confirm-tool-download?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&toolId=${toolId}&language=${language}`;

    // Aggiungi subscriber a MailerLite
    try {
      const mailerliteSuccess = await addSubscriberToMailerLite(email, toolId, language);
      if (!mailerliteSuccess) {
        console.warn(`Fallimento aggiunta ${email} al gruppo MailerLite per ${toolId} e lingua ${language}`);
      }
    } catch (mailerliteError) {
      console.error('Errore MailerLite:', mailerliteError);
      // Non blocchiamo il processo se MailerLite fallisce
    }

    // Configura MailerSend
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    // Ottieni il template HTML appropriato
    const emailTemplate = EMAIL_TEMPLATES[toolId][language];
    const emailHtml = emailTemplate.replace(/{{confirmation_url}}/g, confirmationUrl);

    // Prepara l'email
    const emailParams = new EmailParams()
      .setFrom(new Sender(process.env.EMAIL_FROM, 'Matteo Cervelli'))
      .setTo([new Recipient(email)])
      .setSubject(language === 'it' ? 
        `Conferma download ${toolId.replace(/-/g, ' ')}` : 
        `Confirm ${toolId.replace(/-/g, ' ')} download`)
      .setHtml(emailHtml);

    try {
      await mailerSend.email.send(emailParams);
    } catch (emailError) {
      console.error('MailerSend Error:', emailError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Email sending failed',
          details: emailError.message
        })
      };
    }

    // Successo
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: language === 'it' ? 'Email di conferma inviata!' : 'Confirmation email sent!'
      })
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      })
    };
  }
}; 