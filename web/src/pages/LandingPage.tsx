import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const features = [
  { title: 'RAG chat', desc: 'Ask anything and get answers grounded in your course files with citations.' },
  { title: 'Notes', desc: 'Auto-generate concise study notes per course, module, or lesson.' },
  { title: 'Quizzes', desc: 'MCQs with answers and explanations to self-test understanding.' },
  { title: 'Flashcards', desc: 'Bite-sized Q&A cards to drill key concepts quickly.' }
];

export default function LandingPage() {
  return (
    <div className="app-shell">
      <div className="container hero">
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1.2fr 1fr', alignItems: 'center' }}>
          <div>
            <p className="badge" style={{ borderColor: '#cbd5f5' }}>
              Upload once. Ask forever.
            </p>
            <h1 style={{ fontSize: 48, marginTop: 12, marginBottom: 12 }}>Smart Study Buddy</h1>
            <p className="subtle" style={{ fontSize: 18 }}>
              Turn PDFs, slides, and docs into a live knowledge base. Upload once, then chat, generate notes,
              quizzes, and flashcards instantly.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Sign In</Button>
              </Link>
            </div>
          </div>
          <Card>
            <h3>How it works</h3>
            <ol style={{ paddingLeft: 18, color: '#475569' }}>
              <li>Upload PDFs, DOCX, PPTX, or images.</li>
              <li>AI extracts text, chunks, and embeds into Supabase.</li>
              <li>Auto outline your course and start asking questions.</li>
              <li>Generate notes, quizzes, and flashcards on demand.</li>
            </ol>
          </Card>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: 80 }}>
        <h2 style={{ marginBottom: 12 }}>Features</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <Card key={f.title}>
              <h4>{f.title}</h4>
              <p className="subtle">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
