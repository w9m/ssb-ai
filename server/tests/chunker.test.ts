import { describe, expect, it } from 'vitest';
import { chunkText } from '../src/services/chunker';

describe('chunkText', () => {
  it('splits text into overlapped chunks', () => {
    const text = ['Intro paragraph.', 'Second paragraph with more text.', 'Third paragraph here.'].join(
      '\n\n'
    );
    const chunks = chunkText(text, { chunkSize: 30, overlap: 5 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[1].content.startsWith('raph.')).toBe(true);
  });
});
