import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../auth/AuthProvider';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate('/app', { replace: true });
  }, [session, navigate]);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) setError(err.message);
    else navigate('/app');
    setLoading(false);
  };

  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', padding: 32 }}>
      <Card style={{ width: 400 }}>
        <h2>Create Account</h2>
        <p className="subtle">Start uploading course files and studying with AI.</p>
        <div className="grid" style={{ marginTop: 16 }}>
          <label className="label">
            Email
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <label className="label">
            Password
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          {error && <div className="alert">{error}</div>}
          <Button onClick={handleRegister} disabled={loading || !email || !password}>
            {loading ? 'Creating...' : 'Register'}
          </Button>
          <p className="subtle">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
