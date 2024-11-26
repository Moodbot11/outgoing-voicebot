import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not set in environment variables');
    }

    const client = twilio(accountSid, authToken);

    const call = await client.calls.create({
      url: 'https://outgoing-voicebot.vercel.app/api/twilio/voice',
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    return Response.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Error in /api/twilio/call:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

