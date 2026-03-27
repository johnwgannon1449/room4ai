import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const TPE_DESCRIPTIONS = {
  1: 'Know your students — leverage backgrounds, interests, and social-emotional needs to engage all learners',
  2: 'Build a safe, organized, inclusive classroom environment that supports all learners',
  3: 'Know your content deeply — organize and connect subject matter for student understanding',
  4: 'Plan purposeful, differentiated instruction aligned to standards and student needs',
  5: 'Assess student learning continuously and use data to adjust and improve instruction',
  6: 'Grow professionally — collaborate with colleagues, families, and the school community',
  7: 'Deliver evidence-based literacy instruction grounded in foundational skills and meaning-making',
};

export default function Step2({ data, lessonData, onChange, onNext, onBack }) {
  const [standards, setStandards] = useState([]);
  const [selected, setSelected] = useState(data?.selectedTpes || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTpeStandards()
      .then((res) => setStandards(res.standards || []))
      .catch(() => setError('Could not load TPE standards. Please try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  function toggleTpe(id) {
    const updated = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    setSelected(updated);
    notifyChange(updated);
  }

  function toggleAll() {
    const updated = selected.length === standards.length
      ? []
      : standards.map((s) => s.id);
    setSelected(updated);
    notifyChange(updated);
  }

  function notifyChange(ids) {
    const tpeData = standards
      .filter((s) => ids.includes(s.id))
      .map((s) => ({ id: s.id, title: s.title, elementCount: s.elements.length }));
    onChange({ selectedTpes: ids, selectedTpeData: tpeData });
  }

  const allSelected = standards.length > 0 && selected.length === standards.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Select TPE Focus</h2>
        <p className="text-label text-sm">
          Choose which Teaching Performance Expectations (TPEs) this lesson addresses
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-label">
          {selected.length} TPE{selected.length !== 1 ? 's' : ''} selected
        </span>
        {standards.length > 0 && (
          <button
            onClick={toggleAll}
            className="text-sm text-accent hover:text-amber-600 font-medium transition-colors"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-label">Loading TPE standards...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {standards.map((tpe) => {
            const isSelected = selected.includes(tpe.id);
            return (
              <button
                key={tpe.id}
                onClick={() => toggleTpe(tpe.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary-light ring-1 ring-primary'
                    : 'border-border bg-white hover:border-primary hover:bg-primary-light'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-primary">TPE {tpe.id}</span>
                      <span className="text-sm font-medium text-text-main">{tpe.title}</span>
                    </div>
                    <p className="text-xs text-label mt-0.5 leading-snug">{TPE_DESCRIPTIONS[tpe.id]}</p>
                    <p className="text-xs text-label mt-0.5">{tpe.elements.length} elements</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost">← Back</button>
        <button
          onClick={() => onNext({ selectedTpes: selected, selectedTpeData: standards.filter((s) => selected.includes(s.id)).map((s) => ({ id: s.id, title: s.title, elementCount: s.elements.length })) })}
          className="btn-primary"
          disabled={selected.length === 0}
        >
          Continue to Content →
        </button>
      </div>
    </div>
  );
}
