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

exports.handler = async (event, context) => {
  // Verifica metodo GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  const { token, email, language } = event.queryStringParameters;
  const lang = (language || 'en').toLowerCase(); // Default a 'en'

  if (!token || !email) {
    const message = lang === 'it' ? 'Parametri mancanti.' : 'Missing parameters.';
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: message })
    };
  }

  const secret = process.env.JWT_CONFIRM_SECRET;
  if (!secret) {
    console.error('JWT_CONFIRM_SECRET non configurata');
    const message = lang === 'it' ? 'Errore di configurazione del server.' : 'Server configuration error.';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: message })
    };
  }

  try {
    // Verifica token
    const decoded = jwt.verify(token, secret);

    // Verifica corrispondenza email (opzionale ma buona pratica)
    if (decoded.email !== email) {
      console.warn(`Email mismatch: token (${decoded.email}), query (${email})`);
      const message = lang === 'it' ? 'Link non valido.' : 'Invalid link.';
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: message })
      };
    }
    
    // Verifica lingua (opzionale)
    if (decoded.language !== lang) {
        console.warn(`Language mismatch: token (${decoded.language}), query (${lang})`);
        // Potresti decidere di procedere comunque o dare errore
    }

    // Recupera URL Google Drive da env
    const googleDriveUrl = process.env.KPI_GOOGLE_DRIVE_URL;
    if (!googleDriveUrl) {
      console.error('KPI_GOOGLE_DRIVE_URL non configurata!');
      const message = lang === 'it' ? 'Risorsa non disponibile al momento.' : 'Resource currently unavailable.';
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: message })
      };
    }

    // TODO: Fase 3 - Attivazione Sequenza Email
    // Qui aggiungeremo la logica per aggiungere l'utente a un gruppo MailerLite 
    // specifico per la sequenza KPI o chiamare un'altra funzione Netlify.
    console.log(`SEQUENZA KPI: Attivare per ${email} in lingua ${lang}`);
    // Esempio placeholder aggiunta a gruppo MailerLite (richiede API Key e logica):
    // try {
    //   await addUserToMailerliteGroup(email, MAILERLITE_KPI_SEQUENCE_GROUP_ID);
    // } catch (mailerliteError) {
    //   console.error('Errore aggiunta utente a gruppo sequenza KPI:', mailerliteError);
    //   // Decidere se bloccare il redirect o solo loggare l'errore
    // }

    // Reindirizza al file Google Drive
    console.log(`Conferma KPI riuscita per ${email}. Reindirizzamento a: ${googleDriveUrl}`);
    return {
      statusCode: 302,
      headers: {
        'Location': googleDriveUrl,
        'Cache-Control': 'no-cache' // Evita caching del redirect
      },
      body: '' // Body vuoto per redirect
    };

  } catch (error) {
    console.error('Errore verifica token KPI:', error.message);
    let message;
    let statusCode = 400;
    if (error.name === 'TokenExpiredError') {
      message = lang === 'it' ? 'Link scaduto. Richiedi nuovamente lo strumento.' : 'Link expired. Please request the tool again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = lang === 'it' ? 'Link non valido.' : 'Invalid link.';
    } else {
      message = lang === 'it' ? 'Errore durante la verifica.' : 'Error during verification.';
      statusCode = 500;
    }
    
    // Potresti reindirizzare a una pagina di errore specifica invece di JSON
    // Ad esempio: /it/tools/kpi-link-error/ o /en/tools/kpi-link-error/
    return {
      statusCode: statusCode,
      headers: { 'Content-Type': 'application/json' }, // O text/html se reindirizzi a pagina errore
      body: JSON.stringify({ success: false, message: message })
    };
  }
}; 