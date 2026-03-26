import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../utils/api';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'signup') {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        if (form.password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
        res = await api.signup({ name: form.name, email: form.email, password: form.password });
      } else {
        res = await api.login({ email: form.email, password: form.password });
      }

      localStorage.setItem('room4ai_token', res.token);
      onLogin(res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="xl" />
          <p className="text-label mt-2">Lesson planning, elevated.</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-label hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                mode === 'signup' ? 'bg-white text-primary shadow-sm' : 'text-label hover:text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input-field"
                  placeholder="Ms. Johnson"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input
                className="input-field"
                type="email"
                placeholder="teacher@school.edu"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-label mt-4">
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-accent hover:underline font-medium">
                Sign up free
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          For California K-12 educators
        </p>
      </div>
    </div>
  );
}
