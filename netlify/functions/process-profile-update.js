const axios = require('axios');
const crypto = require('crypto');

// Funzione per verificare un token
function verifyToken(token) {
  try {
    // Dividi il token in payload e firma
    const [payloadBase64, signature] = token.split('.');
    
    // Decodifica il payload
    const payloadString = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(payloadString);
    
    // Verifica scadenza
    if (payload.timestamp < Date.now()) {
      return { valid: false, reason: 'expired' };
    }
    
    // Verifica firma
    const hmac = crypto.createHmac('sha256', process.env.TOKEN_SECRET || 'default-secret-key');
    hmac.update(payloadString);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, reason: 'invalid_signature' };
    }
    
    return { valid: true, data: payload };
  } catch (e) {
    console.error('Errore nella verifica del token:', e);
    return { valid: false, reason: 'invalid_format' };
  }
}

exports.handler = async (event, context) => {
  // Accetta sia GET (dal link email) che POST (da form)
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Metodo non consentito' })
    };
  }
  
  // Estrai il token dai parametri
  let token;
  if (event.httpMethod === 'GET') {
    // Ottieni token dai parametri URL
    const params = new URLSearchParams(event.queryStringParameters || {});
    token = params.get('token');
  } else {
    // Ottieni token dal body
    try {
      const body = JSON.parse(event.body);
      token = body.token;
    } catch (e) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'Formato dei dati non valido' })
      };
    }
  }
  
  if (!token) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Token mancante' })
    };
  }
  
  // Verifica il token
  const verification = verifyToken(token);
  if (!verification.valid) {
    let message;
    switch (verification.reason) {
      case 'expired':
        message = 'Il link è scaduto. Richiedi un nuovo aggiornamento.';
        break;
      case 'invalid_signature':
        message = 'Link non valido. Richiedi un nuovo aggiornamento.';
        break;
      default:
        message = 'Errore di validazione. Richiedi un nuovo aggiornamento.';
    }
    
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message })
    };
  }
  
  // Estrai i dati dal token
  const { email, name, last_name, language } = verification.data;
  
  try {
    // Ottieni la chiave API di MailerLite dall'ambiente
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      throw new Error('MAILERLITE_API_KEY non configurata');
    }
    
    // Aggiorna il profilo
    const updateData = {
      fields: {
        name: name || '',
        last_name: last_name || '',
        language: language || ''
      }
    };
    
    // Esegui l'aggiornamento
    const response = await axios({
      method: 'PUT',
      url: `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: updateData
    });
    
    const lang = language === 'en' ? 'en' : 'it';
    
    // Se la richiesta è GET, reindirizza alla pagina di successo
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 302,
        headers: {
          'Location': `/${lang}/newsletter/update-success/`,
          'Cache-Control': 'no-cache'
        },
        body: ''
      };
    }
    
    // Altrimenti restituisci una risposta JSON
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        message: lang === 'it' ? 
          'Il tuo profilo è stato aggiornato con successo.' : 
          'Your profile has been updated successfully.' 
      })
    };
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento del profilo:', error.response?.data || error.message);
    
    let statusCode = 500;
    let errorMessage = 'Si è verificato un errore. Si prega di riprovare più tardi.';
    
    // Gestione errori specifici dell'API
    if (error.response) {
      statusCode = error.response.status;
      
      if (error.response.status === 404) {
        errorMessage = 'Utente non trovato con questa email. Verifica che l\'email sia corretta.';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message.includes('MAILERLITE_API_KEY')) {
      statusCode = 500;
      errorMessage = 'Errore di configurazione del server. Contattare l\'amministratore.';
    }
    
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: errorMessage })
    };
  }
}; 