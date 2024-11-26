import twilio from 'twilio';
import OpenAI from 'openai';

const VoiceResponse = twilio.twiml.VoiceResponse;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const formData = await req.formData();
  const speechResult = formData.get('SpeechResult')?.toString() || '';
  
  const twiml = new VoiceResponse();
  
  try {
    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: speechResult }],
    });

    const response = completion.choices[0].message.content || 'I apologize, but I don\'t have a response for that.';

    // Convert the assistant's response to speech
    twiml.say({ voice: 'Polly.Amy' }, response);
    
    // Continue the conversation
    twiml.gather({
      input: 'speech',
      action: `/api/twilio/response`,
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US'
    });

  } catch (error) {
    console.error('Error:', error);
    twiml.say({ voice: 'Polly.Amy' }, 'I apologize, but I encountered an error. Please try again later.');
  }

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'application/xml' }
  });
}

