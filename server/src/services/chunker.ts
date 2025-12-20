import { Chunk } from '../types';

interface ChunkOptions {
  chunkSize: number;
  overlap: number;
}

export const chunkText = (text: string, options: ChunkOptions): Chunk[] => {
  const { chunkSize, overlap } = options;
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const rawChunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length <= chunkSize) {
      current = candidate;
      continue;
    }

    if (current) {
      rawChunks.push(current);
    } else {
      rawChunks.push(para.slice(0, chunkSize));
    }

    current = para;
  }

  if (current) {
    rawChunks.push(current);
  }

  // apply overlap
  const overlapped: Chunk[] = rawChunks.map((content, index) => {
    if (index === 0) return { content, index };
    const previous = rawChunks[index - 1];
    const prefix = previous.slice(Math.max(0, previous.length - overlap));
    return { content: `${prefix}\n\n${content}`, index };
  });

  return overlapped;
};
