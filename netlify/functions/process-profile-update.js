const axios = require('axios');
const crypto = require('crypto');

// Log modulo caricato
console.log('Modulo process-profile-update caricato');

// Funzione per verificare un token
function verifyToken(token) {
  console.log('Verifica token avviata');
  try {
    // Dividi il token in payload e firma
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) {
      console.log('Errore verifica: formato token invalido (mancano parti)');
      return { valid: false, reason: 'invalid_format' };
    }
    
    // Decodifica il payload
    const payloadString = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(payloadString);
    console.log('Payload decodificato:', JSON.stringify(payload));
    
    // Verifica scadenza
    if (payload.timestamp < Date.now()) {
      console.log('Errore verifica: token scaduto');
      return { valid: false, reason: 'expired' };
    }
    
    // Verifica firma
    const secret = process.env.TOKEN_SECRET || 'default-secret-key';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadString);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      console.log('Errore verifica: firma non valida');
      console.log('Firma ricevuta:', signature);
      console.log('Firma attesa:', expectedSignature);
      return { valid: false, reason: 'invalid_signature' };
    }
    
    console.log('Verifica token: successo');
    return { valid: true, data: payload };
  } catch (e) {
    console.error('Errore critico nella verifica del token:', e);
    return { valid: false, reason: 'invalid_format' };
  }
}

exports.handler = async (event, context) => {
  console.log('Funzione process-profile-update invocata');
  console.log('Metodo HTTP:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Query String Params:', JSON.stringify(event.queryStringParameters));
  
  // Accetta sia GET (dal link email) che POST (da form)
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    console.log('Errore: metodo non consentito', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Metodo non consentito' })
    };
  }
  
  // Estrai il token dai parametri
  let token;
  if (event.httpMethod === 'GET') {
    console.log('Estrazione token da query string (GET)');
    token = event.queryStringParameters?.token;
  } else { // POST
    console.log('Estrazione token da body (POST)');
    try {
      const body = JSON.parse(event.body);
      token = body.token;
    } catch (e) {
      console.log('Errore parsing body (POST):', e.message);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'Formato dei dati non valido' })
      };
    }
  }
  
  console.log('Token estratto:', token ? token.substring(0, 10) + '...' : 'Nessun token trovato'); // Mostra solo inizio per sicurezza
  
  if (!token) {
    console.log('Errore: token mancante');
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
    console.log('Errore validazione token:', verification.reason);
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message })
    };
  }
  
  // Estrai i dati dal token
  const { email, name, last_name, language } = verification.data;
  console.log('Dati estratti dal token:', JSON.stringify({ email, name, last_name, language }));
  
  try {
    const mailerliteApiKey = process.env.MAILERLITE_API_KEY;
    if (!mailerliteApiKey) {
      console.log('Errore: MAILERLITE_API_KEY non configurata');
      throw new Error('MAILERLITE_API_KEY non configurata');
    }
    console.log('MailerLite API Key trovata');
    
    // Aggiorna il profilo su MailerLite
    const updateData = {
      fields: {
        name: name || '',
        last_name: last_name || '',
        language: language || ''
      }
    };
    console.log('Tentativo aggiornamento profilo MailerLite per:', email);
    console.log('Dati aggiornamento:', JSON.stringify(updateData));
    
    const updateUrl = `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`;
    console.log('URL aggiornamento MailerLite:', updateUrl);
    
    const response = await axios({
      method: 'PUT',
      url: updateUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mailerliteApiKey}`
      },
      data: updateData
    });
    console.log('Risposta aggiornamento MailerLite:', response.status);
    
    const lang = language === 'en' ? 'en' : 'it';
    const successUrl = `/${lang}/newsletter/update-success/`;
    console.log('Aggiornamento riuscito, reindirizzamento a:', successUrl);
    
    // Se la richiesta è GET, reindirizza alla pagina di successo
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 302,
        headers: {
          'Location': successUrl,
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
    console.error('Errore durante aggiornamento profilo MailerLite:', error.message);
    if (error.response) {
      console.error('Dettagli errore MailerLite:', error.response.status, error.response.data);
    }
    
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