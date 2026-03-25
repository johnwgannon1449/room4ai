import { useState } from 'react';

export default function Step6({ data, lessonData, onChange, onNext, onBack }) {
  const originalContent = lessonData?.step3?.content || '';
  const [editedContent, setEditedContent] = useState(data?.editedContent || originalContent);
  const [showWarning, setShowWarning] = useState(false);
  const [lostStandards, setLostStandards] = useState([]);

  const standards = lessonData?.step2?.selectedStandards || [];
  const coverageMap = lessonData?.step5?.coverageMap || {};
  const coveredStandards = standards.filter((s) => coverageMap[s.code]);

  function handleChange(val) {
    setEditedContent(val);
    onChange({ editedContent: val });
  }

  function handleContinue() {
    // Check for potential coverage loss
    const lost = coveredStandards.filter((s) => {
      const codeWords = s.code.toLowerCase().split(/[.\-_]/);
      const descWords = s.description.toLowerCase().split(/\s+/).slice(0, 5);
      const contentLower = editedContent.toLowerCase();
      // Heuristic: check if key topic words are missing from edited content
      const keywordHits = descWords.filter((w) => w.length > 4 && contentLower.includes(w));
      return keywordHits.length === 0;
    });

    if (lost.length > 0 && editedContent !== originalContent) {
      setLostStandards(lost);
      setShowWarning(true);
    } else {
      onNext({ editedContent });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Lesson Editor</h2>
        <p className="text-label text-sm">Refine your lesson content before exporting</p>
      </div>

      {/* Editor */}
      <div>
        <label className="label">Lesson Content</label>
        <textarea
          className="input-field min-h-[360px] resize-y font-sans text-base leading-relaxed"
          value={editedContent}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => onChange({ editedContent })}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-label">{editedContent.length} characters</span>
          {editedContent !== originalContent && (
            <button
              onClick={() => { setEditedContent(originalContent); onChange({ editedContent: originalContent }); }}
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
          Continue to Export →
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
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWarning(false)}
                className="btn-secondary flex-1"
              >
                Go Back
              </button>
              <button
                onClick={() => { setShowWarning(false); onNext({ editedContent }); }}
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
