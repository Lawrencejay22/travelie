import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ArrowIcon, CompassIcon, SparkIcon } from '../components/Icons';
import { api, ApiError, getSession, setSession } from '../lib/api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (getSession()) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const session = await api.login(email.trim(), password);
      if (session.user.role !== 'ADMIN') {
        setError('This console is reserved for Travelie administrators.');
        return;
      }
      setSession(session);
      navigate('/dashboard', { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth__visual">
        <img src="/welcome.jpg" alt="" />
        <div className="auth__scrim" />
        <Link to="/" className="auth__brand">
          <Logo light />
        </Link>
        <div className="auth__quote">
          <span className="pill pill--gold">
            <SparkIcon size={13} /> Travelie console
          </span>
          <h1>Run the journey behind the journey.</h1>
          <p>
            Destinations, travelers and the road to launch — all in one calm, focused workspace.
          </p>
          <div className="auth__proof">
            <span>
              <CompassIcon size={16} /> 9 destinations live
            </span>
            <span>
              <CompassIcon size={16} /> PostGIS coordinates ready
            </span>
          </div>
        </div>
      </aside>

      <main className="auth__panel">
        <div className="auth__form-wrap">
          <div className="auth__mobile-brand">
            <Logo />
          </div>
          <span className="eyebrow">Administrator access</span>
          <h2>Welcome back.</h2>
          <p className="auth__lede">
            Sign in with an administrator account to manage the Travelie catalog and watch the
            platform grow.
          </p>

          <form className="auth__form" onSubmit={submit}>
            <label className="field">
              <span className="field__label">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@travelie.app"
                autoComplete="email"
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? <div className="alert alert--error">{error}</div> : null}

            <button type="submit" className="btn btn--ink btn--full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
              {!loading ? <ArrowIcon size={16} /> : null}
            </button>
          </form>

          <p className="auth__foot">
            Looking for the traveler experience? <Link to="/">Back to Travelie</Link>
          </p>
        </div>
      </main>
    </div>
  );
}