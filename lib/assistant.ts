import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY!);

export class OpenAIAssistant {
  constructor(private apiKey: string) {}

  async createThread() {
    const thread = await openai.beta.threads.create();
    return thread;
  }

  async sendMessage({ threadId, content }: { threadId: string; content: string }) {
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID!,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Retrieve the assistant's messages
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data
      .filter(message => message.role === 'assistant')
      .pop();

    return lastMessage?.content[0].text.value || 'No response from assistant.';
  }
}

