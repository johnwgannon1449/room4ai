import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function Step4({ data, lessonId, lessonData, onChange, onNext, onBack }) {
  const [analysis, setAnalysis] = useState(data?.analysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!analysis) {
      runAnalysis();
    }
  }, []);

  async function runAnalysis() {
    const standards = lessonData?.step2?.selectedStandards || [];
    const content = lessonData?.step3?.content || '';
    const objectives = lessonData?.step1?.objectives || '';

    if (!content || !standards.length) {
      setError('Missing lesson content or standards. Please go back and complete previous steps.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.analyzeLesson(lessonId, {
        lessonContent: content,
        standards,
        objectives,
      });
      setAnalysis(res.analysis);
      onChange({ analysis: res.analysis });
    } catch (err) {
      setError('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Coverage Report</h2>
        <p className="text-label text-sm">AI analysis of your lesson against selected standards</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-medium text-primary">Analyzing your lesson...</p>
            <p className="text-label text-sm mt-1">Checking against California standards</p>
          </div>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
          <button onClick={runAnalysis} className="btn-secondary">Try Again</button>
        </div>
      ) : analysis ? (
        <div className="space-y-5">
          {/* Coverage score */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-primary">Overall Coverage</span>
              <span className={`text-2xl font-bold ${
                analysis.coveragePercent >= 75 ? 'text-progress-green' :
                analysis.coveragePercent >= 50 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {analysis.coveragePercent}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${analysis.coveragePercent}%`,
                  backgroundColor: analysis.coveragePercent >= 75 ? '#22C55E' : analysis.coveragePercent >= 50 ? '#F59E0B' : '#EF4444',
                }}
              />
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths?.length > 0 && (
            <div>
              <h3 className="font-semibold text-primary mb-2">Strengths</h3>
              <ul className="space-y-1.5">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-progress-green mt-0.5 flex-shrink-0">✓</span>
                    <span>{s.replace(/^✓\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {analysis.gaps?.length > 0 && (
            <div>
              <h3 className="font-semibold text-primary mb-2">Areas to Improve</h3>
              <ul className="space-y-1.5">
                {analysis.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                    <span>{g.replace(/^✗\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          {analysis.recommendation && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900">
                {analysis.recommendation.replace(/^→\s*/, '→ ')}
              </p>
            </div>
          )}

          <button
            onClick={runAnalysis}
            className="text-sm text-label hover:text-primary transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-analyze
          </button>
        </div>
      ) : null}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost">← Back</button>
        {(analysis || error) && (
          <button
            onClick={() => onNext({ analysis })}
            className="btn-primary"
          >
            View Coverage Bar →
          </button>
        )}
      </div>
    </div>
  );
}
