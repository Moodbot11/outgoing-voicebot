import twilio from 'twilio';
import OpenAI from 'openai';
import { textToSpeech, speechToText } from '../../../utils/openai-utils';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: Request) {
  const twiml = new VoiceResponse();
  const url = new URL(req.url);
  let threadId = url.searchParams.get('threadId');

  // Fetch OpenAI credentials
  const credentialsResponse = await fetch(`${process.env.VERCEL_URL}/api/get-openai-key`);
  if (!credentialsResponse.ok) {
    console.error('Failed to fetch OpenAI credentials');
    twiml.say({ voice: 'Polly.Amy' }, 'I apologize, but there was an error with the system configuration. Please try again later.');
    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  const { apiKey, assistantId } = await credentialsResponse.json();
  const openai = new OpenAI({ apiKey });

  console.log('Request received:', { threadId, url: req.url });

  const formData = await req.formData();
  const recordingUrl = formData.get('RecordingUrl')?.toString();
  let speechResult = '';

  if (recordingUrl) {
    const audioResponse = await fetch(recordingUrl);
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    speechResult = await speechToText(audioBuffer);
  }

  console.log('Received speech:', speechResult);

  try {
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      console.log('Created new thread:', threadId);
      
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: 'This is the start of a phone conversation. You are a helpful AI assistant. Please provide concise, relevant responses to each user input and maintain context throughout the conversation. Always respond as if you are speaking directly to the user.',
      });
      
      const initialGreeting = 'Hello! How can I help you today?';
      const audioBuffer = await textToSpeech(initialGreeting);
      twiml.play({ loop: 1 }, Buffer.from(audioBuffer).toString('base64'));
    } else if (speechResult) {
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
      let attempts = 0;
      const maxAttempts = 30;
      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        attempts++;
        console.log(`Attempt ${attempts}: Run status - ${runStatus.status}`);
      }

      if (runStatus.status !== 'completed') {
        throw new Error(`Assistant run timed out or failed. Final status: ${runStatus.status}`);
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
      const audioBuffer = await textToSpeech(response);
      twiml.play({ loop: 1 }, Buffer.from(audioBuffer).toString('base64'));
    } else {
      twiml.say({ voice: 'Polly.Amy' }, 'I didn\'t catch that. Could you please repeat?');
    }

    twiml.record({
      action: `https://${process.env.VERCEL_URL}/api/twilio/voice?threadId=${threadId}`,
      method: 'POST',
      maxLength: 10,
      playBeep: true,
      trim: 'trim-silence'
    });

    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' }
    });
  } catch (error) {
    console.error('Error in voice route:', error);
    twiml.say({ voice: 'Polly.Amy' }, 'I apologize, but I encountered an error. Please try again later.');
    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}

