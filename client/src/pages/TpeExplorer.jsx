import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../utils/api';

const GRADE_LEVELS = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade',
];

const SUBJECTS = [
  'English Language Arts', 'Mathematics', 'Science', 'History-Social Science',
  'Art', 'Music', 'Physical Education', 'Computer Science', 'Foreign Language', 'Other',
];

function ActionsList({ elementId, elementText, grade, subject, actionsCache, onCached }) {
  const cacheKey = elementId;
  const cached = actionsCache[cacheKey];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shown, setShown] = useState(!!cached);

  async function fetchActions() {
    if (cached) { setShown(true); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.getTpeActions({ element_id: elementId, element_text: elementText, grade, subject });
      onCached(cacheKey, res.actions || []);
      setShown(true);
    } catch (err) {
      setError('Could not load actions. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!shown && !loading) {
    return (
      <button
        onClick={fetchActions}
        className="text-xs font-medium text-primary hover:text-primary-dark border border-primary px-2.5 py-1 rounded-lg transition-colors hover:bg-primary-light"
      >
        Show Actions
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-label mt-2">
        <div className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin" />
        Generating actions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-500 mt-2">
        {error} <button onClick={fetchActions} className="underline">Retry</button>
      </div>
    );
  }

  const actions = actionsCache[cacheKey] || [];
  return (
    <div className="mt-3 bg-primary-light border border-green-200 rounded-lg p-3">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Classroom Actions</p>
      <ul className="space-y-1.5">
        {actions.map((action, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
            <span className="text-xs text-text-main leading-relaxed">{action}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setShown(false)}
        className="text-xs text-label hover:text-primary mt-2 transition-colors"
      >
        Hide actions
      </button>
    </div>
  );
}

function TpeSection({ tpe, grade, subject, actionsCache, onCached }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedElements, setExpandedElements] = useState({});

  function toggleElement(id) {
    setExpandedElements((e) => ({ ...e, [id]: !e[id] }));
  }

  const PREVIEW_LEN = 120;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-primary-light transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
            {tpe.id}
          </span>
          <div>
            <span className="font-semibold text-text-main text-sm">TPE {tpe.id}:</span>{' '}
            <span className="text-sm text-text-main">{tpe.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-label">{tpe.elements.length} elements</span>
          <svg
            className={`w-4 h-4 text-label transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-border bg-white">
          {tpe.elements.map((el) => {
            const isExpanded = expandedElements[el.id];
            const preview = el.text.length > PREVIEW_LEN ? el.text.slice(0, PREVIEW_LEN) + '…' : el.text;

            return (
              <div key={el.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="badge-green flex-shrink-0 mt-0.5">{el.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-main leading-relaxed">
                      {isExpanded ? el.text : preview}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {el.text.length > PREVIEW_LEN && (
                        <button
                          onClick={() => toggleElement(el.id)}
                          className="text-xs text-label hover:text-primary transition-colors underline"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      )}
                      <ActionsList
                        elementId={el.id}
                        elementText={el.text}
                        grade={grade}
                        subject={subject}
                        actionsCache={actionsCache}
                        onCached={onCached}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TpeExplorer({ user, onLogout }) {
  const [standards, setStandards] = useState([]);
  const [loadingStandards, setLoadingStandards] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [actionsCache, setActionsCache] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getTpeStandards(),
      api.getClasses(),
    ]).then(([tpeRes, classRes]) => {
      setStandards(tpeRes.standards || []);
      setClasses(classRes.classes || []);
    }).catch(() => {}).finally(() => setLoadingStandards(false));
  }, []);

  function handleClassChange(classId) {
    setSelectedClass(classId);
    if (classId) {
      const cls = classes.find((c) => String(c.id) === classId);
      if (cls) { setGrade(cls.grade || ''); setSubject(cls.subject || ''); }
    }
  }

  function handleCacheAction(key, actions) {
    setActionsCache((c) => ({ ...c, [key]: actions }));
  }

  const contextReady = !!(grade && subject);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-sm text-label hover:text-primary transition-colors">Dashboard</button>
            <button onClick={() => navigate('/tpe-analysis')} className="text-sm text-label hover:text-primary transition-colors">TPE Analysis</button>
            <button onClick={onLogout} className="text-sm text-label hover:text-primary transition-colors">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">TPE Standards Explorer</h1>
          <p className="text-label text-sm mt-1">Browse California Teaching Performance Expectations and get AI-powered classroom actions.</p>
        </div>

        {/* Context selector */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-primary">Set Grade & Subject Context</h2>
          <p className="text-xs text-label -mt-2">Actions will be tailored to your class context. You can browse standards without selecting.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Your Class (optional)</label>
              <select
                className="input-field"
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                <option value="">Select a class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.teacher_name} — {c.grade} {c.subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Grade Level</label>
              <select
                className="input-field"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">Select grade…</option>
                {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject</label>
              <select
                className="input-field"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">Select subject…</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {contextReady && (
            <div className="flex items-center gap-2 bg-primary-light border border-green-200 rounded-lg px-3 py-2 text-xs text-primary">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Actions will be tailored for <strong className="ml-1">{grade} · {subject}</strong>
            </div>
          )}
        </div>

        {/* Standards */}
        {loadingStandards ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {standards.map((tpe) => (
              <TpeSection
                key={tpe.id}
                tpe={tpe}
                grade={grade}
                subject={subject}
                actionsCache={actionsCache}
                onCached={handleCacheAction}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
