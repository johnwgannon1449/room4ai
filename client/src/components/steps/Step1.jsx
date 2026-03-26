import { useState, useEffect } from 'react';

const GRADE_LEVELS = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade',
];

const SUBJECTS = [
  'English Language Arts', 'Mathematics', 'Science', 'History-Social Science',
  'Art', 'Music', 'Physical Education', 'Computer Science', 'Foreign Language', 'Other',
];

export default function Step1({ data, classInfo, onChange, onNext }) {
  // If launched from a class tile, grade/subject/teacher are already known
  const hasClassContext = !!(classInfo?.grade && classInfo?.subject);
  const hasDefaultDuration = classInfo?.default_duration != null;

  const [form, setForm] = useState({
    title: data?.title || '',
    grade: data?.grade || classInfo?.grade || '',
    subject: data?.subject || classInfo?.subject || '',
    objectives: data?.objectives || '',
    duration: data?.duration || (hasDefaultDuration ? String(classInfo.default_duration) : ''),
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        grade: data.grade || classInfo?.grade || '',
        subject: data.subject || classInfo?.subject || '',
        objectives: data.objectives || '',
        duration: data.duration || (hasDefaultDuration ? String(classInfo.default_duration) : ''),
      });
    }
  }, []);

  function handleChange(field, value) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Lesson title is required';
    // When class context is present, grade/subject come from classInfo (selects are hidden)
    const effectiveGrade = form.grade || classInfo?.grade || '';
    const effectiveSubject = form.subject || classInfo?.subject || '';
    if (!effectiveGrade) e.grade = 'Grade level is required';
    if (!effectiveSubject) e.subject = 'Subject is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) {
      onNext({
        ...form,
        grade: form.grade || classInfo?.grade || '',
        subject: form.subject || classInfo?.subject || '',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Lesson Basics</h2>
        <p className="text-label text-sm">
          {hasClassContext
            ? `For ${classInfo.grade} · ${classInfo.subject}`
            : 'Tell us about your lesson plan'}
        </p>
      </div>

      {/* If class context, show a subtle info strip */}
      {hasClassContext && (
        <div className="flex items-center gap-2 bg-primary-light border border-green-200 rounded-lg px-4 py-2.5">
          <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-primary">
            Class: <strong>{classInfo.teacher_name}</strong> · {classInfo.grade} · {classInfo.subject}
          </span>
        </div>
      )}

      <div>
        <label className="label">Lesson Title *</label>
        <input
          className={`input-field ${errors.title ? 'border-red-400 ring-1 ring-red-400' : ''}`}
          placeholder="e.g., Introduction to Fractions"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => onChange(form)}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* Grade + Subject — only show if no class context */}
      {!hasClassContext && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Grade Level *</label>
            <select
              className={`input-field ${errors.grade ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              value={form.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
            >
              <option value="">Select grade...</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
          </div>

          <div>
            <label className="label">Subject *</label>
            <select
              className={`input-field ${errors.subject ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              value={form.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
            >
              <option value="">Select subject...</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
        </div>
      )}

      <div>
        <label className="label">
          Learning Objectives
          <span className="text-label font-normal ml-1">(optional)</span>
        </label>
        <textarea
          className="input-field min-h-[90px] resize-y"
          placeholder="Students will be able to..."
          value={form.objectives}
          onChange={(e) => handleChange('objectives', e.target.value)}
          onBlur={() => onChange(form)}
        />
      </div>

      <div>
        <label className="label">
          Estimated Duration
          {hasDefaultDuration && (
            <span className="ml-2 text-xs font-normal text-primary bg-primary-light px-1.5 py-0.5 rounded">
              Class default: {classInfo.default_duration} min
            </span>
          )}
        </label>
        {hasDefaultDuration ? (
          <div className="flex items-center gap-3">
            <div className="input-field w-32 bg-gray-50 text-label cursor-default select-none">
              {form.duration}
            </div>
            <span className="text-label text-sm">minutes (class default)</span>
            <button
              type="button"
              onClick={() => handleChange('duration', '')}
              className="text-xs text-label hover:text-primary underline"
            >
              Override
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              className="input-field w-32"
              type="number"
              min="1"
              max="300"
              placeholder="45"
              value={form.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              onBlur={() => onChange(form)}
            />
            <span className="text-label text-sm">minutes (optional)</span>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary">
          Continue to Standards →
        </button>
      </div>
    </form>
  );
}
