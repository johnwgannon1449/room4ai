import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EMPTY_FORM = {
  teacher_name: '',
  grade: '',
  subject: '',
  school_name: '',
  class_date: new Date().toISOString().split('T')[0],
  default_duration: '',
  warmup_activity: '',
  warmup_duration: '',
  exit_ticket: '',
  differentiation_notes: '',
  materials: '',
  homework_reminder: '',
};

export default function ClassSetup({ user, onUpdate }) {
  const { id } = useParams(); // 'new' or a class id
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...EMPTY_FORM, teacher_name: user?.name || '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!isNew);
  const [error, setError] = useState('');
  const [showDefaults, setShowDefaults] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.getClass(id)
        .then((res) => {
          if (res.class) {
            const c = res.class;
            setForm({
              teacher_name: c.teacher_name || '',
              grade: c.grade || '',
              subject: c.subject || '',
              school_name: c.school_name || '',
              class_date: c.class_date
                ? new Date(c.class_date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              default_duration: c.default_duration != null ? String(c.default_duration) : '',
              warmup_activity: c.warmup_activity || '',
              warmup_duration: c.warmup_duration || '',
              exit_ticket: c.exit_ticket || '',
              differentiation_notes: c.differentiation_notes || '',
              materials: c.materials || '',
              homework_reminder: c.homework_reminder || '',
            });
            // Open defaults section if any defaults exist
            if (c.warmup_activity || c.exit_ticket || c.differentiation_notes || c.materials || c.homework_reminder) {
              setShowDefaults(true);
            }
          }
        })
        .catch(() => navigate('/dashboard'))
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.teacher_name.trim()) { setError('Teacher name is required'); return; }
    if (!form.grade) { setError('Grade level is required'); return; }
    if (!form.subject) { setError('Subject is required'); return; }
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        warmup_duration: form.warmup_duration ? parseInt(form.warmup_duration, 10) : null,
        default_duration: form.default_duration ? parseInt(form.default_duration, 10) : null,
      };

      if (isNew) {
        await api.createClass(payload);
      } else {
        await api.updateClass(id, payload);
      }

      if (onUpdate) onUpdate({ ...user, name: form.teacher_name });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <button onClick={() => navigate('/dashboard')} className="text-sm text-label hover:text-primary transition-colors">
            Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">{isNew ? 'Create Class' : 'Edit Class'}</h1>
          <p className="text-label mt-1">Your info will appear on exported lesson plans</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Core fields */}
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

            <div>
              <label className="label">
                Default Lesson Duration
                <span className="text-label font-normal ml-1">(minutes, optional)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  className="input-field w-32"
                  type="number"
                  min="1"
                  max="300"
                  placeholder="45"
                  value={form.default_duration}
                  onChange={(e) => setForm((f) => ({ ...f, default_duration: e.target.value }))}
                />
                <span className="text-label text-sm">minutes</span>
              </div>
              <p className="text-xs text-label mt-1">Pre-fills every lesson's duration. Teacher can override per lesson.</p>
            </div>

            {/* Lesson Defaults — collapsible */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDefaults((s) => !s)}
                className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-primary-light transition-colors text-left"
              >
                <div>
                  <span className="font-medium text-primary text-sm">Lesson Defaults</span>
                  <p className="text-xs text-label mt-0.5">Pre-fill every lesson plan for this class. Editable per lesson.</p>
                </div>
                <svg
                  className={`w-4 h-4 text-label transition-transform flex-shrink-0 ${showDefaults ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDefaults && (
                <div className="px-4 pb-4 pt-3 space-y-4">
                  <div className="space-y-3">
                    <label className="label">Warm-Up Activity</label>
                    <textarea
                      className="input-field min-h-[70px] resize-y"
                      placeholder="e.g., Quick vocabulary review..."
                      value={form.warmup_activity}
                      onChange={(e) => setForm((f) => ({ ...f, warmup_activity: e.target.value }))}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        className="input-field w-24"
                        type="number"
                        min="1"
                        max="60"
                        placeholder="5"
                        value={form.warmup_duration}
                        onChange={(e) => setForm((f) => ({ ...f, warmup_duration: e.target.value }))}
                      />
                      <span className="text-label text-sm">minutes</span>
                    </div>
                  </div>

                  <div>
                    <label className="label">Exit Ticket / Closing Routine</label>
                    <textarea
                      className="input-field min-h-[70px] resize-y"
                      placeholder="e.g., Students write one takeaway on an index card..."
                      value={form.exit_ticket}
                      onChange={(e) => setForm((f) => ({ ...f, exit_ticket: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label">Differentiation Notes — ELL / IEP</label>
                    <textarea
                      className="input-field min-h-[70px] resize-y"
                      placeholder="e.g., Sentence frames for ELL, extended time for IEP..."
                      value={form.differentiation_notes}
                      onChange={(e) => setForm((f) => ({ ...f, differentiation_notes: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label">Materials / Supplies Needed</label>
                    <textarea
                      className="input-field min-h-[60px] resize-y"
                      placeholder="e.g., Whiteboard markers, printed worksheets..."
                      value={form.materials}
                      onChange={(e) => setForm((f) => ({ ...f, materials: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label">Homework / Assignment Reminder</label>
                    <input
                      className="input-field"
                      placeholder="e.g., Complete practice problems 1–10..."
                      value={form.homework_reminder}
                      onChange={(e) => setForm((f) => ({ ...f, homework_reminder: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (isNew ? 'Create Class' : 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
