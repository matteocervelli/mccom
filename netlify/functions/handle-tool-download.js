const { MailerLite } = require('@mailerlite/mailerlite-nodejs');
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
          it: '84827395827395',
          en: '84827395827396'
        },
        redirectUrl: {
          it: '/it/tools/decision-compass-download/',
          en: '/en/tools/decision-compass-download/'
        }
      },
      'kpi-dashboard': {
        groups: {
          it: '84827395827397',
          en: '84827395827398'
        },
        redirectUrl: {
          it: '/it/tools/kpi-dashboard-download/',
          en: '/en/tools/kpi-dashboard-download/'
        }
      }
    };

    const config = toolConfigs[toolId];
    if (!config) {
      throw new Error(`Tool configuration not found for ${toolId}`);
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
    const baseUrl = process.env.URL || event.headers.host || 'example.com';
    const confirmationUrl = `https://${baseUrl}/.netlify/functions/confirm-tool-download?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&toolId=${toolId}&language=${language}`;

    // Aggiungi a MailerLite
    const mailerLite = new MailerLite({
      api_key: process.env.MAILERLITE_API_KEY
    });

    await mailerLite.subscribers.createOrUpdate({
      email: email,
      groups: [config.groups[language]]
    });

    // Invia email di conferma
    const emailSubject = language === 'it' ? 
      `Conferma il download del tuo ${toolId}` : 
      `Confirm your ${toolId} download`;

    await mailerLite.campaigns.send({
      type: 'regular',
      subject: emailSubject,
      from: process.env.MAILERLITE_FROM_EMAIL,
      groups: [config.groups[language]],
      template: {
        data: {
          confirmationUrl,
          toolId,
          language
        }
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: language === 'it' ? 
          'Email di conferma inviata!' : 
          'Confirmation email sent!'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
}; 