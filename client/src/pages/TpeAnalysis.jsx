import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../utils/api';
import { exportTpeToPDF } from '../utils/pdfExport';

// Hardcoded locally to avoid an extra fetch on first render
const TPE_SECTIONS = [
  { id: 1, title: "Engaging and Supporting All Students in Learning" },
  { id: 2, title: "Creating and Maintaining Effective Environments for Student Learning" },
  { id: 3, title: "Understanding and Organizing Subject Matter for Student Learning" },
  { id: 4, title: "Planning Instruction and Designing Learning Experiences for All Students" },
  { id: 5, title: "Assessing Student Learning" },
  { id: 6, title: "Developing as a Professional Educator" },
];

const GRADE_LEVELS = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade',
];

const SUBJECTS = [
  'English Language Arts', 'Mathematics', 'Science', 'History-Social Science',
  'Art', 'Music', 'Physical Education', 'Computer Science', 'Foreign Language', 'Other',
];

const COVERAGE_CONFIG = {
  strong: { label: 'Strong Evidence', color: 'text-primary', bg: 'bg-primary-light', border: 'border-green-200', dot: 'bg-primary' },
  partial: { label: 'Partial Evidence', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
  not_evident: { label: 'Not Evident', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-300' },
};

// ─── Step 1: Select TPEs ───────────────────────────────────────────────────────
function Step1({ selectedTpes, onToggle, onNext }) {
  const allSelected = selectedTpes.length === TPE_SECTIONS.length;

  function toggleAll() {
    if (allSelected) {
      TPE_SECTIONS.forEach((t) => selectedTpes.includes(t.id) && onToggle(t.id));
    } else {
      TPE_SECTIONS.forEach((t) => !selectedTpes.includes(t.id) && onToggle(t.id));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Select TPE Standards</h2>
        <p className="text-label text-sm">Choose which California TPEs to analyze your lesson against.</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-label">{selectedTpes.length} of {TPE_SECTIONS.length} selected</span>
        <button onClick={toggleAll} className="text-xs font-medium text-primary hover:text-primary-dark underline">
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="space-y-2">
        {TPE_SECTIONS.map((tpe) => {
          const isSelected = selectedTpes.includes(tpe.id);
          return (
            <button
              key={tpe.id}
              onClick={() => onToggle(tpe.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                isSelected
                  ? 'border-primary bg-primary-light ring-1 ring-primary'
                  : 'border-border bg-white hover:border-primary hover:bg-primary-light'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary">TPE {tpe.id}</span>
                  <p className="text-sm text-text-main">{tpe.title}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={selectedTpes.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Upload →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Upload Lesson ────────────────────────────────────────────────────
function Step2({ lessonTitle, setLessonTitle, grade, setGrade, subject, setSubject, lessonText, setLessonText, classes, onAnalyze, onBack, analyzing }) {
  const [activeTab, setActiveTab] = useState('paste');
  const [uploadFile, setUploadFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const fileRef = useRef(null);

  async function handleFilePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setParsing(true);
    setParseError('');
    try {
      const res = await api.parseDocument(file);
      setLessonText(res.text || '');
    } catch (err) {
      setParseError('Could not read file: ' + err.message);
    } finally {
      setParsing(false);
    }
  }

  function handleClassChange(classId) {
    if (!classId) return;
    const cls = classes.find((c) => String(c.id) === classId);
    if (cls) { setGrade(cls.grade || ''); setSubject(cls.subject || ''); }
  }

  const canAnalyze = lessonTitle.trim() && lessonText.trim() && grade && subject;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Upload Your Lesson</h2>
        <p className="text-label text-sm">Provide the lesson content to analyze against the selected TPEs.</p>
      </div>

      {/* Lesson info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Lesson Title *</label>
          <input
            className="input-field"
            placeholder="e.g., Introduction to Photosynthesis"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Class (auto-fills grade/subject)</label>
          <select className="input-field" onChange={(e) => handleClassChange(e.target.value)} defaultValue="">
            <option value="">Select a class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.teacher_name} — {c.grade} {c.subject}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Grade Level *</label>
          <select className="input-field" value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">Select grade…</option>
            {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Subject *</label>
          <select className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">Select subject…</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Input tabs */}
      <div>
        <div className="flex border-b border-border mb-4">
          {[
            { id: 'paste', label: 'Paste Text' },
            { id: 'pdf', label: 'Upload PDF' },
            { id: 'docx', label: 'Upload Word Doc' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-label hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'paste' && (
          <div>
            <label className="label">Lesson Content *</label>
            <textarea
              className="input-field min-h-[260px] resize-y leading-relaxed"
              placeholder="Paste your full lesson plan here…"
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
            />
            <p className="text-xs text-label mt-1">{lessonText.length} characters</p>
          </div>
        )}

        {(activeTab === 'pdf' || activeTab === 'docx') && (
          <div>
            <label className="label">
              {activeTab === 'pdf' ? 'PDF File' : 'Word Document (.docx)'}
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-light transition-colors"
            >
              {parsing ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-label">Extracting text…</p>
                </div>
              ) : uploadFile ? (
                <div>
                  <svg className="w-8 h-8 text-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-primary">{uploadFile.name}</p>
                  <p className="text-xs text-label mt-1">{lessonText.length} characters extracted. Click to change.</p>
                </div>
              ) : (
                <div>
                  <svg className="w-10 h-10 text-label mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-text-main">Click to upload</p>
                  <p className="text-xs text-label mt-1">{activeTab === 'pdf' ? '.pdf files' : '.docx files'} supported</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={activeTab === 'pdf' ? '.pdf' : '.docx'}
              className="hidden"
              onChange={handleFilePick}
            />
            {parseError && <p className="text-xs text-red-500 mt-2">{parseError}</p>}
            {lessonText && !parsing && (
              <div className="mt-3">
                <label className="label text-xs">Extracted Text Preview</label>
                <textarea
                  className="input-field min-h-[120px] resize-y text-xs"
                  value={lessonText}
                  onChange={(e) => setLessonText(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost">← Back</button>
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze || analyzing}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing…
            </>
          ) : 'Analyze TPEs →'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Report ───────────────────────────────────────────────────────────
function TpeResultSection({ result, tpeData }) {
  const [expanded, setExpanded] = useState(true);
  const config = COVERAGE_CONFIG[result.overall_coverage] || COVERAGE_CONFIG.not_evident;

  return (
    <div className={`border rounded-xl overflow-hidden ${config.border}`}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`w-full flex items-center justify-between px-5 py-4 ${config.bg} text-left`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${config.dot}`} />
          <div>
            <span className="font-semibold text-text-main text-sm">TPE {result.tpe_id}: {result.tpe_title}</span>
            <span className={`ml-2 text-xs font-medium ${config.color}`}>— {config.label}</span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-label flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="divide-y divide-border bg-white">
          {result.elements.map((el) => {
            const elConfig = COVERAGE_CONFIG[el.coverage] || COVERAGE_CONFIG.not_evident;
            return (
              <div key={el.element_id} className="px-5 py-4 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="badge-green flex-shrink-0 mt-0.5">{el.element_id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${elConfig.dot}`} />
                      <span className={`text-xs font-medium ${elConfig.color}`}>{elConfig.label}</span>
                    </div>

                    {el.evidence && el.evidence.length > 0 ? (
                      <div className="space-y-1.5 mb-2">
                        {el.evidence.map((quote, i) => (
                          <blockquote key={i} className={`text-xs italic px-3 py-2 rounded-lg border-l-2 border-primary ${elConfig.bg}`}>
                            "{quote}"
                          </blockquote>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-label italic mb-2">No clear evidence found in the lesson.</p>
                    )}

                    {el.strength && (
                      <div className="flex items-start gap-1.5 text-xs text-primary">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{el.strength}</span>
                      </div>
                    )}
                    {el.suggestion && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-700 mt-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{el.suggestion}</span>
                      </div>
                    )}
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

function Step3({ result, lessonTitle, grade, subject, user, classInfo, onExport, onReset }) {
  const { summary, tpe_results } = result;
  const pct = summary.percentage;
  const barColor = pct >= 70 ? '#1A7A55' : pct >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-1">TPE Analysis Report</h2>
          <p className="text-label text-sm">{lessonTitle} · {grade} · {subject}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onReset} className="btn-ghost text-sm py-2 px-3">New Analysis</button>
          <button onClick={onExport} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-text-main">Overall TPE Coverage</span>
          <span className="text-2xl font-bold" style={{ color: barColor }}>{pct}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full progress-fill transition-all duration-1000"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-xl font-bold text-primary">{summary.addressed}</p>
            <p className="text-xs text-label">Addressed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-400">{summary.total_elements - summary.addressed}</p>
            <p className="text-xs text-label">Not Evident</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-text-main">{summary.total_elements}</p>
            <p className="text-xs text-label">Total Elements</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-label pt-1 border-t border-border">
          {Object.entries(COVERAGE_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TPE results */}
      <div className="space-y-3">
        {tpe_results.map((r) => (
          <TpeResultSection key={r.tpe_id} result={r} />
        ))}
      </div>
    </div>
  );
}

// ─── Main TpeAnalysis component ───────────────────────────────────────────────
export default function TpeAnalysis({ user, onLogout }) {
  const [step, setStep] = useState(1);
  const [selectedTpes, setSelectedTpes] = useState([1, 2, 3, 4, 5, 6]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [classes, setClasses] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getClasses().then((r) => setClasses(r.classes || [])).catch(() => {});
  }, []);

  function toggleTpe(id) {
    setSelectedTpes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setError('');
    try {
      const res = await api.analyzeTpe({
        lesson_text: lessonText,
        lesson_title: lessonTitle,
        grade,
        subject,
        selected_tpes: selectedTpes,
      });
      setResult(res);
      setStep(3);
    } catch (err) {
      setError('Analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  function handleExport() {
    exportTpeToPDF({ result, lessonTitle, grade, subject, user });
  }

  function handleReset() {
    setStep(1);
    setSelectedTpes([1, 2, 3, 4, 5, 6]);
    setLessonTitle('');
    setGrade('');
    setSubject('');
    setLessonText('');
    setResult(null);
    setError('');
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-sm text-label hover:text-primary transition-colors">Dashboard</button>
            <button onClick={() => navigate('/tpe-explorer')} className="text-sm text-label hover:text-primary transition-colors">TPE Standards</button>
            <button onClick={onLogout} className="text-sm text-label hover:text-primary transition-colors">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Step indicator (steps 1–2, result is step 3) */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-8">
            {['Select Standards', 'Upload Lesson', 'Report'].map((label, i) => {
              const s = i + 1;
              const done = s < step;
              const active = s === step;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary-light' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : s}
                    </div>
                    <span className={`text-xs mt-1 font-medium hidden sm:block ${active ? 'text-primary' : done ? 'text-primary' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
          )}

          {step === 1 && (
            <Step1
              selectedTpes={selectedTpes}
              onToggle={toggleTpe}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <Step2
              lessonTitle={lessonTitle}
              setLessonTitle={setLessonTitle}
              grade={grade}
              setGrade={setGrade}
              subject={subject}
              setSubject={setSubject}
              lessonText={lessonText}
              setLessonText={setLessonText}
              classes={classes}
              onAnalyze={handleAnalyze}
              onBack={() => setStep(1)}
              analyzing={analyzing}
            />
          )}

          {step === 3 && result && (
            <Step3
              result={result}
              lessonTitle={lessonTitle}
              grade={grade}
              subject={subject}
              user={user}
              onExport={handleExport}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}
