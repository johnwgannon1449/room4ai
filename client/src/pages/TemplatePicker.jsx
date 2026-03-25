import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../utils/api';

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Serif headers, formal layout, navy accent',
    preview: {
      headerBg: '#1E3A5F',
      headerText: '#FFFFFF',
      accent: '#1E3A5F',
      bodyBg: '#FFFFFF',
      bodyText: '#1E293B',
      font: 'Georgia, serif',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean Inter font, slate header, amber accent line',
    preview: {
      headerBg: '#1E3A5F',
      headerText: '#FFFFFF',
      accent: '#F59E0B',
      bodyBg: '#FFFFFF',
      bodyText: '#1E293B',
      font: 'Inter, sans-serif',
      accentLine: true,
    },
  },
  {
    id: 'structured',
    name: 'Structured',
    description: 'Two-column layout with gray sidebar',
    preview: {
      headerBg: '#475569',
      headerText: '#FFFFFF',
      accent: '#475569',
      bodyBg: '#FFFFFF',
      bodyText: '#1E293B',
      sidebar: true,
      font: 'Inter, sans-serif',
    },
  },
  {
    id: 'chalkboard',
    name: 'Chalkboard',
    description: 'Dark background, chalk-style headers',
    preview: {
      headerBg: '#1E293B',
      headerText: '#F8FAFC',
      accent: '#F59E0B',
      bodyBg: '#1E293B',
      bodyText: '#E2E8F0',
      font: 'Inter, sans-serif',
      dark: true,
    },
  },
  {
    id: 'bright',
    name: 'Bright',
    description: 'Bold coral/teal header, emoji section icons',
    preview: {
      headerBg: '#EF4444',
      headerText: '#FFFFFF',
      accent: '#14B8A6',
      bodyBg: '#FFFFFF',
      bodyText: '#1E293B',
      font: 'Inter, sans-serif',
      emojis: true,
    },
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description: 'Warm cream, rounded corners, whimsical',
    preview: {
      headerBg: '#FFFBF0',
      headerText: '#1E293B',
      accent: '#D97706',
      bodyBg: '#FFFBF0',
      bodyText: '#1E293B',
      font: 'Georgia, serif',
      warm: true,
    },
  },
];

function TemplateMiniPreview({ template, teacherData }) {
  const p = template.preview;
  const name = teacherData?.name || 'Ms. Johnson';
  const grade = teacherData?.grade || '5th Grade';
  const subject = teacherData?.subject || 'Math';

  return (
    <div
      className="w-full aspect-[8.5/11] rounded overflow-hidden border text-[6px] leading-tight"
      style={{ backgroundColor: p.bodyBg, borderColor: p.dark ? '#334155' : '#E2E8F0', fontFamily: p.font }}
    >
      {/* Header */}
      <div
        className="px-2 py-1.5"
        style={{ backgroundColor: p.headerBg }}
      >
        <div className="font-bold" style={{ color: p.headerText, fontSize: '8px' }}>
          Room<span style={{ color: '#F59E0B' }}>4</span>AI
        </div>
        <div style={{ color: p.headerText, opacity: 0.7, fontSize: '5px' }}>
          {name} · {grade} · {subject}
        </div>
      </div>

      {/* Accent line for modern */}
      {p.accentLine && (
        <div className="h-0.5" style={{ backgroundColor: p.accent }} />
      )}

      {/* Content */}
      {p.sidebar ? (
        <div className="flex flex-1 h-full">
          <div className="w-1/3 px-1 py-1.5" style={{ backgroundColor: '#F1F5F9' }}>
            <div className="font-semibold mb-0.5" style={{ color: p.accent, fontSize: '5px' }}>STANDARDS</div>
            <div className="space-y-0.5">
              {['CC.5.1', 'CC.5.2', 'CC.5.3'].map((s) => (
                <div key={s} className="text-gray-500" style={{ fontSize: '4.5px' }}>• {s}</div>
              ))}
            </div>
          </div>
          <div className="flex-1 px-1 py-1.5">
            <div className="font-semibold mb-0.5" style={{ color: p.bodyText, fontSize: '6px' }}>Lesson Title</div>
            <div style={{ color: p.bodyText, opacity: 0.6, fontSize: '4.5px', lineHeight: '1.4' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </div>
          </div>
        </div>
      ) : (
        <div className="px-2 py-1.5 space-y-1.5">
          <div className="font-bold" style={{ color: p.bodyText, fontSize: '7px' }}>Lesson Title Here</div>
          {p.emojis && (
            <>
              <div style={{ fontSize: '5px' }}><span>📚</span> <span style={{ fontWeight: 600, color: p.accent }}>OBJECTIVES</span></div>
              <div style={{ color: p.bodyText, opacity: 0.7, fontSize: '4.5px' }}>Students will be able to...</div>
              <div style={{ fontSize: '5px' }}><span>✏️</span> <span style={{ fontWeight: 600, color: p.accent }}>ACTIVITIES</span></div>
            </>
          )}
          {!p.emojis && (
            <>
              <div className="font-semibold" style={{ color: p.accent, fontSize: '5.5px' }}>LEARNING OBJECTIVES</div>
              <div style={{ color: p.bodyText, opacity: 0.6, fontSize: '4.5px', lineHeight: '1.4' }}>
                Students will be able to demonstrate understanding...
              </div>
              <div className="mt-1 font-semibold" style={{ color: p.accent, fontSize: '5.5px' }}>LESSON CONTENT</div>
              <div style={{ color: p.bodyText, opacity: 0.5, fontSize: '4px', lineHeight: '1.4' }}>
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor...
              </div>
            </>
          )}
          <div className="mt-1 h-0.5 rounded-full" style={{ backgroundColor: p.accent, opacity: 0.2 }} />
          <div className="flex items-center gap-1">
            <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: '#22C55E' }} />
            <div className="text-gray-400" style={{ fontSize: '4px' }}>78%</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatePicker({ user, onUpdate }) {
  const [selected, setSelected] = useState(user?.template_choice || 'classic');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateTemplate(selected);
      if (onUpdate) onUpdate({ ...user, template_choice: selected });
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to save template: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <button onClick={() => navigate('/dashboard')} className="text-sm text-label hover:text-primary transition-colors">
            Skip for now
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary mb-2">Choose your lesson style</h1>
          <p className="text-label">This is how your exported lessons will look. You can change it anytime.</p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {TEMPLATES.map((template) => {
            const isSelected = selected === template.id;
            return (
              <button
                key={template.id}
                onClick={() => setSelected(template.id)}
                className={`text-left p-3 rounded-xl border-2 transition-all duration-200 relative ${
                  isSelected
                    ? 'border-accent shadow-lg shadow-amber-100 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Checkmark badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center z-10 shadow">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Mini preview */}
                <TemplateMiniPreview template={template} teacherData={user} />

                {/* Label */}
                <div className="mt-3">
                  <div className={`font-semibold text-sm ${isSelected ? 'text-accent' : 'text-primary'}`}>
                    {template.name}
                  </div>
                  <div className="text-xs text-label mt-0.5 leading-snug">{template.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-8 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              `Use ${TEMPLATES.find((t) => t.id === selected)?.name} Template`
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
