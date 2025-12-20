import { NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';

type SidebarProps = {
  onLogout: () => Promise<void>;
  current?: string;
};

const links = [
  { key: 'courses', label: 'Courses' },
  { key: 'upload', label: 'Upload' },
  { key: 'chat', label: 'Chat' },
  { key: 'notes', label: 'Notes' },
  { key: 'quiz', label: 'Quizzes' },
  { key: 'flashcards', label: 'Flashcards' },
  { key: 'settings', label: 'Settings' }
];

export const Sidebar = ({ onLogout, current }: SidebarProps) => {
  return (
    <aside className="sidebar">
      <div className="logo">Smart Study Buddy</div>
      <nav>
        {links.map((link) => (
          <button key={link.key} className={link.key === current ? 'active' : ''}>
            {link.label}
          </button>
        ))}
      </nav>
      <Button variant="ghost" onClick={onLogout}>
        Logout
      </Button>
      <NavLink to="/" style={{ color: '#cbd5f5', fontSize: 12 }}>
        Back to site
      </NavLink>
    </aside>
  );
};
