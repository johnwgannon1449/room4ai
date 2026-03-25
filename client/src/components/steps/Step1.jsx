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
  const [form, setForm] = useState({
    title: data?.title || '',
    grade: data?.grade || classInfo?.grade || '',
    subject: data?.subject || classInfo?.subject || '',
    objectives: data?.objectives || '',
    duration: data?.duration || '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        grade: data.grade || classInfo?.grade || '',
        subject: data.subject || classInfo?.subject || '',
        objectives: data.objectives || '',
        duration: data.duration || '',
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
    if (!form.grade) e.grade = 'Grade level is required';
    if (!form.subject) e.subject = 'Subject is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) onNext(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Lesson Basics</h2>
        <p className="text-label text-sm">Tell us about your lesson plan</p>
      </div>

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

      <div>
        <label className="label">
          Learning Objectives
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
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
          <span className="text-gray-400 font-normal ml-1">(minutes, optional)</span>
        </label>
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
          <span className="text-label text-sm">minutes</span>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary">
          Continue to Standards →
        </button>
      </div>
    </form>
  );
}
