import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

type TopbarProps = {
  aiMode: 'mock' | 'live';
  userEmail?: string;
  courseTitle?: string;
  onCourseTitleChange?: (v: string) => void;
  onCreateCourse?: () => void;
};

export const Topbar = ({ aiMode, userEmail, courseTitle, onCourseTitleChange, onCreateCourse }: TopbarProps) => (
  <div className="topbar">
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div>
        <div className="section-title">Current course</div>
        <Input
          placeholder="Name your course"
          value={courseTitle || ''}
          onChange={(e) => onCourseTitleChange?.(e.target.value)}
          style={{ width: 260 }}
        />
      </div>
      <button className="btn secondary" onClick={onCreateCourse} disabled={!courseTitle}>
        Save course
      </button>
      <Badge>{aiMode === 'mock' ? 'AI: Mock Mode' : 'AI: Live Mode'}</Badge>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span className="subtle">{userEmail}</span>
    </div>
  </div>
);
