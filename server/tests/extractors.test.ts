import { describe, expect, it } from 'vitest';
import { detectFileKind } from '../src/services/extractors';

describe('detectFileKind', () => {
  it('detects by extension', () => {
    expect(detectFileKind('file.pdf')).toBe('pdf');
    expect(detectFileKind('slide.pptx')).toBe('pptx');
    expect(detectFileKind('note.docx')).toBe('docx');
  });

  it('detects images by mimetype', () => {
    expect(detectFileKind('image.bin', 'image/png')).toBe('image');
  });
});
