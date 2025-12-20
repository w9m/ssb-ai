import * as dotenv from 'dotenv';

dotenv.config();

const required = (name: string, fallback?: string): string => {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === 'test' && fallback) return fallback;
  if (process.env.MOCK_AI === 'true' && fallback) return fallback;
  throw new Error(`Missing required env var ${name}`);
};

export const config = {
  port: Number(process.env.PORT || 4000),
  supabaseUrl: required('SUPABASE_URL', 'http://localhost:54321'),
  supabaseServiceRole: (() => {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    if (key) return key;
    return required('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
  })(),
  supabaseBucket: process.env.SUPABASE_BUCKET || 'course-files',
  openAiApiKey: required('OPENAI_API_KEY', 'test-key'),
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  chatModel: process.env.CHAT_MODEL || 'gpt-4o-mini',
  outlineModel: process.env.OUTLINE_MODEL || process.env.CHAT_MODEL || 'gpt-4o-mini',
  chunkSize: Number(process.env.CHUNK_SIZE || 1200),
  chunkOverlap: Number(process.env.CHUNK_OVERLAP || 150),
  mockAi: process.env.MOCK_AI === 'true'
};
