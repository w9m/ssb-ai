import { supabase } from '../supabase';
import { Chunk, FileRecord, FlashcardRecord, NoteRecord, OutlineRecord, QuizRecord } from '../types';

export const ensureBucket = async (bucket: string): Promise<void> => {
  const { data } = await supabase.storage.getBucket(bucket);
  if (!data) {
    await supabase.storage.createBucket(bucket, { public: false });
  }
};

export const uploadToBucket = async (
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType?: string
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    cacheControl: '3600',
    upsert: true,
    contentType
  });
  if (error) throw error;
};

export const saveFileRecord = async (file: FileRecord): Promise<FileRecord> => {
  const { data, error } = await supabase.from('files').insert(file).select().single();
  if (error) throw error;
  return data;
};

export const updateFileStatus = async (fileId: string, status: string) => {
  const { error } = await supabase.from('files').update({ status }).eq('id', fileId);
  if (error) throw error;
};

export const saveOutline = async (record: OutlineRecord): Promise<OutlineRecord> => {
  const payload = {
    course_id: record.course_id,
    outline: record.outline
  };
  const { data, error } = await supabase.from('outlines').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const saveChunks = async (
  fileId: string,
  courseId: string,
  chunks: Chunk[],
  embeddings: number[][]
): Promise<void> => {
  const payload = chunks.map((chunk, idx) => ({
    file_id: fileId,
    course_id: courseId,
    content: chunk.content,
    chunk_index: chunk.index,
    metadata: chunk.metadata || {},
    embedding: embeddings[idx]
  }));

  const { error } = await supabase.from('chunks').insert(payload);
  if (error) throw error;
};

export const getRelevantChunks = async (
  courseId: string,
  queryEmbedding: number[],
  limit = 8
) => {
  const { data, error } = await supabase.rpc('match_chunks', {
    p_match_count: limit,
    p_query_embedding: queryEmbedding,
    p_course_id: courseId
  });
  if (error) throw error;
  return data;
};

export const fetchCourseText = async (courseId: string, scopeKey?: string) => {
  const { data, error } = await supabase
    .from('chunks')
    .select('content, chunk_index, metadata')
    .eq('course_id', courseId)
    .order('chunk_index', { ascending: true });

  if (error || !data) throw error || new Error('No chunks found');
  const filtered = scopeKey
    ? data.filter((row: any) => row.metadata?.module === scopeKey || row.metadata?.scope_key === scopeKey)
    : data;
  return filtered.map((row) => row.content).join('\n\n');
};

export const saveNote = async (record: NoteRecord) => {
  const { data, error } = await supabase.from('notes').insert(record).select().single();
  if (error) throw error;
  return data;
};

export const saveQuiz = async (record: QuizRecord) => {
  const { data, error } = await supabase.from('quizzes').insert(record).select().single();
  if (error) throw error;
  return data;
};

export const saveFlashcards = async (record: FlashcardRecord) => {
  const { data, error } = await supabase.from('flashcards').insert(record).select().single();
  if (error) throw error;
  return data;
};
