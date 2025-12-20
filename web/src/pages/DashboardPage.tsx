import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { askQuestion, createCourse, fetchOutline, generateContent, uploadCourseFile } from '../lib/api';
import { Badge } from '../components/ui/Badge';

type OutlineSection = { title: string; lessons?: string[]; concepts?: string[] };

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [module, setModule] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [outline, setOutline] = useState<OutlineSection[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [notes, setNotes] = useState('');
  const [quiz, setQuiz] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [genLoading, setGenLoading] = useState<string | null>(null);

  const aiMode = useMemo(() => (import.meta.env.VITE_MOCK_AI === 'true' ? 'mock' : 'live'), []);

  useEffect(() => {
    const loadCourses = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('courses')
        .select('id,title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setCourses(data);
        if (data.length > 0) {
          setCurrentCourseId(data[0].id);
          setCourseTitle(data[0].title);
          try {
            const o = await fetchOutline(data[0].id);
            setOutline(o.outline || []);
          } catch {
            /* ignore */
          }
        }
      }
    };
    loadCourses();
  }, [user?.id]);

  const handleCreateCourse = async () => {
    if (!courseTitle) return;
    setStatus('Creating course...');
    try {
      const course = await createCourse(courseTitle);
      setCourses((prev) => [{ id: course.id, title: course.title }, ...prev]);
      setCurrentCourseId(course.id);
      setStatus('Course created. You can upload files now.');
    } catch (err: any) {
      setStatus(err.message);
    }
  };

  const handleUpload = async () => {
    if (!currentCourseId || !file) {
      setStatus('Select or create a course and choose a file.');
      return;
    }
    setUploading(true);
    setStatus('Uploading and processing...');
    try {
      const res = await uploadCourseFile(currentCourseId, file, courseTitle, module);
      setOutline(res.outline || []);
      setStatus('Processing complete. Outline updated.');
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChat = async () => {
    if (!currentCourseId || !question) {
      setStatus('Pick a course and enter a question.');
      return;
    }
    setChatLoading(true);
    setStatus('Fetching answer...');
    try {
      const res = await askQuestion(currentCourseId, question);
      setAnswer(res.answer);
      setSources(res.sources || []);
      setStatus(null);
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const runGenerator = async (type: 'notes' | 'quiz' | 'flashcards') => {
    if (!currentCourseId) {
      setStatus('Create or select a course first.');
      return;
    }
    setGenLoading(type);
    setStatus(`Generating ${type}...`);
    try {
      const res = await generateContent(type, currentCourseId, 'course', courseTitle || 'Course');
      if (type === 'notes') setNotes(res.content);
      if (type === 'quiz') setQuiz(res.quiz || res.questions || []);
      if (type === 'flashcards') setFlashcards(res.cards || []);
      setStatus(`${type} ready.`);
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setGenLoading(null);
    }
  };

  return (
    <div className="layout">
      <Sidebar onLogout={signOut} current="courses" />
      <div className="content">
        <Topbar
          aiMode={aiMode as 'mock' | 'live'}
          userEmail={user?.email || ''}
          courseTitle={courseTitle}
          onCourseTitleChange={setCourseTitle}
          onCreateCourse={handleCreateCourse}
        />

        <div style={{ padding: 24 }}>
          {status && (
            <Card style={{ marginBottom: 16 }}>
              <div className="subtle">{status}</div>
            </Card>
          )}

          <div className="grid two">
            <Card>
              <div className="section-title">Courses</div>
              <div className="subtle" style={{ marginBottom: 8 }}>
                One user → many courses. Select a course to upload files.
              </div>
              <div className="grid" style={{ gap: 8 }}>
                {courses.map((c) => (
                  <Button
                    key={c.id}
                    variant={c.id === currentCourseId ? 'primary' : 'secondary'}
                    onClick={() => {
                      setCurrentCourseId(c.id);
                      setCourseTitle(c.title);
                      fetchOutline(c.id).then((o) => setOutline(o.outline || [])).catch(() => {});
                    }}
                  >
                    {c.title}
                  </Button>
                ))}
              </div>
            </Card>

            <Card>
              <div className="section-title">Upload course files</div>
              <div className="grid">
                <label className="label">
                  Module (optional)
                  <Input value={module} onChange={(e) => setModule(e.target.value)} placeholder="Week 1" />
                </label>
                <label className="label">
                  File
                  <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
                <Button onClick={handleUpload} disabled={uploading || !file || !currentCourseId}>
                  {uploading ? 'Processing...' : 'Upload & Process'}
                </Button>
              </div>
            </Card>
          </div>

          <div className="grid two" style={{ marginTop: 16 }}>
            <Card>
              <div className="section-title">Outline</div>
              {outline.length === 0 && <div className="subtle">Upload a file to see the outline.</div>}
              <div className="grid">
                {outline.map((o, idx) => (
                  <div key={idx} className="card" style={{ padding: 12, borderColor: '#e2e8f0' }}>
                    <div style={{ fontWeight: 700 }}>{o.title}</div>
                    <div className="subtle">Lessons: {(o.lessons || []).join(', ')}</div>
                    <div className="subtle">Concepts: {(o.concepts || []).join(', ')}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="section-title">Ask anything (RAG)</div>
              <textarea
                className="textarea"
                placeholder="What are the key theorems in module 1?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button onClick={handleChat} disabled={chatLoading || !question}>
                  {chatLoading ? 'Searching...' : 'Answer with citations'}
                </Button>
              </div>
              {answer && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Answer</div>
                  <p>{answer}</p>
                  {sources.length > 0 && (
                    <div className="grid">
                      {sources.map((s, idx) => (
                        <Badge key={idx}>
                          #{idx + 1} • {s.metadata?.storage_path || s.file_id} • {(s.similarity * 100).toFixed(1)}%
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="grid two" style={{ marginTop: 16 }}>
            <Card>
              <div className="section-title">Generators</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={() => runGenerator('notes')} disabled={genLoading === 'notes'}>
                  {genLoading === 'notes' ? 'Generating...' : 'Notes'}
                </Button>
                <Button onClick={() => runGenerator('quiz')} disabled={genLoading === 'quiz'}>
                  {genLoading === 'quiz' ? 'Generating...' : 'Quiz'}
                </Button>
                <Button onClick={() => runGenerator('flashcards')} disabled={genLoading === 'flashcards'}>
                  {genLoading === 'flashcards' ? 'Generating...' : 'Flashcards'}
                </Button>
              </div>

              {notes && (
                <div style={{ marginTop: 12 }}>
                  <div className="section-title">Notes</div>
                  <div className="card" style={{ background: '#f8fafc' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{notes}</pre>
                  </div>
                </div>
              )}

              {quiz.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="section-title">Quiz</div>
                  <div className="grid">
                    {quiz.map((q: any, idx: number) => (
                      <div key={idx} className="card" style={{ background: '#f8fafc' }}>
                        <div style={{ fontWeight: 700 }}>{idx + 1}. {q.prompt}</div>
                        <ul>
                          {(q.options || []).map((o: any, oi: number) => (
                            <li key={oi}>
                              <strong>{o.label}.</strong> {o.text} {o.correct ? '✓' : ''}
                            </li>
                          ))}
                        </ul>
                        <div className="subtle">Answer: {q.answer} — {q.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card>
              {flashcards.length === 0 ? (
                <div className="section-title">Flashcards will appear here</div>
              ) : (
                <>
                  <div className="section-title">Flashcards</div>
                  <div className="grid two">
                    {flashcards.map((card: any, idx: number) => (
                      <div key={idx} className="card" style={{ background: '#f8fafc' }}>
                        <div className="section-title" style={{ marginBottom: 4 }}>{card.question}</div>
                        <div style={{ fontWeight: 700 }}>{card.answer}</div>
                        <div className="subtle">{card.explanation}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
