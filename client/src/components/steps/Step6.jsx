import { useState, useEffect } from 'react';

export default function Step6({ data, classInfo, onChange, onNext, onBack }) {
  const [form, setForm] = useState({
    warmup_activity: data?.warmup_activity ?? classInfo?.warmup_activity ?? '',
    warmup_duration: data?.warmup_duration ?? classInfo?.warmup_duration ?? '',
    exit_ticket: data?.exit_ticket ?? classInfo?.exit_ticket ?? '',
    differentiation_notes: data?.differentiation_notes ?? classInfo?.differentiation_notes ?? '',
    materials: data?.materials ?? classInfo?.materials ?? '',
    homework_reminder: data?.homework_reminder ?? classInfo?.homework_reminder ?? '',
  });

  // Normalize nulls/undefined to empty strings
  useEffect(() => {
    const normalize = (v) => v == null ? '' : v;
    setForm({
      warmup_activity: normalize(data?.warmup_activity ?? classInfo?.warmup_activity),
      warmup_duration: normalize(data?.warmup_duration ?? classInfo?.warmup_duration),
      exit_ticket: normalize(data?.exit_ticket ?? classInfo?.exit_ticket),
      differentiation_notes: normalize(data?.differentiation_notes ?? classInfo?.differentiation_notes),
      materials: normalize(data?.materials ?? classInfo?.materials),
      homework_reminder: normalize(data?.homework_reminder ?? classInfo?.homework_reminder),
    });
  }, []);

  function handleChange(field, value) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  }

  const hasDefaults = classInfo && (
    classInfo.warmup_activity || classInfo.exit_ticket ||
    classInfo.differentiation_notes || classInfo.materials || classInfo.homework_reminder
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Lesson Details</h2>
        <p className="text-label text-sm">
          Optional fields that will appear in your exported lesson plan. Blank fields are excluded from the PDF.
        </p>
      </div>

      {hasDefaults && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-700">
          Fields pre-filled from your class defaults — edit freely for this lesson only.
        </div>
      )}

      {/* Warm-up */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-primary">Warm-Up Activity</h3>
        <div>
          <label className="label">Activity description</label>
          <textarea
            className="input-field min-h-[70px] resize-y"
            placeholder="e.g., Quick review of yesterday's vocabulary..."
            value={form.warmup_activity}
            onChange={(e) => handleChange('warmup_activity', e.target.value)}
            onBlur={() => onChange(form)}
          />
        </div>
        <div>
          <label className="label">Duration (minutes)</label>
          <div className="flex items-center gap-2">
            <input
              className="input-field w-24"
              type="number"
              min="1"
              max="60"
              placeholder="5"
              value={form.warmup_duration}
              onChange={(e) => handleChange('warmup_duration', e.target.value)}
              onBlur={() => onChange(form)}
            />
            <span className="text-label text-sm">minutes</span>
          </div>
        </div>
      </div>

      {/* Exit Ticket */}
      <div>
        <label className="label">Exit Ticket / Closing Routine</label>
        <textarea
          className="input-field min-h-[70px] resize-y"
          placeholder="e.g., Students write one thing they learned today..."
          value={form.exit_ticket}
          onChange={(e) => handleChange('exit_ticket', e.target.value)}
          onBlur={() => onChange(form)}
        />
      </div>

      {/* Differentiation */}
      <div>
        <label className="label">Differentiation Notes — ELL / IEP Accommodations</label>
        <textarea
          className="input-field min-h-[70px] resize-y"
          placeholder="e.g., Provide sentence frames for ELL students; allow extended time for IEP..."
          value={form.differentiation_notes}
          onChange={(e) => handleChange('differentiation_notes', e.target.value)}
          onBlur={() => onChange(form)}
        />
      </div>

      {/* Materials */}
      <div>
        <label className="label">Materials / Supplies Needed</label>
        <textarea
          className="input-field min-h-[70px] resize-y"
          placeholder="e.g., Whiteboard markers, printed worksheets, fraction tiles..."
          value={form.materials}
          onChange={(e) => handleChange('materials', e.target.value)}
          onBlur={() => onChange(form)}
        />
      </div>

      {/* Homework */}
      <div>
        <label className="label">Homework / Assignment Reminder</label>
        <input
          className="input-field"
          placeholder="e.g., Complete practice problems 1–10, due Friday..."
          value={form.homework_reminder}
          onChange={(e) => handleChange('homework_reminder', e.target.value)}
          onBlur={() => onChange(form)}
        />
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost">← Back</button>
        <button onClick={() => onNext(form)} className="btn-primary">
          Preview & Export →
        </button>
      </div>
    </div>
  );
}
