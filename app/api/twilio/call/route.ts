import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials are not set correctly in environment variables');
    }

    const client = twilio(accountSid, authToken);

    const call = await client.calls.create({
      url: `${process.env.VERCEL_URL || 'https://outgoing-voicebot.vercel.app'}/api/twilio/voice`,
      to: phoneNumber,
      from: twilioPhoneNumber
    });

    console.log('Outgoing call initiated successfully:', call.sid);
    return Response.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Error in /api/twilio/call:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

