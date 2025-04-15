const axios = require('axios');

exports.handler = async (event, context) => {
  // Verifica che il metodo HTTP sia POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Metodo non consentito' })
    };
  }

  // Estrai i dati dal body della richiesta
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Formato dei dati non valido' })
    };
  }

  // Verifica che l'email sia stata fornita
  const { email, name, last_name, language } = data;
  if (!email) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Email non fornita' })
    };
  }

  try {
    // Ottieni la chiave API di MailerLite dall'ambiente
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      throw new Error('MAILERLITE_API_KEY non configurata');
    }

    // Prepara dati per aggiornamento
    const updateData = {
      fields: {
        name: name || '',
        last_name: last_name || '',
        language: language || ''
      }
    };

    // Verifica se l'iscritto esiste prima di aggiornarlo
    const searchResponse = await axios({
      method: 'GET',
      url: `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // Se arriviamo qui, l'iscritto esiste. Procedi con l'aggiornamento.
    const response = await axios({
      method: 'PUT',
      url: `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: updateData
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Profilo aggiornato con successo'
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