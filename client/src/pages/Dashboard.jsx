import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../utils/api';

const TEMPLATE_NAMES = {
  classic: 'Classic', modern: 'Modern', structured: 'Structured',
  chalkboard: 'Chalkboard', bright: 'Bright', storybook: 'Storybook',
};

function ClassCard({ cls, onEdit, onNewLesson, onViewLessons, expanded, onToggleExpand }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Color indicator */}
        <div className="w-1 self-stretch rounded-full bg-accent flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-primary text-lg leading-snug">{cls.teacher_name}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full border border-blue-100 font-medium">{cls.grade}</span>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 font-medium">{cls.subject}</span>
                {cls.school_name && (
                  <span className="text-xs text-label">{cls.school_name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => onNewLesson(cls)}
              className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Lesson
            </button>
            <button
              onClick={onToggleExpand}
              className="text-sm font-medium text-primary hover:text-accent transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-accent hover:bg-amber-50"
            >
              {expanded ? 'Hide Lessons' : 'View Lessons'}
            </button>
            <button
              onClick={() => onEdit(cls)}
              className="text-sm font-medium text-label hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              Edit Class
            </button>
          </div>
        </div>
      </div>

      {/* Expanded lessons */}
      {expanded && <ClassLessons classId={cls.id} />}
    </div>
  );
}

function ClassLessons({ classId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getLessons(classId)
      .then((r) => setLessons(r.lessons || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center py-4">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-label text-center py-3">No lessons yet for this class.</p>
      </div>
    );
  }

  const inProgress = lessons.filter((l) => l.status !== 'archived');
  const archived = lessons.filter((l) => l.status === 'archived');

  function handleDiscard(lessonId) {
    if (!confirm('Discard this lesson? This cannot be undone.')) return;
    api.deleteLesson(lessonId).then(() => {
      setLessons((ls) => ls.filter((l) => l.id !== lessonId));
    }).catch((err) => alert(err.message));
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
      {inProgress.length > 0 && (
        <>
          <p className="text-xs font-semibold text-label uppercase tracking-wide mb-2">In Progress</p>
          {inProgress.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{lesson.title || 'Untitled'}</p>
                <p className="text-xs text-label">Step {lesson.current_step}/7</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="text-xs font-semibold text-accent hover:text-amber-600 transition-colors"
                >Resume</button>
                <button
                  onClick={() => handleDiscard(lesson.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >Discard</button>
              </div>
            </div>
          ))}
        </>
      )}
      {archived.length > 0 && (
        <>
          <p className="text-xs font-semibold text-label uppercase tracking-wide mt-3 mb-2">Archived</p>
          {archived.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between gap-3 bg-green-50 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{lesson.title || 'Untitled'}</p>
                <span className="text-xs text-green-600 font-medium">✓ Exported</span>
              </div>
              <button
                onClick={() => navigate(`/lesson/${lesson.id}`)}
                className="text-xs font-semibold text-label hover:text-primary transition-colors"
              >View</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateSection, setShowTemplateSection] = useState(false);
  const [expandedClass, setExpandedClass] = useState(null);
  const navigate = useNavigate();

  // Welcome message — shown only once per browser session
  const showWelcome = !sessionStorage.getItem('r4ai_welcomed');
  if (showWelcome) sessionStorage.setItem('r4ai_welcomed', '1');

  useEffect(() => {
    api.getClasses()
      .then((r) => setClasses(r.classes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleNewLesson(cls) {
    navigate(`/lesson/new?classId=${cls.id}`);
  }

  function handleEdit(cls) {
    navigate(`/class-setup/${cls.id}`);
  }

  const firstName = (user?.name || 'Teacher').split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/quick-lesson')}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-1"
            >
              ⚡ Quick Lesson
            </button>
            <button onClick={onLogout} className="text-sm text-label hover:text-primary transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Subtle welcome (once per session) */}
        {showWelcome && (
          <p className="text-sm text-label">
            Welcome back, <span className="font-medium text-primary">{firstName}</span> 👋
          </p>
        )}

        {/* Top action bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Your Classes</h1>
          <button
            onClick={() => navigate('/class-setup/new')}
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create New Class
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && classes.length === 0 && (
          <div className="card bg-gradient-to-br from-primary to-blue-800 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📚</div>
              <div>
                <h2 className="font-semibold text-xl mb-1">Set up your first class</h2>
                <p className="text-white/70 text-sm mb-4">
                  Create a class profile to start building AI-powered, standards-aligned lesson plans.
                </p>
                <button onClick={() => navigate('/class-setup/new')} className="btn-primary">
                  Create Class Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Class tiles */}
        {classes.length > 0 && (
          <div className="space-y-4">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onEdit={handleEdit}
                onNewLesson={handleNewLesson}
                onViewLessons={() => {}}
                expanded={expandedClass === cls.id}
                onToggleExpand={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
              />
            ))}
          </div>
        )}

        {/* Template section */}
        <section className="border-t border-gray-100 pt-6">
          <button
            onClick={() => setShowTemplateSection((s) => !s)}
            className="flex items-center justify-between w-full text-left group"
          >
            <div>
              <span className="text-sm text-label">Lesson Template — </span>
              <span className="text-sm font-semibold text-primary">
                {TEMPLATE_NAMES[user?.template_choice || 'classic']}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-accent font-medium group-hover:underline">Change</span>
              <svg
                className={`w-4 h-4 text-label transition-transform ${showTemplateSection ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          {showTemplateSection && (
            <div className="mt-3">
              <button
                onClick={() => navigate('/templates')}
                className="btn-primary text-sm py-2 px-4"
              >
                Choose Template
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
