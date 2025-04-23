const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { token, email, toolId, language } = event.queryStringParameters;

    if (!token || !email || !toolId) {
      throw new Error('Missing required parameters');
    }

    const secret = process.env.JWT_CONFIRM_SECRET;
    if (!secret) {
      throw new Error('JWT_CONFIRM_SECRET not configured');
    }

    // Verifica token
    const decoded = jwt.verify(token, secret);

    // Verifica corrispondenza dati
    if (decoded.email !== email || decoded.toolId !== toolId) {
      throw new Error('Token data mismatch');
    }

    // Configurazione reindirizzamenti
    const redirects = {
      'decision-compass': {
        it: '/it/tools/decision-compass-download/',
        en: '/en/tools/decision-compass-download/'
      },
      'kpi-dashboard': {
        it: '/it/tools/kpi-dashboard-download/',
        en: '/en/tools/kpi-dashboard-download/'
      }
    };

    const redirectUrl = redirects[toolId]?.[language];
    if (!redirectUrl) {
      throw new Error('Invalid tool or language configuration');
    }

    return {
      statusCode: 302,
      headers: {
        'Location': redirectUrl,
        'Cache-Control': 'no-cache'
      },
      body: ''
    };

  } catch (error) {
    console.error('Error:', error);
    const errorUrl = language === 'it' ? 
      '/it/error/' : 
      '/en/error/';
    
    return {
      statusCode: 302,
      headers: {
        'Location': errorUrl,
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  }
}; 