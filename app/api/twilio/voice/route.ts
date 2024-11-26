import twilio from 'twilio'
import { OpenAIAssistant } from '@/lib/assistant'

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(req: Request) {
  const twiml = new VoiceResponse()
  
  // Start a new conversation with your assistant
  const assistant = new OpenAIAssistant(process.env.OPENAI_API_KEY!)
  const thread = await assistant.createThread()
  
  // Add initial greeting
  twiml.say({ voice: 'Polly.Amy' }, 'Hello! How can I help you today?')
  
  // Gather speech input from the user
  twiml.gather({
    input: 'speech',
    action: `/api/twilio/response?threadId=${thread.id}`,
    method: 'POST',
    speechTimeout: 'auto',
    language: 'en-US'
  })

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'application/xml' }
  })
}

