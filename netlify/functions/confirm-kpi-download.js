const jwt = require('jsonwebtoken');
const axios = require('axios');

// Configurazione HTML per le risposte
const getHtmlResponse = (isSuccess, language) => {
  const title = isSuccess 
    ? (language === 'it' ? 'Iscrizione Confermata' : 'Subscription Confirmed')
    : (language === 'it' ? 'Errore di Conferma' : 'Confirmation Error');
  
  const message = isSuccess
    ? (language === 'it' 
        ? 'Grazie per la conferma! La tua iscrizione è attiva e riceverai presto la sequenza email con il tuo calcolatore KPI di Scalabilità.'
        : 'Thank you for confirming! Your subscription is active and you will soon receive the email sequence with your Scalability KPI Calculator.')
    : (language === 'it'
        ? 'Link di conferma non valido o scaduto. Riprova a iscriverti dal sito.'
        : 'Invalid or expired confirmation link. Please try subscribing again from the website.');

  const buttonText = isSuccess
    ? (language === 'it' ? 'Torna al sito' : 'Back to website')
    : (language === 'it' ? 'Riprova l\'iscrizione' : 'Try subscribing again');

  const buttonUrl = isSuccess
    ? (language === 'it' ? 'https://matteocervelli.com' : 'https://matteocervelli.com/en')
    : (language === 'it' ? 'https://matteocervelli.com/it/tools/kpi-calculator/' : 'https://matteocervelli.com/en/tools/kpi-calculator/');

  return `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-top: 50px;
        }
        h1 {
          color: ${isSuccess ? '#2c7a7b' : '#e53e3e'};
          margin-bottom: 20px;
        }
        p {
          margin-bottom: 25px;
        }
        .btn {
          display: inline-block;
          background-color: ${isSuccess ? '#2c7a7b' : '#3182ce'};
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        .btn:hover {
          background-color: ${isSuccess ? '#285e61' : '#2c5282'};
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="${buttonUrl}" class="btn">${buttonText}</a>
      </div>
    </body>
    </html>
  `;
};

// Funzione per aggiungere un utente a un gruppo MailerLite
const addSubscriberToMailerLite = async (email, language) => {
  // ID del gruppo in base alla lingua
  const groupId = language === 'it' ? '151299805553886624' : '151763289938855658';
  
  // Configura la richiesta API per MailerLite
  const apiKey = process.env.MAILERLITE_API_KEY;
  const url = `https://connect.mailerlite.com/api/subscribers`;
  
  try {
    const response = await axios.post(
      url, 
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
    
    console.log('MailerLite subscription successful:', response.data);
    return true;
  } catch (error) {
    console.error('Error adding subscriber to MailerLite:', error.response?.data || error.message);
    return false;
  }
};

exports.handler = async function(event, context) {
  // Verifica che sia una richiesta GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  // Estrai i parametri dalla query string
  const params = new URLSearchParams(event.queryStringParameters);
  const email = params.get('email') || event.queryStringParameters.email;
  const language = (params.get('language') || event.queryStringParameters.language || 'en').toLowerCase();
  const token = params.get('token') || event.queryStringParameters.token;

  // Verifica che tutti i parametri necessari siano presenti
  if (!email || !token) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      },
      body: getHtmlResponse(false, language)
    };
  }

  try {
    // Verifica la validità del token JWT
    const secret = process.env.JWT_CONFIRM_SECRET;
    if (!secret) {
      throw new Error('JWT_CONFIRM_SECRET environment variable not set.');
    }
    const decodedToken = jwt.verify(token, secret);
    
    // Verifica che il token contenga l'email corretta e non sia scaduto
    if (decodedToken.email !== email) {
      throw new Error('Token mismatch');
    }

    // Aggiungi l'utente a MailerLite
    const subscriptionSuccess = await addSubscriberToMailerLite(email, language);
    
    if (!subscriptionSuccess) {
      console.warn('Failed to add subscriber to MailerLite, but token was valid');
      // Continuiamo comunque, l'utente non deve essere penalizzato per errori dell'API
    }

    // Restituisci una pagina di successo
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      },
      body: getHtmlResponse(true, language)
    };
  } catch (error) {
    console.error('Token validation error:', error.message);
    
    // Restituisci una pagina di errore
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      },
      body: getHtmlResponse(false, language)
    };
  }
}; 