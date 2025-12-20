import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate('/app', { replace: true });
  }, [session, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    else navigate('/app');
    setLoading(false);
  };

  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', padding: 32 }}>
      <Card style={{ width: 400 }}>
        <h2>Sign In</h2>
        <p className="subtle">Access your Smart Study Buddy workspace.</p>
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
          <Button onClick={handleLogin} disabled={loading || !email || !password}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="subtle">
            Need an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
