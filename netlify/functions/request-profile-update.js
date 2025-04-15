const axios = require('axios');
const crypto = require('crypto');

// Log per verificare che il modulo sia caricato
console.log('Modulo request-profile-update caricato');

// Funzione per generare un token sicuro
function generateToken(email, data) {
  console.log('Generazione token per:', email);
  // Crea un token con scadenza di 24 ore
  const timestamp = Date.now() + 24 * 60 * 60 * 1000; // 24 ore di validità
  const dataString = JSON.stringify({...data, timestamp});
  
  // Firma il token con una chiave segreta
  const hmac = crypto.createHmac('sha256', process.env.TOKEN_SECRET || 'default-secret-key');
  hmac.update(dataString);
  const signature = hmac.digest('hex');
  
  // Codifica i dati e la firma in base64
  const payload = Buffer.from(dataString).toString('base64');
  
  return `${payload}.${signature}`;
}

exports.handler = async (event, context) => {
  console.log('Funzione request-profile-update invocata');
  console.log('Metodo HTTP:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers));
  console.log('Path:', event.path);
  
  // Gestione richieste OPTIONS per CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('Richiesta OPTIONS ricevuta (CORS preflight)');
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Verifica che il metodo HTTP sia POST
  if (event.httpMethod !== 'POST') {
    console.log('Errore: metodo non consentito', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Metodo non consentito' })
    };
  }

  // Estrai i dati dal body della richiesta
  let data;
  try {
    console.log('Body grezzo:', event.body);
    data = JSON.parse(event.body);
    console.log('Dati parsed:', JSON.stringify(data));
  } catch (error) {
    console.log('Errore parsing JSON:', error.message);
    return {
      statusCode: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Formato dei dati non valido' })
    };
  }

  // Verifica che l'email sia stata fornita
  const { email, name, last_name, language } = data;
  console.log('Email ricevuta:', email);
  console.log('Lingua:', language);
  
  if (!email) {
    console.log('Errore: email mancante');
    return {
      statusCode: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, message: 'Email non fornita' })
    };
  }

  try {
    // Ottieni la chiave API di MailerLite dall'ambiente
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      console.log('Errore: MAILERLITE_API_KEY non configurata');
      throw new Error('MAILERLITE_API_KEY non configurata');
    }
    console.log('API Key presente (non mostrata per sicurezza)');

    // Verifica se l'iscritto esiste prima di procedere
    try {
      console.log('Verifica esistenza email:', email);
      const searchUrl = `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`;
      console.log('URL ricerca:', searchUrl);
      
      const searchResponse = await axios({
        method: 'GET',
        url: searchUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      console.log('Risposta ricerca:', searchResponse.status);
      console.log('Subscriber trovato:', searchResponse.data?.data?.email);
      
      // L'iscritto esiste, genera un token per l'aggiornamento
      const updateData = { email, name, last_name, language };
      const token = generateToken(email, updateData);
      
      // Costruisci l'URL di conferma
      const baseUrl = process.env.BASE_URL || 'https://matteocervelli.com';
      console.log('BASE_URL:', baseUrl);
      const lang = language === 'en' ? 'en' : 'it';
      const confirmUrl = `${baseUrl}/${lang}/newsletter/update-confirm/?token=${encodeURIComponent(token)}`;
      console.log('URL conferma creato:', confirmUrl);
      
      // Prepara i contenuti dell'email in base alla lingua
      const emailSubjects = {
        it: 'Conferma aggiornamento profilo newsletter',
        en: 'Confirm newsletter profile update'
      };
      
      const emailContents = {
        it: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Conferma aggiornamento profilo</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { max-width: 150px; height: auto; }
              .content { background-color: #f9f9f9; border-radius: 8px; padding: 25px; margin-bottom: 30px; }
              .button-container { text-align: center; margin: 35px 0; }
              .button { display: inline-block; background-color: #0066CC; color: white; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 4px; }
              .footer { font-size: 14px; color: #666; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>The Scalability Compass</h2>
            </div>
            <div class="content">
              <p>Ciao${name ? ' ' + name : ''},</p>
              <p>Abbiamo ricevuto una richiesta di aggiornamento del tuo profilo per The Scalability Compass.</p>
              <p>Per confermare e applicare questi aggiornamenti, clicca sul pulsante qui sotto:</p>
              
              <div class="button-container">
                <a href="${confirmUrl}" class="button">Conferma aggiornamento</a>
              </div>
              
              <p>Se non hai richiesto questa modifica, puoi ignorare questa email.</p>
              <p>Il link scadrà tra 24 ore per motivi di sicurezza.</p>
            </div>
            <div class="footer">
              <p>Grazie,<br>Matteo Cervelli</p>
              <p><small>The Scalability Compass - Strategie per la crescita sostenibile</small></p>
            </div>
          </body>
          </html>
        `,
        en: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirm Profile Update</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { max-width: 150px; height: auto; }
              .content { background-color: #f9f9f9; border-radius: 8px; padding: 25px; margin-bottom: 30px; }
              .button-container { text-align: center; margin: 35px 0; }
              .button { display: inline-block; background-color: #0066CC; color: white; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 4px; }
              .footer { font-size: 14px; color: #666; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>The Scalability Compass</h2>
            </div>
            <div class="content">
              <p>Hello${name ? ' ' + name : ''},</p>
              <p>We've received a request to update your profile for The Scalability Compass.</p>
              <p>To confirm and apply these updates, please click the button below:</p>
              
              <div class="button-container">
                <a href="${confirmUrl}" class="button">Confirm Update</a>
              </div>
              
              <p>If you didn't request this change, you can safely ignore this email.</p>
              <p>The link will expire in 24 hours for security reasons.</p>
            </div>
            <div class="footer">
              <p>Thank you,<br>Matteo Cervelli</p>
              <p><small>The Scalability Compass - Strategies for sustainable growth</small></p>
            </div>
          </body>
          </html>
        `
      };
      
      // Invia email di conferma tramite MailerLite API
      const emailData = {
        subject: emailSubjects[lang] || emailSubjects['en'],
        content: {
          html: emailContents[lang] || emailContents['en']
        },
        from: {
          name: 'Matteo Cervelli',
          email: 'newsletter@adlimen.com'
        },
        to: [{ email }]
      };
      
      await axios({
        method: 'POST',
        url: 'https://connect.mailerlite.com/api/emails',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        data: emailData
      });
      
      console.log('Email di conferma inviata con successo');
      
      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          success: true, 
          message: lang === 'it' ? 
            'Abbiamo inviato un\'email di conferma. Controlla la tua casella di posta per completare l\'aggiornamento.' : 
            'We\'ve sent a confirmation email. Please check your inbox to complete the update.'
        })
      };
      
    } catch (searchError) {
      // L'iscritto non esiste
      console.log('Errore ricerca iscritto:', searchError.message);
      console.log('Status ricerca:', searchError.response?.status);
      console.log('Dati risposta:', JSON.stringify(searchError.response?.data || {}));
      
      if (searchError.response && searchError.response.status === 404) {
        const lang = language === 'en' ? 'en' : 'it';
        console.log('Utente non trovato (404)');
        return {
          statusCode: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({ 
            success: false, 
            message: lang === 'it' ? 
              'Questa email non risulta iscritta alla newsletter. Verifica che l\'indirizzo sia corretto.' : 
              'This email is not subscribed to the newsletter. Please verify the address is correct.'
          })
        };
      }
      throw searchError;
    }
    
  } catch (error) {
    console.error('Errore nella richiesta di aggiornamento:', error.response?.data || error.message);
    console.log('Stack trace:', error.stack);
    
    let statusCode = 500;
    let errorMessage = 'Si è verificato un errore. Si prega di riprovare più tardi.';
    
    // Gestione errori specifici dell'API
    if (error.response) {
      statusCode = error.response.status;
      console.log('Status errore API:', error.response.status);
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        console.log('Messaggio errore API:', error.response.data.message);
      }
    } else if (error.message.includes('MAILERLITE_API_KEY')) {
      statusCode = 500;
      errorMessage = 'Errore di configurazione del server. Contattare l\'amministratore.';
      console.log('Errore configurazione API key');
    }
    
    return {
      statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ success: false, message: errorMessage })
    };
  }
}; 