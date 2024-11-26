// api/twilio-webhook.js
import { VoiceResponse } from 'twilio';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const callerInput = req.body.SpeechResult || 'Hello, how can I assist you today?';

    const openAiResponse = await openai.completions.create({
      model: "gpt-4",
      prompt: callerInput,
    });

    const aiTextResponse = openAiResponse.choices[0].text.trim();

    const twiml = new VoiceResponse();
    twiml.say(aiTextResponse);

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
  } else {
    res.status(405).send('Method Not Allowed');
  }
}