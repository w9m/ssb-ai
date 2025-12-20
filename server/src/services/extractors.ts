import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import OpenAI from 'openai';
import { config } from '../config';
import { ExtractionResult, FileKind } from '../types';

const imageMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

export const detectFileKind = (filename: string, mimetype?: string | null): FileKind => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.pptx')) return 'pptx';
  if (imageMimeTypes.includes(mimetype || '')) return 'image';
  if (lower.endsWith('.txt')) return 'txt';
  return 'unknown';
};

const extractPdf = async (buffer: Buffer): Promise<ExtractionResult> => {
  const parser = pdfParse as unknown as (input: Buffer) => Promise<{ text: string; numpages?: number }>;
  const data = await parser(buffer);
  return { text: data.text, pages: data.numpages };
};

const extractDocx = async (buffer: Buffer): Promise<ExtractionResult> => {
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value || '' };
};

const extractPptx = async (buffer: Buffer): Promise<ExtractionResult> => {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files).filter((f) => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));
  const texts: string[] = [];

  for (const path of slideFiles) {
    const content = await zip.file(path)?.async('string');
    if (!content) continue;
    const xml = await parseStringPromise(content);
    const slideTexts: string[] = [];

    const walk = (node: any): void => {
      if (!node) return;
      if (typeof node === 'string') {
        slideTexts.push(node);
        return;
      }
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      Object.values(node).forEach(walk);
    };

    walk(xml);
    if (slideTexts.length) {
      texts.push(slideTexts.join(' '));
    }
  }

  return { text: texts.join('\n\n') };
};

const extractTxt = async (buffer: Buffer): Promise<ExtractionResult> => ({
  text: buffer.toString('utf-8')
});

const extractImage = async (
  openai: OpenAI,
  buffer: Buffer,
  mimetype?: string | null
): Promise<ExtractionResult> => {
  const base64 = buffer.toString('base64');
  const mime = mimetype || 'image/png';

  const response = await openai.chat.completions.create({
    model: config.chatModel,
    messages: [
      {
        role: 'system',
        content: 'You are an OCR assistant. Extract all visible text from the image. Return plain text only.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mime};base64,${base64}`
            }
          }
        ]
      }
    ]
  });

  const text = response.choices[0]?.message?.content?.trim() || '';
  return { text };
};

export const extractText = async (
  openai: OpenAI,
  buffer: Buffer,
  filename: string,
  mimetype?: string | null
): Promise<ExtractionResult> => {
  const kind = detectFileKind(filename, mimetype);

  switch (kind) {
    case 'pdf':
      return extractPdf(buffer);
    case 'docx':
      return extractDocx(buffer);
    case 'pptx':
      return extractPptx(buffer);
    case 'txt':
      return extractTxt(buffer);
    case 'image':
      return extractImage(openai, buffer, mimetype);
    default:
      throw new Error(`Unsupported file type: ${filename}`);
  }
};
