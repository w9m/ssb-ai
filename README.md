# Smart Study Buddy (AI)

Ingest course files once, turn them into a searchable knowledge base (chunks + embeddings + outline), then generate notes, quizzes, flashcards, and chat answers via RAG.

## Stack
- Fastify + TypeScript API (`server/`)
- Supabase (Auth, Postgres/pgvector, Storage)
- OpenAI (embeddings + chat/vision)
- Vite + React dashboard (`web/`)
- Docker for local dev, Vitest for basic tests

## Quickstart
1) Env: copy `.env.example` → `.env` (root) and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY`. Copy `web/.env.example` → `web/.env` and set `VITE_API_URL` + Supabase anon key.
2) DB: run `server/migrations/001_init.sql` in Supabase SQL editor (enables `vector`, creates tables + `match_chunks`).
3) Install/test:
   ```bash
   cd server && npm install
   npm test
   cd ../web && npm install
   ```
4) Seed (demo course + bucket):
   ```bash
   cd server
   npm run seed
   ```
5) Run: `npm run dev` in `server` (4000) and `web` (5173) or `docker-compose up --build`.

## API
- `POST /api/courses` body `{ title, description?, userId? }`
- `POST /api/upload` multipart `{ courseId, userId, courseTitle, module?, file }` → uploads to Supabase Storage, extracts/OCR, chunks, embeds, writes `files` + `chunks`, saves outline.
- `POST /api/chat` body `{ courseId, question }` → RAG answer with citations.
- `POST /api/notes` body `{ courseId, scope: course|module|lesson, target }`
- `POST /api/quiz` body `{ courseId, scope, target, count? }`
- `POST /api/flashcards` body `{ courseId, scope, target, count? }`
- `GET /health`

## Pipeline
1. Upload to Supabase Storage bucket (`course-files` default).
2. Text extraction (PDF/DOCX/PPTX parsers, OpenAI vision for images).
3. Chunking with overlap (`chunkSize`, `chunkOverlap`).
4. Embeddings (`text-embedding-3-small`) stored in `chunks.embedding` (pgvector).
5. Outline generator persisted to `outlines`.

## Database
`server/migrations/001_init.sql` defines `courses`, `files`, `chunks` (vector(1536) + metadata json), `outlines`, `notes`, `quizzes`, `flashcards`, and `match_chunks(p_course_id, p_query_embedding, p_match_count)`.

## Frontend
`web/` dashboard lets you upload, view outline, ask RAG questions with citations, and trigger notes/quiz/flashcard generation.

## Notes
- Upload requires `courseId` and `userId` to satisfy the Supabase schema.
- Storage bucket name is configurable via `SUPABASE_BUCKET`.
- OpenAI is used for embeddings, RAG answers, outline, notes/quizzes/flashcards, and image OCR.
