import OpenAI from 'openai';
import { config } from './config';

let openai: OpenAI;

if (config.mockAi) {
  const mockEmbedding = (input: any) => {
    const arr = Array.isArray(input) ? input : [input];
    const embedding = Array(1536).fill(0);
    embedding[0] = 1;
    return {
      data: arr.map((_item: any, idx: number) => ({
        object: 'embedding',
        index: idx,
        embedding
      }))
    };
  };

  const mockChat = (content: string) =>
    `[MOCK AI] This is a simulated response. Echo: ${content.slice(0, 120)}...`;

  openai = {
    embeddings: {
      create: async ({ input }: { input: any }) => mockEmbedding(input)
    },
    chat: {
      completions: {
        create: async ({ messages }: { messages: any[] }) => {
          const last = messages[messages.length - 1];
          const text =
            typeof last?.content === 'string'
              ? last.content
              : Array.isArray(last?.content)
              ? last.content.map((c: any) => c?.text || '').join(' ')
              : '';
          return {
            choices: [{ message: { content: mockChat(text) } }]
          };
        }
      }
    }
  } as unknown as OpenAI;
} else {
  openai = new OpenAI({
    apiKey: config.openAiApiKey
  });
}

export { openai };
