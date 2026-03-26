import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import StepProgress from '../components/StepProgress';
import SaveIndicator from '../components/SaveIndicator';
import Step2 from '../components/steps/Step2';
import Step5 from '../components/steps/Step5';
import Step7 from '../components/steps/Step7';
import { api } from '../utils/api';

const QUICK_STEPS = ['Content', 'Review', 'Export'];

// Combined content + standards step for Quick Lesson
function QuickStep1({ data, classInfo, onChange, onNext }) {
  const [content, setContent] = useState(data?.content || '');
  const [selectedStandards, setSelectedStandards] = useState(data?.selectedStandards || []);
  const [standards, setStandards] = useState([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const grade = classInfo?.grade || '';
  const subject = classInfo?.subject || '';

  useEffect(() => {
    if (grade && subject) {
      api.getStandards(grade, subject)
        .then((r) => setStandards(r.standards || []))
        .catch(() => {});
    }
  }, [grade, subject]);

  async function startRecording() {
    setVoiceError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setTranscribing(true);
        try {
          const res = await api.transcribeAudio(blob);
          const updated = content + (content ? ' ' : '') + res.text;
          setContent(updated);
          onChange({ content: updated, selectedStandards });
        } catch (err) {
          setVoiceError('Transcription failed: ' + err.message);
        } finally {
          setTranscribing(false);
        }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch {
      setVoiceError('Microphone access denied.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  function toggleStandard(standard) {
    const isSelected = selectedStandards.some((s) => s.code === standard.code);
    const updated = isSelected
      ? selectedStandards.filter((s) => s.code !== standard.code)
      : [...selectedStandards, standard];
    setSelectedStandards(updated);
    onChange({ content, selectedStandards: updated });
  }

  const filteredStandards = standards.filter((s) => {
    const q = search.toLowerCase();
    return s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  function handleNext() {
    if (!content.trim()) { setError('Please add lesson content to continue.'); return; }
    if (selectedStandards.length === 0) { setError('Please select at least one standard.'); return; }
    setError('');
    onNext({ content, selectedStandards });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Quick Lesson</h2>
        <p className="text-label text-sm">Describe your lesson and pick standards — we'll do the rest</p>
      </div>

      {/* Voice + content input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Lesson Content *</label>
          <div className="flex items-center gap-2">
            {transcribing && (
              <span className="text-xs text-label flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse inline-block" />
                Transcribing...
              </span>
            )}
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={transcribing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                recording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-primary text-white hover:bg-primary-dark'
              } disabled:opacity-50`}
            >
              <svg className="w-3.5 h-3.5" fill={recording ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {recording ? 'Stop' : 'Record'}
            </button>
          </div>
        </div>
        <textarea
          className={`input-field min-h-[200px] resize-y ${error && !content ? 'border-red-400 ring-1 ring-red-400' : ''}`}
          placeholder="Describe your lesson plan in detail. Include activities, discussion questions, and key concepts..."
          value={content}
          onChange={(e) => { setContent(e.target.value); onChange({ content: e.target.value, selectedStandards }); }}
        />
        {voiceError && <p className="text-red-500 text-xs mt-1">{voiceError}</p>}
        <span className="text-xs text-gray-400">{content.length} chars</span>
      </div>

      {/* Standards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">California Standards *</label>
          <span className="text-xs text-label">{selectedStandards.length} selected</span>
        </div>
        {standards.length > 0 ? (
          <>
            <input
              className="input-field mb-2"
              placeholder="Search standards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredStandards.map((standard) => {
                const isSelected = selectedStandards.some((s) => s.code === standard.code);
                return (
                  <button
                    key={standard.code}
                    onClick={() => toggleStandard(standard)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-light ring-1 ring-primary'
                        : 'border-border bg-white hover:border-primary'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                        isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>}
                      </div>
                      <div>
                        <span className="font-medium text-primary">{standard.code}</span>
                        <span className="text-gray-600 ml-1 text-xs">{standard.description}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-label">
            {grade && subject ? 'Loading standards...' : 'Set up a class profile first to load standards.'}
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end">
        <button onClick={handleNext} className="btn-primary">
          Check Coverage →
        </button>
      </div>
    </div>
  );
}

export default function QuickLesson({ user }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({});
  const [classInfo, setClassInfo] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [analysisRunning, setAnalysisRunning] = useState(false);

  useEffect(() => {
    api.getClass().then((r) => setClassInfo(r.class || null)).catch(() => {});
  }, []);

  function updateStep(step, data) {
    setStepData((prev) => ({ ...prev, [`step${step}`]: data }));
  }

  async function handleStep1Next(data) {
    // data = { content, selectedStandards }
    const standards = data.selectedStandards;
    const content = data.content;

    // Build minimal stepData to pass to Step5 (ContentReview)
    const title = content.slice(0, 50).trim() + (content.length > 50 ? '...' : '');
    const grade = classInfo?.grade || '';
    const subject = classInfo?.subject || '';

    const s1 = { title, grade, subject, objectives: '', duration: '' };
    const s2 = { selectedStandards: standards };
    const s3 = { content };

    // Auto-run AI analysis
    setAnalysisRunning(true);
    let analysis = null;
    try {
      // Create a temp lesson in DB
      const res = await api.createLesson({
        title,
        grade,
        subject,
        step_data: { step1: s1, step2: s2, step3: s3 },
        current_step: 2,
        class_id: classInfo?.id || null,
      });
      setLessonId(res.lesson.id);
      window.history.replaceState({}, '', `/quick-lesson`);

      const analysisRes = await api.analyzeLesson(res.lesson.id, {
        lessonContent: content,
        standards,
        objectives: '',
      });
      analysis = analysisRes.analysis;
    } catch (err) {
      console.error('Quick lesson setup error:', err);
    } finally {
      setAnalysisRunning(false);
    }

    const newStepData = {
      step1: s1,
      step2: s2,
      step3: s3,
      step4: { analysis },
    };
    setStepData(newStepData);
    setCurrentStep(2);
  }

  async function handleStep2Next(data) {
    const newStepData = { ...stepData, step5: data };
    setStepData(newStepData);

    if (lessonId) {
      try {
        await api.updateLesson(lessonId, { step_data: newStepData, current_step: 3 });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch {}
    }

    setCurrentStep(3);
  }

  async function handleExported() {
    if (lessonId) {
      try {
        await api.updateLesson(lessonId, { status: 'archived' });
      } catch {}
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')}>
            <Logo size="sm" />
          </button>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <span className="text-sm font-medium text-accent">⚡ Quick Lesson</span>
            <button onClick={() => navigate('/dashboard')} className="text-sm text-label hover:text-primary transition-colors">
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <StepProgress currentStep={currentStep} steps={QUICK_STEPS} />

        <div className="card">
          {currentStep === 1 && (
            <QuickStep1
              data={stepData.step3}
              classInfo={classInfo}
              onChange={(data) => updateStep(3, data)}
              onNext={handleStep1Next}
            />
          )}

          {currentStep === 1 && analysisRunning && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                <div className="text-center">
                  <p className="font-semibold text-primary">Analyzing your lesson...</p>
                  <p className="text-label text-sm mt-1">Checking California standards coverage</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <Step5
              data={stepData.step5}
              lessonData={stepData}
              onChange={(data) => updateStep(5, data)}
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step7
              lessonData={stepData}
              lesson={{ id: lessonId, title: stepData.step1?.title, grade: stepData.step1?.grade, subject: stepData.step1?.subject }}
              user={user}
              classInfo={classInfo}
              onExported={handleExported}
            />
          )}

          <div className="watermark mt-6">Room4AI</div>
        </div>
      </main>
    </div>
  );
}
