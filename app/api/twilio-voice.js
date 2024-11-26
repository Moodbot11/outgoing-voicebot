import express from 'express';
import twilio from 'twilio';
import bodyParser from 'body-parser';

const app = express();
const VoiceResponse = twilio.twiml.VoiceResponse;

// Middleware to handle URL-encoded bodies for incoming Twilio requests
app.use(bodyParser.urlencoded({ extended: false }));

// Define a route to handle voice requests
app.post('/api/voice', (req, res) => {
  const twiml = new VoiceResponse();
  twiml.say('Hello! This is a test call from your Twilio app.', { voice: 'alice' });

  res.type('text/xml');
  res.send(twiml.toString());
});

export default app;