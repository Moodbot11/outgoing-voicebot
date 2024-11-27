import twilio from 'twilio';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.ASSISTANT_ID;

    if (!accountSid || !authToken || !twilioPhoneNumber || !openaiApiKey || !assistantId) {
      console.error('Missing credentials:', { 
        accountSid: accountSid ? 'Set' : 'Missing',
        authToken: authToken ? 'Set' : 'Missing',
        twilioPhoneNumber: twilioPhoneNumber ? 'Set' : 'Missing',
        openaiApiKey: openaiApiKey ? 'Set' : 'Missing',
        assistantId: assistantId ? 'Set' : 'Missing'
      });
      throw new Error('Credentials are not set correctly in environment variables');
    }

    const client = twilio(accountSid, authToken);
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Create a new thread for this outgoing call
    const thread = await openai.beta.threads.create();

    const call = await client.calls.create({
      url: `https://outgoing-voicebot.vercel.app/api/twilio/voice?threadId=${thread.id}`,
      to: phoneNumber,
      from: twilioPhoneNumber
    });

    console.log('Outgoing call initiated successfully:', call.sid);
    return Response.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Error in /api/twilio/call:', error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

