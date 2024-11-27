import twilio from 'twilio';
import OpenAI from 'openai';

const VoiceResponse = twilio.twiml.VoiceResponse;
const openai = new OpenAI(process.env.OPENAI_API_KEY!);

export async function POST(req: Request) {
  const twiml = new VoiceResponse();
  const url = new URL(req.url);
  const threadId = url.searchParams.get('threadId');

  if (!threadId) {
    twiml.say('Error: No thread ID provided.');
    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  const formData = await req.formData();
  const speechResult = formData.get('SpeechResult')?.toString() || '';

  if (speechResult) {
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

      const response = lastMessage?.content[0].text.value || 'I apologize, but I don\'t have a response for that.';

      // Convert the assistant's response to speech
      twiml.say({ voice: 'Polly.Amy' }, response);
    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      twiml.say('I apologize, but I encountered an error. Please try again later.');
    }
  } else {
    twiml.say('Hello! How can I help you today?');
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

