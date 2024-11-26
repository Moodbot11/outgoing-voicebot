import twilio from 'twilio'
import { OpenAIAssistant } from '../../../lib/assistant'

// rest of the code



const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(req: Request) {
  const formData = await req.formData()
  const speechResult = formData.get('SpeechResult')?.toString() || ''
  const threadId = new URL(req.url).searchParams.get('threadId')
  
  if (!threadId) {
    throw new Error('Thread ID is required')
  }

  const twiml = new VoiceResponse()
  
  try {
    // Get response from your existing Assistant
    const assistant = new OpenAIAssistant(process.env.OPENAI_API_KEY!)
    const response = await assistant.sendMessage({
      threadId,
      content: speechResult
    })

    // Convert the assistant's response to speech
    twiml.say({ voice: 'Polly.Amy' }, response)
    
    // Continue the conversation
    twiml.gather({
      input: 'speech',
      action: `/api/twilio/response?threadId=${threadId}`,
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US'
    })

  } catch (error) {
    console.error('Error:', error)
    twiml.say({ voice: 'Polly.Amy' }, 'I apologize, but I encountered an error. Please try again later.')
  }

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'application/xml' }
  })
}

