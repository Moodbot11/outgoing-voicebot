import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export let assistantId = process.env.OPENAI_ASSISTANT_ID || "";

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

