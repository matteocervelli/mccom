const axios = require('axios');

exports.handler = async (event, context) => {
  // CORS headers for browser compatibility
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const payload = JSON.parse(event.body);
    const { email, language } = payload;

    // Validate required fields
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Email is required' })
      };
    }

    // Group ID based on language
    const groupId = language === 'en' 
      ? '151481753002837465'  // English group ID
      : '151309607914964876'; // Italian group ID (default)

    // Call MailerLite API to request confirmation resend
    const response = await axios.post(
      `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}/confirm`,
      {
        groups: [groupId]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
        }
      }
    );

    // Successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Confirmation email has been sent'
      })
    };
  } catch (error) {
    console.error('Error resending confirmation:', error.response?.data || error.message);
    
    // For subscriber not found or other errors, we still return a success message
    // to prevent exposing if an email exists in the system (privacy consideration)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'If your email exists in our system, a confirmation email has been sent'
      })
    };
  }
}; 