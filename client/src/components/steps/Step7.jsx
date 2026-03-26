import { useState } from 'react';
import { exportLessonToPDF } from '../../utils/pdfExport';
import Logo from '../Logo';

const TEMPLATE_LABELS = {
  classic: 'Classic', modern: 'Modern', structured: 'Structured',
  chalkboard: 'Chalkboard', bright: 'Bright', storybook: 'Storybook',
};

const TEMPLATE_DESCRIPTIONS = {
  classic: 'Serif headers, formal layout, navy accent',
  modern: 'Inter font, slate header, amber accent line',
  structured: 'Two-column, gray sidebar for standards',
  chalkboard: 'Dark background, cream text, chalk style',
  bright: 'Bold coral/teal header, emoji section icons',
  storybook: 'Warm cream, rounded corners, whimsical',
};

export default function Step7({ lessonData, lesson, user, classInfo, onExported }) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const stepData = lessonData || lesson?.step_data || {};
  const title = stepData.step1?.title || lesson?.title || 'Lesson Plan';
  const grade = stepData.step1?.grade || lesson?.grade || '';
  const subject = stepData.step1?.subject || lesson?.subject || '';
  const objectives = stepData.step1?.objectives || '';
  const duration = stepData.step1?.duration || '';
  const standards = stepData.step2?.selectedStandards || [];
  const content = stepData.step5?.editedContent || stepData.step3?.content || '';
  const coveragePercent = stepData.step5?.coveragePercent ?? stepData.step4?.analysis?.coveragePercent ?? 0;
  const details = stepData.step6 || {};
  const templateName = TEMPLATE_LABELS[user?.template_choice || 'classic'];

  async function handleExport() {
    setExporting(true);
    try {
      await exportLessonToPDF(
        { ...lesson, title, grade, subject, step_data: stepData },
        user,
        classInfo
      );
      setExported(true);
      if (onExported) onExported();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Export & Archive</h2>
        <p className="text-label text-sm">Review your lesson and export to PDF using your chosen template</p>
      </div>

      {/* Template info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-primary">Template: </span>
          <span className="text-sm font-semibold text-accent">{templateName}</span>
          <p className="text-xs text-label mt-0.5">{TEMPLATE_DESCRIPTIONS[user?.template_choice || 'classic']}</p>
        </div>
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* Lesson preview */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-[#1A2E25] text-white px-6 py-4">
          <div className="flex items-center">
            <Logo size="sm" />
          </div>
          <p className="text-xs text-white/60 mt-1">Lesson planning, elevated.</p>
          <p className="text-xs text-white/60 mt-1">{classInfo?.teacher_name || user?.name} · {grade} · {subject}</p>
        </div>

        <div className="p-6 space-y-4 max-h-[440px] overflow-y-auto">
          <h1 className="text-xl font-semibold text-primary">{title}</h1>

          {objectives && (
            <div>
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Learning Objectives</h3>
              <p className="text-sm text-text-main whitespace-pre-wrap">{objectives}</p>
            </div>
          )}

          {duration && (
            <div>
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Duration</h3>
              <p className="text-sm text-text-main">{duration} minutes</p>
            </div>
          )}

          {details.warmup_activity && (
            <div>
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                Warm-Up{details.warmup_duration ? ` (${details.warmup_duration} min)` : ''}
              </h3>
              <p className="text-sm text-text-main">{details.warmup_activity}</p>
            </div>
          )}

          {standards.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">California Standards</h3>
              <ul className="text-sm text-text-main space-y-0.5">
                {standards.slice(0, 4).map((s) => (
                  <li key={s.code}><strong>{s.code}</strong>: {s.description}</li>
                ))}
                {standards.length > 4 && <li className="text-label text-xs">+{standards.length - 4} more...</li>}
              </ul>
            </div>
          )}

          {content && (
            <div>
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Lesson Content</h3>
              <p className="text-sm text-text-main whitespace-pre-wrap line-clamp-5">{content}</p>
            </div>
          )}

          {details.exit_ticket && (
            <div>
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Exit Ticket</h3>
              <p className="text-sm text-text-main">{details.exit_ticket}</p>
            </div>
          )}

          {coveragePercent > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">Standards Coverage</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-progress-green"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-progress-green">{coveragePercent}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-primary flex items-center justify-center gap-2 flex-1"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to PDF ({templateName} Template)
            </>
          )}
        </button>
      </div>

      {exported && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-progress-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-700 font-medium">
            Lesson exported and archived! Find it in your dashboard.
          </span>
        </div>
      )}
    </div>
  );
}
