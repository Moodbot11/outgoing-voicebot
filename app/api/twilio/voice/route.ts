import twilio from 'twilio';
import OpenAI from 'openai';

const VoiceResponse = twilio.twiml.VoiceResponse;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const twiml = new VoiceResponse();
  const url = new URL(req.url);
  let threadId = url.searchParams.get('threadId');

  const formData = await req.formData();
  const speechResult = formData.get('SpeechResult')?.toString() || '';

  if (!threadId) {
    // This is a new call, create a thread
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    twiml.say({ voice: 'Polly.Amy' }, 'Hello! How can I help you today?');
  } else if (speechResult) {
    try {
      // Send user's speech to OpenAI assistant
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: speechResult,
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: process.env.ASSISTANT_ID!,
      });

      // Wait for the run to complete
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      while (runStatus.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      // Retrieve the assistant's response
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data
        .filter(message => message.role === 'assistant')
        .pop();

      let response = 'I apologize, but I don\'t have a response for that.';
      if (lastMessage && lastMessage.content[0].type === 'text') {
        response = lastMessage.content[0].text.value;
      }

      // Convert the assistant's response to speech
      twiml.say({ voice: 'Polly.Amy' }, response);
    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      twiml.say({ voice: 'Polly.Amy' }, 'I apologize, but I encountered an error. Please try again later.');
    }
  } else {
    twiml.say({ voice: 'Polly.Amy' }, 'I didn\'t catch that. Could you please repeat?');
  }

  // Continue the conversation
  twiml.gather({
    input: ['speech'],
    action: `https://outgoing-voicebot.vercel.app/api/twilio/voice?threadId=${threadId}`,
    method: 'POST',
    speechTimeout: 'auto',
    language: 'en-US'
  });

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'application/xml' }
  });
}

