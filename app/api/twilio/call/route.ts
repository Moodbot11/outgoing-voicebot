import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(req: Request) {
  const { phoneNumber } = await req.json()
  
  try {
    const call = await client.calls.create({
      url: `${process.env.VERCEL_URL}/api/twilio/voice`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    })

    return Response.json({ success: true, callSid: call.sid })
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

