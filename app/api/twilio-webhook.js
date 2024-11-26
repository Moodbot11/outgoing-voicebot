import { createHmac } from 'crypto';
import { twiml } from 'twilio';
import { Twilio } from 'twilio';

// Your Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

// Create a Twilio client
const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Function to verify Twilio requests
function isTwilioRequest(req) {
  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `https://${req.headers.host}${req.url}`;
  const params = req.body;

  const hmac = createHmac('sha1', TWILIO_AUTH_TOKEN);
  hmac.update(url + params);
  const signature = hmac.digest('base64');

  return twilioSignature === signature;
}

// Vercel serverless function to handle Twilio requests
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Verify the request
    if (!isTwilioRequest(req)) {
      return res.status(403).send('Forbidden');
    }

    // Handle incoming SMS or voice requests
    const twilioMsg = req.body;
    console.log('Received Message:', twilioMsg);

    // Respond to the incoming request with a message
    const twimlResponse = new twiml.MessagingResponse();
    twimlResponse.message('Thank you for your message!');

    // Send the response back to Twilio
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twimlResponse.toString());
  } else {
    res.status(405).send('Method Not Allowed');
  }
}