const jwt = require('jsonwebtoken');

// Funzione di validazione email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Configurazione strumenti e reindirizzamenti
const TOOLS_CONFIG = {
  'decision-compass': {
    it: '/it/tools/decision-compass-download/',
    en: '/en/tools/decision-compass-download/'
  },
  'kpi-dashboard': {
    it: 'https://docs.google.com/spreadsheets/d/1Y0GFlGVZnafTWBYsewsLpgG8blEp7fxa_8ruU4dpaBk/edit?usp=sharing',
    en: 'https://docs.google.com/spreadsheets/d/1Y0GFlGVZnafTWBYsewsLpgG8blEp7fxa_8ruU4dpaBk/edit?usp=sharing'
  }
};

exports.handler = async (event, context) => {
  // Verifica metodo HTTP
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Verifica variabili d'ambiente
    if (!process.env.JWT_CONFIRM_SECRET) {
      console.error('JWT_CONFIRM_SECRET not configured');
      throw new Error('Server configuration error');
    }

    const { token, email, toolId, language } = event.queryStringParameters;

    // Validazione parametri
    if (!token || !email || !toolId || !language) {
      throw new Error('Missing required parameters');
    }

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!['it', 'en'].includes(language)) {
      throw new Error('Invalid language');
    }

    if (!TOOLS_CONFIG[toolId]) {
      throw new Error('Invalid tool ID');
    }

    // Verifica token con gestione errori specifica
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_CONFIRM_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      throw new Error('Invalid or expired token');
    }

    // Verifica corrispondenza dati
    if (decoded.email !== email || decoded.toolId !== toolId) {
      console.error('Token data mismatch:', {
        decodedEmail: decoded.email,
        requestEmail: email,
        decodedToolId: decoded.toolId,
        requestToolId: toolId
      });
      throw new Error('Token data mismatch');
    }

    const redirectUrl = TOOLS_CONFIG[toolId][language];

    return {
      statusCode: 302,
      headers: {
        'Location': redirectUrl,
        'Cache-Control': 'no-cache',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      },
      body: ''
    };

  } catch (error) {
    console.error('Error in confirm-tool-download:', error);
    
    // Gestione errore con fallback sicuro
    const language = event.queryStringParameters?.language || 'en';
    const errorUrl = language === 'it' ? '/it/error/' : '/en/error/';
    
    return {
      statusCode: 302,
      headers: {
        'Location': errorUrl,
        'Cache-Control': 'no-cache',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      },
      body: ''
    };
  }
}; 