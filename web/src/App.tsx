import { useMemo, useState } from 'react';
import './App.css';

type OutlineSection = { title: string; lessons?: string[]; concepts?: string[] };
type QuizQuestion = { prompt: string; options: { label: string; text: string; correct?: boolean }[]; answer: string; explanation: string };
type Flashcard = { question: string; answer: string; explanation: string };

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  const [courseId, setCourseId] = useState('');
  const [userId, setUserId] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [module, setModule] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [outline, setOutline] = useState<OutlineSection[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [notes, setNotes] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [generatorScope, setGeneratorScope] = useState<'course' | 'module' | 'lesson'>('course');
  const [generatorTarget, setGeneratorTarget] = useState('');
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const apiReady = useMemo(() => Boolean(apiBase), []);

  const handleUpload = async () => {
    if (!courseId || !userId || !file) {
      setStatus('Course ID, user ID, and file are required.');
      return;
    }

    const form = new FormData();
    form.append('courseId', courseId);
    form.append('userId', userId);
    form.append('courseTitle', courseTitle || 'Untitled course');
    if (module) form.append('module', module);
    form.append('file', file);

    setUploading(true);
    setStatus('Uploading and processing...');
    try {
      const res = await fetch(`${apiBase}/api/upload`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setOutline(data.outline || []);
      setStatus('Ingestion complete. Outline ready.');
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChat = async () => {
    if (!courseId || !question) {
      setStatus('Course ID and question are required for chat.');
      return;
    }
    setChatLoading(true);
    setStatus('Fetching answer...');
    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, question })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      setAnswer(data.answer);
      setSources(data.sources || []);
      setStatus(null);
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const triggerGeneration = async (type: 'notes' | 'quiz' | 'flashcards') => {
    if (!courseId) {
      setStatus('Set a course ID first.');
      return;
    }
    const target = generatorTarget || courseTitle || 'Course';
    setLoadingType(type);
    setStatus(`Generating ${type}...`);
    try {
      const res = await fetch(`${apiBase}/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          scope: generatorScope,
          target
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `${type} failed`);
      if (type === 'notes') setNotes(data.content);
      if (type === 'quiz') setQuiz(data.quiz || []);
      if (type === 'flashcards') setFlashcards(data.cards || []);
      setStatus(`${type} ready.`);
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Smart Study Buddy</p>
          <h1>Upload once. Ask forever.</h1>
          <p className="lede">
            Ingest course files, build a knowledge base with embeddings, and generate notes, quizzes, and flashcards.
          </p>
          <div className="badges">
            <span>Supabase</span>
            <span>OpenAI RAG</span>
            <span>Vector Search</span>
          </div>
        </div>
        <div className="panel status">
          <p className="label">Connection</p>
          <p>{apiReady ? `API: ${apiBase}` : 'API URL not set'}</p>
          {status && <p className="status-text">{status}</p>}
        </div>
      </header>

      <section className="grid two">
        <div className="panel">
          <div className="panel-header">
            <h3>1) Upload course files</h3>
            <span className="pill">PDF · DOCX · PPTX · Images</span>
          </div>
          <div className="form-grid">
            <label>
              Course ID
              <input value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="uuid-or-slug" />
            </label>
            <label>
              User ID
              <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="supabase user id" />
            </label>
            <label>
              Course Title
              <input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="ex: Linear Algebra" />
            </label>
            <label>
              Module (optional)
              <input value={module} onChange={(e) => setModule(e.target.value)} placeholder="ex: Week 1" />
            </label>
            <label className="file-input">
              <span>Choose file</span>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <button className="primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Processing...' : 'Upload & Process'}
          </button>
          <p className="hint">Uploads send files to Supabase Storage, extract text + OCR, chunk, embed, and persist metadata.</p>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>2) Outline</h3>
            <span className="pill ghost">{outline.length || 0} modules</span>
          </div>
          <div className="outline">
            {outline.length === 0 && <p className="muted">Upload a file to see the generated outline.</p>}
            {outline.map((section, idx) => (
              <div key={idx} className="outline-card">
                <div className="outline-title">{section.title}</div>
                <div className="outline-list">
                  {(section.lessons || []).map((lesson, li) => (
                    <span key={li} className="chip">
                      {lesson}
                    </span>
                  ))}
                </div>
                <div className="outline-concepts">{(section.concepts || []).join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid two">
        <div className="panel">
          <div className="panel-header">
            <h3>3) Ask anything (RAG chat)</h3>
          </div>
          <div className="chat">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are the main theorems in module 1?"
            />
            <button className="primary" onClick={handleChat} disabled={chatLoading}>
              {chatLoading ? 'Searching...' : 'Answer with citations'}
            </button>
            {answer && (
              <div className="answer">
                <p>{answer}</p>
                {sources.length > 0 && (
                  <div className="sources">
                    <p className="label">Sources</p>
                    {sources.map((src, idx) => (
                      <div key={idx} className="source-chip">
                        <span>#{idx + 1}</span>
                        <span>{src.metadata?.storage_path || src.file_id}</span>
                        <span>{(src.similarity * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>4) Generators</h3>
            <span className="pill">Notes · Quiz · Flashcards</span>
          </div>
          <div className="form-grid compact">
            <label>
              Scope
              <select value={generatorScope} onChange={(e) => setGeneratorScope(e.target.value as any)}>
                <option value="course">Course</option>
                <option value="module">Module</option>
                <option value="lesson">Lesson</option>
              </select>
            </label>
            <label>
              Target
              <input value={generatorTarget} onChange={(e) => setGeneratorTarget(e.target.value)} placeholder="ex: Week 2" />
            </label>
          </div>
          <div className="button-row">
            <button onClick={() => triggerGeneration('notes')} disabled={loadingType === 'notes'}>
              {loadingType === 'notes' ? 'Generating...' : 'Notes'}
            </button>
            <button onClick={() => triggerGeneration('quiz')} disabled={loadingType === 'quiz'}>
              {loadingType === 'quiz' ? 'Generating...' : 'Quiz'}
            </button>
            <button onClick={() => triggerGeneration('flashcards')} disabled={loadingType === 'flashcards'}>
              {loadingType === 'flashcards' ? 'Generating...' : 'Flashcards'}
            </button>
          </div>

          {notes && (
            <div className="notes">
              <h4>Notes</h4>
              <pre>{notes}</pre>
            </div>
          )}

          {quiz.length > 0 && (
            <div className="quiz">
              <h4>Quiz</h4>
              {quiz.map((q, idx) => (
                <div key={idx} className="quiz-card">
                  <p className="question">
                    {idx + 1}. {q.prompt}
                  </p>
                  <ul>
                    {q.options.map((opt, oi) => (
                      <li key={oi}>
                        <strong>{opt.label}.</strong> {opt.text} {opt.correct ? '✓' : ''}
                      </li>
                    ))}
                  </ul>
                  <p className="muted">
                    Answer: {q.answer} — {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {flashcards.length > 0 && (
            <div className="flashcards">
              <h4>Flashcards</h4>
              <div className="cards">
                {flashcards.slice(0, 6).map((card, idx) => (
                  <div key={idx} className="card-tile">
                    <p className="label">{card.question}</p>
                    <p className="answer">{card.answer}</p>
                    <p className="muted">{card.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
