import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function Step2({ data, lessonData, onChange, onNext, onBack }) {
  const [standards, setStandards] = useState([]);
  const [selected, setSelected] = useState(data?.selectedStandards || []);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const grade = lessonData?.step1?.grade || '';
  const subject = lessonData?.step1?.subject || '';

  useEffect(() => {
    if (grade && subject) {
      loadStandards();
    }
  }, [grade, subject]);

  async function loadStandards() {
    setLoading(true);
    setError('');
    try {
      const res = await api.getStandards(grade, subject);
      setStandards(res.standards || []);
    } catch (err) {
      setError('Could not load standards. Using defaults.');
      setStandards([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleStandard(standard) {
    const isSelected = selected.some((s) => s.code === standard.code);
    const updated = isSelected
      ? selected.filter((s) => s.code !== standard.code)
      : [...selected, standard];
    setSelected(updated);
    onChange({ selectedStandards: updated });
  }

  function selectAll() {
    const filtered = filteredStandards;
    const allSelected = filtered.every((s) => selected.some((sel) => sel.code === s.code));
    if (allSelected) {
      const updated = selected.filter((s) => !filtered.some((f) => f.code === s.code));
      setSelected(updated);
      onChange({ selectedStandards: updated });
    } else {
      const toAdd = filtered.filter((s) => !selected.some((sel) => sel.code === s.code));
      const updated = [...selected, ...toAdd];
      setSelected(updated);
      onChange({ selectedStandards: updated });
    }
  }

  const filteredStandards = standards.filter((s) => {
    const q = search.toLowerCase();
    return s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">California Standards</h2>
        <p className="text-label text-sm">
          Select the standards this lesson addresses — {grade}, {subject}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="input-field pl-10"
          placeholder="Search standards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Selected count + select all */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-label">
          {selected.length} standard{selected.length !== 1 ? 's' : ''} selected
        </span>
        {standards.length > 0 && (
          <button
            onClick={selectAll}
            className="text-sm text-accent hover:text-amber-600 font-medium transition-colors"
          >
            {filteredStandards.every((s) => selected.some((sel) => sel.code === s.code))
              ? 'Deselect All'
              : 'Select All'}
          </button>
        )}
      </div>

      {/* Standards list */}
      {loading ? (
        <div className="text-center py-8 text-label">Loading standards...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      ) : filteredStandards.length === 0 ? (
        <div className="text-center py-8 text-label text-sm">
          {search ? 'No standards match your search.' : 'No standards available for this grade/subject combination.'}
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredStandards.map((standard) => {
            const isSelected = selected.some((s) => s.code === standard.code);
            return (
              <button
                key={standard.code}
                onClick={() => toggleStandard(standard)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-accent bg-amber-50 ring-1 ring-accent'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-accent border-accent' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-primary">{standard.code}</div>
                    <div className="text-sm text-text-main mt-0.5 leading-snug">{standard.description}</div>
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
          onClick={() => onNext({ selectedStandards: selected })}
          className="btn-primary"
          disabled={selected.length === 0}
        >
          Continue to Content →
        </button>
      </div>
    </div>
  );
}
