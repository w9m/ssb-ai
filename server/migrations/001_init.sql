-- Enable extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- Courses
create table if not exists courses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  title text not null,
  created_at timestamptz default now()
);

-- Files
create table if not exists files (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  user_id uuid not null,
  filename text not null,
  storage_path text not null,
  mime_type text,
  status text default 'uploaded',
  created_at timestamptz default now()
);

-- Chunks + embeddings
create table if not exists chunks (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  file_id uuid references files(id) on delete cascade,
  chunk_index int,
  content text not null,
  metadata jsonb,
  embedding vector(1536),
  created_at timestamptz default now()
);

create index if not exists chunks_embedding_idx
on chunks using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Outline
create table if not exists outlines (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  outline jsonb not null,
  created_at timestamptz default now()
);

-- Notes
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  scope_type text,
  scope_key text,
  content text not null,
  created_at timestamptz default now()
);

-- Quizzes
create table if not exists quizzes (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  scope_type text,
  scope_key text,
  quiz jsonb not null,
  created_at timestamptz default now()
);

-- Flashcards
create table if not exists flashcards (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  scope_type text,
  scope_key text,
  cards jsonb not null,
  created_at timestamptz default now()
);

-- Similarity search helper
create or replace function match_chunks(
  p_course_id uuid,
  p_query_embedding vector(1536),
  p_match_count int default 5
)
returns table (
  id uuid,
  file_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    c.id,
    c.file_id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> p_query_embedding) as similarity
  from chunks c
  where c.course_id = p_course_id
  order by c.embedding <=> p_query_embedding
  limit p_match_count;
$$;
