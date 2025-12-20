export type FileKind = 'pdf' | 'docx' | 'pptx' | 'image' | 'txt' | 'unknown';

export interface ExtractionResult {
  text: string;
  pages?: number;
}

export interface FileRecord {
  id?: string;
  course_id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  mime_type?: string | null;
  status?: string;
}

export interface Chunk {
  id?: string;
  content: string;
  index: number;
  metadata?: Record<string, any>;
}

export interface OutlineSection {
  title: string;
  lessons: string[];
  concepts: string[];
}

export interface OutlineRecord {
  id?: string;
  course_id: string;
  outline: OutlineSection[];
  raw_text?: string;
}

export type GenerationScope = 'course' | 'module' | 'lesson';

export interface NoteRecord {
  id?: string;
  course_id: string;
  scope_type: GenerationScope;
  scope_key: string;
  content: string;
}

export interface QuizOption {
  label: string;
  text: string;
  correct?: boolean;
}

export interface QuizQuestion {
  prompt: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
}

export interface QuizRecord {
  id?: string;
  course_id: string;
  scope_type: GenerationScope;
  scope_key: string;
  quiz: QuizQuestion[];
}

export interface Flashcard {
  question: string;
  answer: string;
  explanation: string;
}

export interface FlashcardRecord {
  id?: string;
  course_id: string;
  scope_type: GenerationScope;
  scope_key: string;
  cards: Flashcard[];
}
