import OpenAI from 'openai';
import { config } from '../config';
import {
  Flashcard,
  FlashcardRecord,
  GenerationScope,
  NoteRecord,
  OutlineRecord,
  OutlineSection,
  QuizQuestion,
  QuizRecord
} from '../types';

const parseJsonSafe = <T>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const generateOutline = async (
  openai: OpenAI,
  courseId: string,
  courseTitle: string,
  text: string
): Promise<OutlineRecord> => {
  const response = await openai.chat.completions.create({
    model: config.outlineModel,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You are a curriculum designer. Break the course text into a concise outline with modules, lessons, and key concepts.'
      },
      {
        role: 'user',
        content:
          `Course Title: ${courseTitle}\nReturn JSON array with shape ` +
          `[{"title":"Module 1","lessons":["Lesson"],"concepts":["Topic"]}].` +
          `Use no more than 6 modules. Text:\n\n${text.slice(0, 6000)}`
      }
    ]
  });

  const message = response.choices[0].message?.content || '[]';
  const outline = parseJsonSafe<OutlineSection[]>(message, []);
  return { course_id: courseId, outline, raw_text: message };
};

export const generateNotes = async (
  openai: OpenAI,
  courseId: string,
  scope: GenerationScope,
  target: string,
  text: string
): Promise<NoteRecord> => {
  const response = await openai.chat.completions.create({
    model: config.chatModel,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: 'You create clear, concise study notes with headings and bullet points.'
      },
      {
        role: 'user',
        content: `Generate study notes for ${scope} "${target}". Focus on essential ideas and definitions.\n\nSource:\n${text.slice(
          0,
          8000
        )}`
      }
    ]
  });

  const content = response.choices[0].message?.content || '';
  return { course_id: courseId, scope_type: scope, scope_key: target, content };
};

export const generateQuiz = async (
  openai: OpenAI,
  courseId: string,
  scope: GenerationScope,
  target: string,
  text: string,
  questionCount = 5
): Promise<QuizRecord> => {
  const response = await openai.chat.completions.create({
    model: config.chatModel,
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content:
          'Create multiple choice questions. Each question must have 4 options (A-D) and one correct answer with explanation. Return JSON only.'
      },
      {
        role: 'user',
        content: `Generate ${questionCount} MCQs for ${scope} "${target}".\nSource:\n${text.slice(0, 6000)}`
      }
    ]
  });

  const json = response.choices[0].message?.content || '[]';
  const questions = parseJsonSafe<QuizQuestion[]>(json, []);
  return { course_id: courseId, scope_type: scope, scope_key: target, quiz: questions };
};

export const generateFlashcards = async (
  openai: OpenAI,
  courseId: string,
  scope: GenerationScope,
  target: string,
  text: string,
  cardCount = 10
): Promise<FlashcardRecord> => {
  const response = await openai.chat.completions.create({
    model: config.chatModel,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content:
          'Create flashcards. Each card has question, answer, and one-line explanation. Return JSON only.'
      },
      {
        role: 'user',
        content: `Generate ${cardCount} flashcards for ${scope} "${target}".\nSource:\n${text.slice(0, 5000)}`
      }
    ]
  });

  const raw = response.choices[0].message?.content || '[]';
  const cards = parseJsonSafe<Flashcard[]>(raw, []);
  return { course_id: courseId, scope_type: scope, scope_key: target, cards };
};
