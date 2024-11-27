import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  return mp3.arrayBuffer();
}

export async function speechToText(audioBuffer: Buffer): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: new File([audioBuffer], "audio.wav", { type: "audio/wav" }),
    model: "whisper-1",
  });

  return transcription.text;
}

export async function getChatCompletion(messages: any[]): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
  });

  return completion.choices[0].message.content || "";
}

