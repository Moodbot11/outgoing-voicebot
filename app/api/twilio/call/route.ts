import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in environment variables');
}

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  const { phoneNumber } = await req.json();
  
  // Use VERCEL_URL if available, otherwise fallback to a local development URL
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

  try {
    const call = await client.calls.create({
      url: `${baseUrl}/api/twilio/voice`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    return Response.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

