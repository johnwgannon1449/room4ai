import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../utils/api';

const TEMPLATE_NAMES = {
  classic: 'Classic',
  modern: 'Modern',
  structured: 'Structured',
  chalkboard: 'Chalkboard',
  bright: 'Bright',
  storybook: 'Storybook',
};

export default function Dashboard({ user, onLogout }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateSection, setShowTemplateSection] = useState(false);
  const [discarding, setDiscarding] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    try {
      const res = await api.getLessons();
      setLessons(res.lessons || []);
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscard(lessonId) {
    if (!confirm('Are you sure you want to discard this lesson? This cannot be undone.')) return;
    setDiscarding(lessonId);
    try {
      await api.deleteLesson(lessonId);
      setLessons((ls) => ls.filter((l) => l.id !== lessonId));
    } catch (err) {
      alert('Failed to delete lesson: ' + err.message);
    } finally {
      setDiscarding(null);
    }
  }

  function handleResume(lesson) {
    navigate(`/lesson/${lesson.id}`);
  }

  function handleNewLesson() {
    navigate('/lesson/new');
  }

  const inProgress = lessons.filter((l) => l.status !== 'archived');
  const archived = lessons.filter((l) => l.status === 'archived');

  const teacherName = user?.name || 'Teacher';
  const firstName = teacherName.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/class-setup')}
              className="text-sm text-label hover:text-primary transition-colors hidden sm:block"
            >
              Class Setup
            </button>
            <button
              onClick={onLogout}
              className="text-sm text-label hover:text-primary transition-colors"
            >
              Sign Out
            </button>
            <button onClick={handleNewLesson} className="btn-primary text-sm py-2 px-4">
              + New Lesson
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Welcome back, {firstName}!
          </h1>
          <p className="text-label mt-1">Your AI-powered lesson planning workspace</p>
        </div>

        {/* Quick Start */}
        {lessons.length === 0 && !loading && (
          <div className="card bg-gradient-to-br from-primary to-blue-800 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📚</div>
              <div>
                <h2 className="font-semibold text-xl mb-1">Create your first lesson plan</h2>
                <p className="text-white/70 text-sm mb-4">
                  Room<span className="text-accent">4</span>AI helps you build standards-aligned lesson plans with AI — in minutes.
                </p>
                <button onClick={handleNewLesson} className="btn-primary">
                  + Start New Lesson
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-Progress Lessons */}
        {inProgress.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full inline-block" />
              In Progress
            </h2>
            <div className="space-y-3">
              {inProgress.map((lesson) => (
                <div key={lesson.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary truncate">{lesson.title || 'Untitled Lesson'}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {lesson.grade && <span className="text-xs bg-gray-100 text-label px-2 py-0.5 rounded">{lesson.grade}</span>}
                        {lesson.subject && <span className="text-xs bg-gray-100 text-label px-2 py-0.5 rounded">{lesson.subject}</span>}
                        <span className="text-xs text-label">Step {lesson.current_step}/7</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Updated {new Date(lesson.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleResume(lesson)}
                        className="text-sm font-semibold text-accent hover:text-amber-600 transition-colors px-3 py-1.5 rounded-lg border border-accent hover:bg-amber-50"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => handleDiscard(lesson.id)}
                        disabled={discarding === lesson.id}
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50"
                      >
                        {discarding === lesson.id ? '...' : 'Discard'}
                      </button>
                    </div>
                  </div>

                  {/* Step progress mini bar */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${((lesson.current_step - 1) / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Archived Lessons */}
        {archived.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-progress-green rounded-full inline-block" />
              Lesson Archive
            </h2>
            <div className="space-y-3">
              {archived.map((lesson) => (
                <div key={lesson.id} className="card opacity-90 hover:opacity-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary truncate">{lesson.title || 'Untitled Lesson'}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {lesson.grade && <span className="text-xs bg-gray-100 text-label px-2 py-0.5 rounded">{lesson.grade}</span>}
                        {lesson.subject && <span className="text-xs bg-gray-100 text-label px-2 py-0.5 rounded">{lesson.subject}</span>}
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">✓ Exported</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(lesson.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResume(lesson)}
                        className="text-sm text-label hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-gray-200"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
          </div>
        )}

        {/* Template Section */}
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
