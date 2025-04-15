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

    // Verifica se l'iscritto esiste prima di procedere
    try {
      const searchResponse = await axios({
        method: 'GET',
        url: `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      // L'iscritto esiste, genera un token per l'aggiornamento
      const updateData = { email, name, last_name, language };
      const token = generateToken(email, updateData);
      
      // Costruisci l'URL di conferma
      const baseUrl = process.env.BASE_URL || 'https://matteocervelli.com';
      const lang = language === 'en' ? 'en' : 'it';
      const confirmUrl = `${baseUrl}/${lang}/newsletter/update-confirm/?token=${encodeURIComponent(token)}`;
      
      // Prepara i contenuti dell'email in base alla lingua
      const emailSubjects = {
        it: 'Conferma aggiornamento profilo newsletter',
        en: 'Confirm newsletter profile update'
      };
      
      const emailContents = {
        it: `
          <p>Ciao${name ? ' ' + name : ''},</p>
          <p>Abbiamo ricevuto una richiesta di aggiornamento del tuo profilo per The Scalability Compass.</p>
          <p>Per confermare questi aggiornamenti, clicca sul pulsante qui sotto:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="display: inline-block; background-color: #0066CC; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Conferma aggiornamento</a>
          </p>
          <p>Se non hai richiesto questa modifica, puoi ignorare questa email.</p>
          <p>Il link scadrà tra 24 ore per motivi di sicurezza.</p>
          <p>Grazie,<br>Matteo Cervelli</p>
        `,
        en: `
          <p>Hello${name ? ' ' + name : ''},</p>
          <p>We've received a request to update your profile for The Scalability Compass.</p>
          <p>To confirm these updates, please click the button below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="display: inline-block; background-color: #0066CC; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Confirm Update</a>
          </p>
          <p>If you didn't request this change, you can safely ignore this email.</p>
          <p>The link will expire in 24 hours for security reasons.</p>
          <p>Thank you,<br>Matteo Cervelli</p>
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
          email: 'newsletter@matteocervelli.com'
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
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: true, 
          message: lang === 'it' ? 
            'Abbiamo inviato un\'email di conferma. Controlla la tua casella di posta per completare l\'aggiornamento.' : 
            'We\'ve sent a confirmation email. Please check your inbox to complete the update.'
        })
      };
      
    } catch (searchError) {
      // L'iscritto non esiste
      if (searchError.response && searchError.response.status === 404) {
        const lang = language === 'en' ? 'en' : 'it';
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
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
    
    let statusCode = 500;
    let errorMessage = 'Si è verificato un errore. Si prega di riprovare più tardi.';
    
    // Gestione errori specifici dell'API
    if (error.response) {
      statusCode = error.response.status;
      
      if (error.response.data && error.response.data.message) {
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