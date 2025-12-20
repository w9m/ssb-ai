import OpenAI from 'openai';
import { config } from '../config';
import { getRelevantChunks } from './repository';

export interface RagAnswer {
  answer: string;
  sources: Array<{
    id: string;
    file_id: string;
    content: string;
    metadata: Record<string, any>;
    similarity: number;
  }>;
}

export const answerQuestion = async (
  openai: OpenAI,
  courseId: string,
  question: string
): Promise<RagAnswer> => {
  const embeddingResponse = await openai.embeddings.create({
    model: config.embeddingModel,
    input: question
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;
  const matches = await getRelevantChunks(courseId, queryEmbedding);

  const context = matches
    .map(
      (chunk: any, idx: number) =>
        `[${idx + 1}] (file: ${chunk.file_id} module: ${chunk.metadata?.module || 'n/a'}) ${chunk.content}`
    )
    .join('\n\n');

  const completion = await openai.chat.completions.create({
    model: config.chatModel,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You are a tutor. Answer using only the provided context. Add inline citations like [1] referencing the numbered chunks.'
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nContext:\n${context}\n\nAnswer with 3-5 sentences and citations.`
      }
    ]
  });

  return {
    answer: completion.choices[0].message?.content || '',
    sources: matches
  };
};
