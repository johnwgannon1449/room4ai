import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../utils/api';

const GRADES = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade',
  'Multiple Grades',
];

const SUBJECTS = [
  'English Language Arts', 'Mathematics', 'Science', 'History-Social Science',
  'Art', 'Music', 'Physical Education', 'Computer Science', 'Foreign Language',
  'Special Education', 'Other',
];

export default function ClassSetup({ user, onUpdate }) {
  const [form, setForm] = useState({
    teacher_name: user?.name || '',
    grade: '',
    subject: '',
    school_name: '',
    class_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadExisting();
  }, []);

  async function loadExisting() {
    try {
      const res = await api.getClass();
      if (res.class) {
        setForm({
          teacher_name: res.class.teacher_name || user?.name || '',
          grade: res.class.grade || '',
          subject: res.class.subject || '',
          school_name: res.class.school_name || '',
          class_date: res.class.class_date
            ? new Date(res.class.class_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Failed to load class data');
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.teacher_name.trim()) { setError('Teacher name is required'); return; }
    if (!form.grade) { setError('Grade level is required'); return; }
    if (!form.subject) { setError('Subject is required'); return; }
    setError('');
    setLoading(true);

    try {
      await api.saveClass(form);
      if (onUpdate) onUpdate({ ...user, name: form.teacher_name });

      // Check if template is set
      if (!user?.template_choice || user.template_choice === 'classic') {
        navigate('/templates');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <button onClick={() => navigate('/dashboard')} className="text-sm text-label hover:text-primary transition-colors">
            Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Class Profile</h1>
          <p className="text-label mt-1">Your info will appear on exported lesson plans</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Teacher Name *</label>
              <input
                className="input-field"
                placeholder="Ms. Johnson"
                value={form.teacher_name}
                onChange={(e) => setForm((f) => ({ ...f, teacher_name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Grade Level *</label>
                <select
                  className="input-field"
                  value={form.grade}
                  onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                >
                  <option value="">Select grade...</option>
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Subject *</label>
                <select
                  className="input-field"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                >
                  <option value="">Select subject...</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">School Name</label>
              <input
                className="input-field"
                placeholder="Lincoln Elementary School"
                value={form.school_name}
                onChange={(e) => setForm((f) => ({ ...f, school_name: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Class Date</label>
              <input
                className="input-field"
                type="date"
                value={form.class_date}
                onChange={(e) => setForm((f) => ({ ...f, class_date: e.target.value }))}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
