import { useState } from 'react';
import { api } from '../../utils/api';

const COVERAGE_CONFIG = {
  strong:      { label: 'Covered',  bg: 'bg-green-50',  border: 'border-progress-green', badge: 'bg-green-100 text-green-700', dot: 'bg-progress-green' },
  partial:     { label: 'Partial',  bg: 'bg-amber-50',  border: 'border-amber-300',      badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  not_evident: { label: 'Not Covered', bg: 'bg-red-50', border: 'border-red-200',        badge: 'bg-red-100 text-red-600',    dot: 'bg-red-400' },
};

function TpeElementSuggestions({ element, lessonContent, grade, subject, onAddToLesson }) {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState({});

  async function fetchActions() {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTpeActions({
        element_id: element.element_id,
        element_text: element.text,
        grade,
        subject,
      });
      setActions(res.actions || []);
    } catch (err) {
      setError('Could not load suggestions. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(action, idx) {
    const text = `\n\n**[TPE ${element.element_id}]** ${action}`;
    onAddToLesson(text);
    setAdded((a) => ({ ...a, [idx]: true }));
  }

  return (
    <div className="mt-2 border border-border bg-background rounded-lg p-3">
      {!actions && !loading && (
        <button
          onClick={fetchActions}
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.346a3.03 3.03 0 00-.67 2.01V17a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.38a3.037 3.037 0 00-.67-2.012l-.344-.345z" />
          </svg>
          Get classroom activity ideas
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-label">
          <div className="w-3 h-3 border-2 border-green-200 border-t-primary rounded-full animate-spin" />
          Generating ideas...
        </div>
      )}

      {error && (
        <div className="text-xs text-red-500 flex items-center gap-2">
          {error}
          <button onClick={fetchActions} className="underline hover:no-underline">Retry</button>
        </div>
      )}

      {actions && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-label uppercase tracking-wide mb-2">Classroom activity ideas</p>
          {actions.map((action, idx) => (
            <div key={idx} className="border rounded-lg p-3 bg-primary-light border-green-200">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-text-main flex-1 leading-snug">{action}</p>
                <button
                  onClick={() => handleAdd(action, idx)}
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
          ))}
          <button
            onClick={fetchActions}
            className="text-xs text-label hover:text-primary transition-colors"
          >
            Regenerate ideas
          </button>
        </div>
      )}
    </div>
  );
}

export default function Step5({ data, lessonData, onChange, onNext, onBack }) {
  const tpeResults = lessonData?.step4?.analysis?.tpeResults || [];
  const originalContent = lessonData?.step3?.content || '';
  const grade = lessonData?.step1?.grade || '';
  const subject = lessonData?.step1?.subject || '';

  // Flatten all elements from all TPE results for the coverage list
  const allElements = tpeResults.flatMap((tpe) =>
    (tpe.elements || []).map((el) => ({
      ...el,
      tpe_id: tpe.tpe_id,
      tpe_title: tpe.tpe_title,
    }))
  );

  // Build initial coverage map from AI results
  function buildInitialCoverage() {
    const map = {};
    allElements.forEach((el) => { map[el.element_id] = el.coverage || 'not_evident'; });
    return map;
  }

  const [coverageMap, setCoverageMap] = useState(data?.coverageMap || buildInitialCoverage());
  const [editedContent, setEditedContent] = useState(data?.editedContent || originalContent);
  const [expandedSuggestions, setExpandedSuggestions] = useState({});

  const coveredCount = Object.values(coverageMap).filter((v) => v === 'strong' || v === 'partial').length;
  const totalCount = allElements.length || 1;
  const coveragePercent = Math.round((coveredCount / totalCount) * 100);

  function toggleCoverage(elementId) {
    const current = coverageMap[elementId] || 'not_evident';
    const next = (current === 'strong' || current === 'partial') ? 'not_evident' : 'strong';
    const updated = { ...coverageMap, [elementId]: next };
    setCoverageMap(updated);
    const covered = Object.values(updated).filter((v) => v === 'strong' || v === 'partial').length;
    const pct = Math.round((covered / totalCount) * 100);
    onChange({ coverageMap: updated, coveragePercent: pct, editedContent });
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
    onNext({ coverageMap, coveragePercent, editedContent });
  }

  if (allElements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-1">Content Review</h2>
          <p className="text-label text-sm">Review coverage, address gaps, and refine your lesson</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          No TPE analysis results yet. Please go back and run the analysis in the Coverage Report step.
        </div>
        <div className="flex justify-between pt-2">
          <button onClick={onBack} className="btn-ghost">← Back</button>
        </div>
      </div>
    );
  }

  // Group elements by TPE for display
  const groupedByTpe = tpeResults.map((tpe) => ({
    ...tpe,
    elements: (tpe.elements || []).map((el) => ({
      ...el,
      currentCoverage: coverageMap[el.element_id] || 'not_evident',
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Content Review</h2>
        <p className="text-label text-sm">Review TPE coverage, address gaps, and refine your lesson</p>
      </div>

      {/* Coverage bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">TPE Coverage</span>
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
        <p className="text-xs text-label">{coveredCount} of {totalCount} elements addressed · Click any element to toggle</p>
      </div>

      {/* TPE elements grouped by domain */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {groupedByTpe.map((tpe) => (
          <div key={tpe.tpe_id}>
            <p className="text-xs font-semibold text-label uppercase tracking-wide mb-1.5">
              TPE {tpe.tpe_id}: {tpe.tpe_title}
            </p>
            <div className="space-y-1.5">
              {tpe.elements.map((el) => {
                const cfg = COVERAGE_CONFIG[el.currentCoverage] || COVERAGE_CONFIG.not_evident;
                const showSuggestions = expandedSuggestions[el.element_id];
                const isMissed = el.currentCoverage === 'not_evident' || el.currentCoverage === 'partial';

                return (
                  <div key={el.element_id} className={`rounded-lg border transition-all duration-200 ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start gap-3 p-3">
                      <button
                        onClick={() => toggleCoverage(el.element_id)}
                        className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                          !isMissed
                            ? 'bg-progress-green border-progress-green'
                            : el.currentCoverage === 'partial'
                            ? 'bg-amber-400 border-amber-400'
                            : 'border-red-400 bg-white'
                        }`}
                      >
                        {!isMissed ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : el.currentCoverage === 'partial' ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-primary">{el.element_id}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          {isMissed && (
                            <button
                              onClick={() => setExpandedSuggestions((e) => ({ ...e, [el.element_id]: !e[el.element_id] }))}
                              className="text-xs font-semibold text-accent hover:text-amber-600 transition-colors border border-accent px-2 py-0.5 rounded hover:bg-amber-50"
                            >
                              {showSuggestions ? '− Hide' : '+ Lessons'}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-text-main mt-0.5 leading-snug line-clamp-2">{el.text}</p>
                        {el.evidence?.length > 0 && (
                          <p className="text-xs text-label mt-0.5 italic line-clamp-1">"{el.evidence[0]}"</p>
                        )}
                      </div>
                    </div>

                    {showSuggestions && isMissed && (
                      <div className="px-3 pb-3">
                        <TpeElementSuggestions
                          element={el}
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
          </div>
        ))}
      </div>

      {/* Content editor */}
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
    </div>
  );
}
