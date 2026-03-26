import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const TYPE_COLORS = {
  Adaptation: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  'Add-on': { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  'New Section': { bg: 'bg-primary-light', border: 'border-green-200', badge: 'bg-green-100 text-primary', dot: 'bg-primary' },
};

function MiniLessonSuggestions({ standard, lessonContent, grade, subject, onAddToLesson }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState({});

  async function fetchSuggestions() {
    setLoading(true);
    setError('');
    try {
      const res = await api.suggestCoverage({
        missedStandards: [standard],
        lessonContent: lessonContent || '',
        grade,
        subject,
      });
      setSuggestions(res.suggestions || []);
    } catch (err) {
      setError('Could not load suggestions. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(suggestion, idx) {
    const mins = suggestion.estimated_minutes ? ` (${suggestion.estimated_minutes} min)` : '';
    const text = `\n\n**[${suggestion.type}] ${suggestion.title}**${mins}\n${suggestion.description}`;
    onAddToLesson(text);
    setAdded((a) => ({ ...a, [idx]: true }));
  }

  return (
    <div className="mt-2 border border-border bg-background rounded-lg p-3">
      {!suggestions && !loading && (
        <button
          onClick={fetchSuggestions}
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a3.03 3.03 0 00-.67 2.01V17a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.38a3.037 3.037 0 00-.67-2.012l-.344-.345z" />
          </svg>
          Get AI coverage suggestions
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-label">
          <div className="w-3 h-3 border-2 border-green-200 border-t-primary rounded-full animate-spin" />
          Generating suggestions...
        </div>
      )}

      {error && (
        <div className="text-xs text-red-500 flex items-center gap-2">
          {error}
          <button onClick={fetchSuggestions} className="underline hover:no-underline">Retry</button>
        </div>
      )}

      {suggestions && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-label uppercase tracking-wide mb-2">Coverage suggestions</p>
          {suggestions.map((s, idx) => {
            const colors = TYPE_COLORS[s.type] || TYPE_COLORS['Add-on'];
            return (
              <div key={idx} className={`border rounded-lg p-3 ${colors.bg} ${colors.border}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${colors.badge}`}>{s.type}</span>
                      <span className="text-sm font-semibold text-text-main">{s.title}</span>
                      {s.estimated_minutes && (
                        <span className="text-xs text-label">{s.estimated_minutes} min</span>
                      )}
                    </div>
                    <p className="text-xs text-text-main mt-1.5 leading-relaxed">{s.description}</p>
                  </div>
                  <button
                    onClick={() => handleAdd(s, idx)}
                    disabled={added[idx]}
                    className={`text-xs px-2 py-1.5 rounded flex-shrink-0 font-medium transition-all ${
                      added[idx]
                        ? 'bg-green-100 text-primary cursor-default'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {added[idx] ? '✓ Added' : 'Add'}
                  </button>
                </div>
              </div>
            );
          })}
          <button
            onClick={fetchSuggestions}
            className="text-xs text-label hover:text-primary transition-colors"
          >
            Regenerate suggestions
          </button>
        </div>
      )}
    </div>
  );
}

export default function Step5({ data, lessonData, onChange, onNext, onBack }) {
  const standards = lessonData?.step2?.selectedStandards || [];
  const analysis = lessonData?.step4?.analysis;
  const originalContent = lessonData?.step3?.content || '';
  const grade = lessonData?.step1?.grade || '';
  const subject = lessonData?.step1?.subject || '';

  // Coverage map
  const buildInitialCoverage = () => {
    if (!analysis?.standardsCoverage) {
      return standards.reduce((acc, s) => ({ ...acc, [s.code]: false }), {});
    }
    const map = {};
    analysis.standardsCoverage.forEach((sc) => { map[sc.code] = sc.covered; });
    standards.forEach((s) => { if (map[s.code] === undefined) map[s.code] = false; });
    return map;
  };

  const [coverageMap, setCoverageMap] = useState(data?.coverageMap || buildInitialCoverage());
  const [editedContent, setEditedContent] = useState(data?.editedContent || originalContent);
  const [expandedSuggestions, setExpandedSuggestions] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [lostStandards, setLostStandards] = useState([]);

  const coveredCount = Object.values(coverageMap).filter(Boolean).length;
  const totalCount = standards.length || 1;
  const coveragePercent = Math.round((coveredCount / totalCount) * 100);

  function toggleCoverage(code) {
    const updated = { ...coverageMap, [code]: !coverageMap[code] };
    setCoverageMap(updated);
    onChange({
      coverageMap: updated,
      coveragePercent: Math.round((Object.values(updated).filter(Boolean).length / totalCount) * 100),
      editedContent,
    });
  }

  function handleContentChange(val) {
    setEditedContent(val);
    onChange({ coverageMap, coveragePercent, editedContent: val });
  }

  function handleAddToLesson(text) {
    const updated = editedContent + text;
    setEditedContent(updated);
    onChange({ coverageMap, coveragePercent, editedContent: updated });
  }

  function handleContinue() {
    const coveredStandards = standards.filter((s) => coverageMap[s.code]);
    const contentLower = editedContent.toLowerCase();
    const lost = coveredStandards.filter((s) => {
      if (editedContent === originalContent) return false;
      const descWords = s.description.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      return descWords.length > 0 && descWords.filter((w) => contentLower.includes(w)).length === 0;
    });

    if (lost.length > 0) {
      setLostStandards(lost);
      setShowWarning(true);
    } else {
      onNext({ coverageMap, coveragePercent, editedContent });
    }
  }

  const getReasonForCode = (code) => {
    if (!analysis?.standardsCoverage) return '';
    return analysis.standardsCoverage.find((s) => s.code === code)?.reason || '';
  };

  const missedStandards = standards.filter((s) => !coverageMap[s.code]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Content Review</h2>
        <p className="text-label text-sm">Review coverage, address gaps, and refine your lesson</p>
      </div>

      {/* Coverage bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">Standards Coverage</span>
          <span className={`text-xl font-bold ${
            coveragePercent >= 75 ? 'text-progress-green' :
            coveragePercent >= 50 ? 'text-amber-500' : 'text-red-500'
          }`}>{coveragePercent}%</span>
        </div>
        <div className="relative w-full h-3.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${coveragePercent}%`,
              backgroundColor: coveragePercent >= 75 ? '#22C55E' : coveragePercent >= 50 ? '#F59E0B' : '#EF4444',
            }}
          />
        </div>
        <p className="text-xs text-label">{coveredCount} of {totalCount} standards covered · Click any standard to toggle</p>
      </div>

      {/* Standards list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {standards.map((standard) => {
          const covered = coverageMap[standard.code] || false;
          const reason = getReasonForCode(standard.code);
          const showSuggestions = expandedSuggestions[standard.code];

          return (
            <div key={standard.code} className={`rounded-lg border transition-all duration-200 ${
              covered ? 'border-progress-green bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-start gap-3 p-3">
                <button
                  onClick={() => toggleCoverage(standard.code)}
                  className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                    covered ? 'bg-progress-green border-progress-green' : 'border-red-400 bg-white'
                  }`}
                >
                  {covered ? (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-primary">{standard.code}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      covered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {covered ? 'Covered' : 'Not Covered'}
                    </span>
                    {!covered && (
                      <button
                        onClick={() => setExpandedSuggestions((e) => ({ ...e, [standard.code]: !e[standard.code] }))}
                        className="text-xs font-semibold text-accent hover:text-amber-600 transition-colors border border-accent px-2 py-0.5 rounded hover:bg-amber-50"
                      >
                        {showSuggestions ? '− Hide' : '+ Lessons'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-text-main mt-0.5 leading-snug">{standard.description}</p>
                  {reason && <p className="text-xs text-label mt-0.5 italic">{reason}</p>}
                </div>
              </div>

              {showSuggestions && !covered && (
                <div className="px-3 pb-3">
                  <MiniLessonSuggestions
                    standard={standard}
                    lessonContent={editedContent}
                    grade={grade}
                    subject={subject}
                    onAddToLesson={handleAddToLesson}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-border pt-4">
        <label className="label text-base mb-2">Lesson Content</label>
        <textarea
          className="input-field min-h-[280px] resize-y leading-relaxed"
          value={editedContent}
          onChange={(e) => handleContentChange(e.target.value)}
          onBlur={() => onChange({ coverageMap, coveragePercent, editedContent })}
          placeholder="Your lesson content..."
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{editedContent.length} characters</span>
          {editedContent !== originalContent && (
            <button
              onClick={() => handleContentChange(originalContent)}
              className="text-xs text-label hover:text-red-500 transition-colors"
            >
              Reset to original
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost">← Back</button>
        <button onClick={handleContinue} className="btn-primary">
          Lesson Details →
        </button>
      </div>

      {/* Coverage Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-primary text-lg">Coverage Warning</h3>
                <p className="text-sm text-text-main mt-1">
                  Your edits may have reduced coverage for:{' '}
                  <span className="font-medium text-accent">
                    {lostStandards.map((s) => s.code).join(', ')}
                  </span>. Continue anyway?
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowWarning(false)} className="btn-secondary flex-1">
                Go Back
              </button>
              <button
                onClick={() => { setShowWarning(false); onNext({ coverageMap, coveragePercent, editedContent }); }}
                className="btn-primary flex-1"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
