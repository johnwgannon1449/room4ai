import { useState } from 'react';

export default function Step5({ data, lessonData, onChange, onNext, onBack }) {
  const standards = lessonData?.step2?.selectedStandards || [];
  const analysis = lessonData?.step4?.analysis;

  // Build initial coverage map from AI analysis
  const buildInitialCoverage = () => {
    if (!analysis?.standardsCoverage) {
      return standards.reduce((acc, s) => ({ ...acc, [s.code]: false }), {});
    }
    const map = {};
    analysis.standardsCoverage.forEach((sc) => {
      map[sc.code] = sc.covered;
    });
    // Fill any missing
    standards.forEach((s) => {
      if (map[s.code] === undefined) map[s.code] = false;
    });
    return map;
  };

  const [coverageMap, setCoverageMap] = useState(data?.coverageMap || buildInitialCoverage());

  const coveredCount = Object.values(coverageMap).filter(Boolean).length;
  const totalCount = standards.length || 1;
  const coveragePercent = Math.round((coveredCount / totalCount) * 100);

  function toggleCoverage(code) {
    const updated = { ...coverageMap, [code]: !coverageMap[code] };
    setCoverageMap(updated);
    onChange({ coverageMap: updated, coveragePercent: Math.round((Object.values(updated).filter(Boolean).length / totalCount) * 100) });
  }

  const getReasonForCode = (code) => {
    if (!analysis?.standardsCoverage) return '';
    const found = analysis.standardsCoverage.find((s) => s.code === code);
    return found?.reason || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Standards Coverage</h2>
        <p className="text-label text-sm">Review and adjust which standards your lesson covers</p>
      </div>

      {/* Coverage bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-primary">Coverage</span>
          <span className={`font-bold text-lg ${
            coveragePercent >= 75 ? 'text-progress-green' :
            coveragePercent >= 50 ? 'text-amber-500' : 'text-red-500'
          }`}>
            {coveragePercent}%
          </span>
        </div>
        <div className="relative w-full h-3.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${coveragePercent}%`,
              backgroundColor: coveragePercent >= 75 ? '#22C55E' : coveragePercent >= 50 ? '#F59E0B' : '#EF4444',
            }}
          />
          {coveragePercent > 5 && (
            <span
              className="absolute inset-y-0 flex items-center text-xs font-bold text-white pl-2"
              style={{ left: `${Math.min(coveragePercent, 90)}%`, transform: coveragePercent > 15 ? 'translateX(-100%)' : 'translateX(2px)' }}
            >
              {coveragePercent > 10 ? `${coveragePercent}%` : ''}
            </span>
          )}
        </div>
        <p className="text-xs text-label">{coveredCount} of {totalCount} standards covered</p>
      </div>

      {/* Standards breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary text-sm">Standard-by-Standard Breakdown</h3>
          <span className="text-xs text-label">Click to toggle coverage</span>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {standards.map((standard) => {
            const covered = coverageMap[standard.code] || false;
            const reason = getReasonForCode(standard.code);
            return (
              <button
                key={standard.code}
                onClick={() => toggleCoverage(standard.code)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  covered
                    ? 'border-progress-green bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                    covered ? 'bg-progress-green border-progress-green' : 'border-gray-300'
                  }`}>
                    {covered && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-primary">{standard.code}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${covered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {covered ? 'Covered' : 'Not Covered'}
                      </span>
                    </div>
                    <p className="text-xs text-text-main mt-0.5 leading-snug">{standard.description}</p>
                    {reason && <p className="text-xs text-label mt-1 italic">{reason}</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost">← Back</button>
        <button
          onClick={() => onNext({ coverageMap, coveragePercent })}
          className="btn-primary"
        >
          Edit Lesson →
        </button>
      </div>
    </div>
  );
}
