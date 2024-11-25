import express from 'express';
import twilio from 'twilio';
import bodyParser from 'body-parser';

const app = express();
const VoiceResponse = twilio.twiml.VoiceResponse;

// Use the body parser middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Endpoint to handle incoming voice calls
app.post('/api/voice', (req, res) => {
  const twiml = new VoiceResponse();
  twiml.say('Hello! This is a test call from your Twilio app.');
  
  // You can include TwiML Dial to forward call or handle other logic

  res.type('text/xml');
  res.send(twiml.toString());
});