const redirectUrl = language === 'it' 
  ? '/it/tools/decision-compass-download/'
  : '/en/tools/decision-compass-download/';

return {
  statusCode: 302,
  headers: {
    'Location': redirectUrl,
    'Cache-Control': 'no-cache'
  },
  body: ''
}; 