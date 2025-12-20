import OpenAI from 'openai';
import { config } from '../config';
import { Chunk } from '../types';

export const embedChunks = async (
  openai: OpenAI,
  chunks: Chunk[],
  model = config.embeddingModel
): Promise<number[][]> => {
  const inputs = chunks.map((chunk) => chunk.content);
  const response = await openai.embeddings.create({
    model,
    input: inputs
  });

  return response.data.map((item) => item.embedding);
};
