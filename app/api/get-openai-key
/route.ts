import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  
  if (!apiKey || !assistantId) {
    return NextResponse.json({ error: 'OpenAI credentials are not set' }, { status: 500 });
  }

  return NextResponse.json({ apiKey, assistantId });
}

