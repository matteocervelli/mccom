const axios = require('axios');
const crypto = require('crypto');

// Funzione per generare un token sicuro
function generateToken(email, data) {
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
  // Gestione richieste OPTIONS per CORS preflight
  if (event.httpMethod === 'OPTIONS') {
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
    data = JSON.parse(event.body);
  } catch (error) {
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
  if (!email) {
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
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      throw new Error('MAILERLITE_API_KEY non configurata');
    }

    // Verifica se l'iscritto esiste prima di procedere (su MailerLite)
    try {
      const searchUrl = `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`;
      await axios({
        method: 'GET',
        url: searchUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      // Iscritto trovato, procedi a inviare email via MailerSend
      const updateData = { email, name, last_name, language };
      const token = generateToken(email, updateData);
      const baseUrl = process.env.BASE_URL || 'https://matteocervelli.com';
      const lang = language === 'en' ? 'en' : 'it';
      const confirmUrl = `${baseUrl}/${lang}/newsletter/update-confirm/?token=${encodeURIComponent(token)}`;
      
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

      // Invia email di conferma tramite MailerSend
      try {
        const mailerSendPayload = {
          from: {
            name: 'Matteo Cervelli',
            email: 'newsletter@adlimen.com' // Deve essere un sender verificato su MailerSend
          },
          to: [
            { email: email } // L'email dell'utente
          ],
          subject: emailSubjects[lang] || emailSubjects['en'],
          html: emailContents[lang] || emailContents['en']
          // text: // Aggiungere versione testuale se necessario
        };
        const mailerSendApiKey = process.env.MAILERSEND_API_KEY;
        if (!mailerSendApiKey) {
          throw new Error('MAILERSEND_API_KEY non configurata');
        }
        await axios({
          method: 'POST',
          // URL API MailerSend
          url: 'https://api.mailersend.com/v1/email', 
          headers: {
            'Content-Type': 'application/json',
            // Autenticazione MailerSend
            'Authorization': `Bearer ${mailerSendApiKey}` 
          },
          data: mailerSendPayload
        });
        
        return {
          statusCode: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({ success: true, message: lang === 'it' ? 'Email di conferma inviata.' : 'Confirmation email sent.' })
        };
      } catch (emailError) {
        console.error("Errore invio MailerSend:", emailError.message, emailError.response?.data);
        throw new Error('Failed to send confirmation email via MailerSend'); 
      }
      
    } catch (searchError) {
      // Errore specifico nella ricerca iscritto MailerLite
      if (searchError.response && searchError.response.status === 404) {
        const lang = language === 'en' ? 'en' : 'it';
        return {
          statusCode: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({ success: false, message: lang === 'it' ? 'Email non iscritta.' : 'Email not subscribed.' })
        };
      }
      console.error("Errore ricerca MailerLite:", searchError.message);
      throw searchError; // Rilancia altri errori di ricerca
    }
    
  } catch (error) {
    // Errore generale o rilanciato
    console.error("Errore generale request-profile-update:", error.message);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ success: false, message: 'Errore interno.' })
    };
  }
}; 