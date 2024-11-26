import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: Request) {
  const twiml = new VoiceResponse();
  
  // Add initial greeting
  twiml.say({ voice: 'Polly.Amy' }, 'Hello! How can I help you today?');
  
  // Gather speech input from the user
  twiml.gather({
    input: 'speech',
    action: `/api/twilio/response`,
    method: 'POST',
    speechTimeout: 'auto',
    language: 'en-US'
  });

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'application/xml' }
  });
}

