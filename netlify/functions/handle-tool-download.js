const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const {
      email,
      toolId,
      language
    } = JSON.parse(event.body);

    // Configurazione tool-specifica
    const toolConfigs = {
      'decision-compass': {
        groups: {
          it: '114291032770692544', // ID Gruppo MailerLite IT per Decision Compass
          en: '114291031978567021'  // ID Gruppo MailerLite EN per Decision Compass
        },
        templateIds: { // Aggiungi qui gli ID Template MailerSend
          it: 'vy_gqL8P0qLgNPMJ',   // ID Template MailerSend IT per conferma Decision Compass
          en: 'z3_kjpMVd0VlxBWR'    // ID Template MailerSend EN per conferma Decision Compass
        },
        redirectUrl: {
          it: '/it/tools/decision-compass-download/',
          en: '/en/tools/decision-compass-download/'
        }
      },
      'kpi-dashboard': {
        groups: {
          it: 'GROUP_ID_KPI_IT', // Sostituisci con ID Gruppo MailerLite reale
          en: 'GROUP_ID_KPI_EN'  // Sostituisci con ID Gruppo MailerLite reale
        },
         templateIds: { // Aggiungi qui gli ID Template MailerSend
          it: 'TEMPLATE_ID_KPI_IT', // Sostituisci con ID Template MailerSend reale
          en: 'TEMPLATE_ID_KPI_EN'  // Sostituisci con ID Template MailerSend reale
        },
        redirectUrl: {
          it: '/it/tools/kpi-dashboard-download/',
          en: '/en/tools/kpi-dashboard-download/'
        }
      }
      // Aggiungi altre configurazioni tool qui
    };

    const config = toolConfigs[toolId];
    if (!config) {
      throw new Error(`Tool configuration not found for ${toolId}`);
    }
     if (!config.templateIds || !config.templateIds[language]) {
      throw new Error(`MailerSend template ID not configured for tool ${toolId} and language ${language}`);
    }

    // Genera token JWT
    const secret = process.env.JWT_CONFIRM_SECRET;
    if (!secret) {
      throw new Error('JWT_CONFIRM_SECRET not configured');
    }

    const token = jwt.sign(
      { email, toolId, language },
      secret,
      { expiresIn: '30m' }
    );

    // Costruisci URL di conferma
    const baseUrl = process.env.URL || event.headers.host || 'https://matteocervelli.com'; // Usa URL base o dominio Netlify
    const confirmationUrl = `https://${baseUrl}/.netlify/functions/confirm-tool-download?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&toolId=${toolId}&language=${language}`;


    // Configura MailerSend
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    // Aggiungi a MailerSend (Nota: MailerSend non ha un 'createOrUpdate' diretto come MailerLite,
    // né un'API pubblica documentata per aggiungere a gruppi specifici via API standard.
    // L'iscrizione a gruppi di solito avviene tramite form o importazioni manuali/integrazioni.
    // Qui inviamo solo l'email transazionale di conferma.)

    // Invia email di conferma con MailerSend
    const senderEmail = process.env.EMAIL_FROM || 'noreply@matteocervelli.com'; // Assicurati che sia un dominio verificato su MailerSend
    const senderName = 'Matteo Cervelli'; // O il nome che preferisci

    const emailParams = new EmailParams()
      .setFrom(new Sender(senderEmail, senderName))
      .setTo([new Recipient(email)])
      .setTemplateId(config.templateIds[language]) // Usa l'ID del template corretto
      .setVariables([ // Passa le variabili necessarie al template
        {
          email: email,
          substitutions: [
            { var: 'confirmation_url', value: confirmationUrl },
            { var: 'tool_name', value: toolId.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }, // Formatta toolId
            // Aggiungi altre variabili se il template le richiede
          ],
        }
      ]);

    await mailerSend.email.send(emailParams);

    // Restituisci una risposta di successo
    const successMessage = language === 'it' ? 'Email di conferma inviata!' : 'Confirmation email sent!';
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: successMessage
      })
    };

  } catch (error) {
    console.error('Error in handle-tool-download:', error.message);
     if (error.response && error.response.body) {
        console.error('MailerSend API Error:', error.response.body);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message // Aggiungi dettagli dell'errore per debug
      })
    };
  }
}; 