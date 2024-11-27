import twilio from 'twilio';
import OpenAI from 'openai';

const VoiceResponse = twilio.twiml.VoiceResponse;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const twiml = new VoiceResponse();
  const url = new URL(req.url);
  let threadId = url.searchParams.get('threadId');
  const assistantId = process.env.ASSISTANT_ID;

  if (!process.env.OPENAI_API_KEY || !assistantId) {
    console.error('Missing OpenAI credentials');
    twiml.say({ voice: 'Polly.Amy' }, 'I apologize, but there was an error with the system configuration. Please try again later.');
    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  const formData = await req.formData();
  const speechResult = formData.get('SpeechResult')?.toString() || '';

  console.log('Received speech:', speechResult);

  if (!threadId) {
    try {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      console.log('Created new thread:', threadId);
    } catch (error) {
      console.error('Error creating thread:', error);
      twiml.say({ voice: 'Polly.Amy' }, 'I apologize, but I encountered an error. Please try again later.');
      return new Response(twiml.toString(), {
        headers: { 'Content-Type': 'application/xml' }
      });
    }
  }

  if (speechResult) {
    try {
      console.log('Sending message to thread:', threadId);
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: speechResult,
      });

      console.log('Running assistant');
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      console.log('Waiting for run to complete');
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      while (runStatus.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      console.log('Retrieving assistant response');
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data
        .filter(message => message.role === 'assistant')
        .pop();

      let response = 'I apologize, but I don\'t have a response for that.';
      if (lastMessage && lastMessage.content[0].type === 'text') {
        response = lastMessage.content[0].text.value;
      }

      console.log('Assistant response:', response);
      twiml.say({ voice: 'Polly.Amy' }, response);
    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      twiml.say({ voice: 'Polly.Amy' }, 'I apologize, but I encountered an error. Please try again later.');
    }
  } else {
    twiml.say({ voice: 'Polly.Amy' }, 'Hello! How can I help you today?');
  }

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

