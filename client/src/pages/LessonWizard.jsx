import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import StepProgress from '../components/StepProgress';
import SaveIndicator from '../components/SaveIndicator';
import Step1 from '../components/steps/Step1';
import Step2 from '../components/steps/Step2';
import Step3 from '../components/steps/Step3';
import Step4 from '../components/steps/Step4';
import Step5 from '../components/steps/Step5';
import Step6 from '../components/steps/Step6';
import Step7 from '../components/steps/Step7';
import { api } from '../utils/api';

const STEP_LABELS = ['Basics', 'Standards', 'Content', 'Coverage', 'Review', 'Details', 'Export'];

export default function LessonWizard({ user }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const classIdParam = searchParams.get('classId');

  const [lessonId, setLessonId] = useState(isNew ? null : id);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({});
  const [classInfo, setClassInfo] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const saveTimerRef = useRef(null);
  const retryRef = useRef(false);

  useEffect(() => {
    // Load class info — use classId param if present, else most recent class
    const loadClass = classIdParam
      ? api.getClass(classIdParam)
      : api.getClass();
    loadClass.then((res) => setClassInfo(res.class || null)).catch(() => {});

    if (!isNew) loadLesson();
  }, [id]);

  async function loadLesson() {
    setLoading(true);
    try {
      const res = await api.getLesson(id);
      const lesson = res.lesson;
      setLessonId(lesson.id);
      setCurrentStep(lesson.current_step || 1);
      setStepData(lesson.step_data || {});
      // Load the class for this lesson if it has one
      if (lesson.class_id) {
        api.getClass(lesson.class_id).then((r) => setClassInfo(r.class || null)).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  const saveLesson = useCallback(async (overrideData, overrideStep) => {
    const dataToSave = overrideData !== undefined ? overrideData : stepData;
    const stepToSave = overrideStep !== undefined ? overrideStep : currentStep;
    if (!lessonId) return;

    setSaveStatus('saving');
    try {
      await api.updateLesson(lessonId, { step_data: dataToSave, current_step: stepToSave });
      setSaveStatus('saved');
      retryRef.current = false;
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      setSaveStatus('error');
      if (!retryRef.current) {
        retryRef.current = true;
        setTimeout(() => saveLesson(overrideData, overrideStep), 2000);
      }
    }
  }, [lessonId, stepData, currentStep]);

  function scheduleAutoSave(data, step) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveLesson(data, step), 800);
  }

  function updateStepData(step, data) {
    const updated = { ...stepData, [`step${step}`]: { ...(stepData[`step${step}`] || {}), ...data } };
    setStepData(updated);
    if (lessonId) scheduleAutoSave(updated, currentStep);
  }

  // Step 1 — creates or updates lesson, advances to step 2
  // Fix: use window.history.replaceState to avoid component re-mount after lesson creation
  async function handleStep1Next(data) {
    const newStepData = { ...stepData, step1: data };
    setStepData(newStepData);

    if (!lessonId) {
      setSaveStatus('saving');
      try {
        const res = await api.createLesson({
          title: data.title,
          grade: data.grade,
          subject: data.subject,
          step_data: newStepData,
          current_step: 2,
          class_id: classIdParam || null,
        });
        const newId = res.lesson.id;
        setLessonId(newId);
        // Update URL without triggering a re-mount
        window.history.replaceState({}, '', `/lesson/${newId}`);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2500);
      } catch (err) {
        setSaveStatus('error');
        return;
      }
    } else {
      try {
        await api.updateLesson(lessonId, {
          title: data.title,
          grade: data.grade,
          subject: data.subject,
          step_data: newStepData,
          current_step: 2,
        });
      } catch (err) {
        console.error('Save error:', err);
      }
    }

    setCurrentStep(2);
  }

  async function handleStepNext(step, data) {
    const newStepData = { ...stepData, [`step${step}`]: data };
    setStepData(newStepData);
    const nextStep = step + 1;
    setCurrentStep(nextStep);

    if (lessonId) {
      try {
        await api.updateLesson(lessonId, { step_data: newStepData, current_step: nextStep });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2500);
      } catch (err) {
        setSaveStatus('error');
      }
    }
  }

  // Backward navigation — jump to any completed step
  async function handleStepBack(targetStep) {
    if (targetStep >= currentStep) return;
    setCurrentStep(targetStep);
    if (lessonId) {
      try {
        await api.updateLesson(lessonId, { step_data: stepData, current_step: targetStep });
      } catch (err) {
        console.error('Save on back error:', err);
      }
    }
  }

  async function handleExported() {
    if (lessonId) {
      try {
        await api.updateLesson(lessonId, { status: 'archived' });
      } catch (err) {
        console.error('Failed to archive lesson:', err);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
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
            <button onClick={() => navigate('/dashboard')} className="text-sm text-label hover:text-primary transition-colors">
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <StepProgress
          currentStep={currentStep}
          steps={STEP_LABELS}
          onStepClick={handleStepBack}
        />

        <div className="card">
          {currentStep === 1 && (
            <Step1
              data={stepData.step1}
              classInfo={classInfo}
              onChange={(data) => updateStepData(1, data)}
              onNext={handleStep1Next}
            />
          )}

          {currentStep === 2 && (
            <Step2
              data={stepData.step2}
              lessonData={stepData}
              onChange={(data) => updateStepData(2, data)}
              onNext={(data) => handleStepNext(2, data)}
              onBack={() => handleStepBack(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3
              data={stepData.step3}
              onChange={(data) => updateStepData(3, data)}
              onNext={(data) => handleStepNext(3, data)}
              onBack={() => handleStepBack(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4
              data={stepData.step4}
              lessonId={lessonId}
              lessonData={stepData}
              onChange={(data) => updateStepData(4, data)}
              onNext={(data) => handleStepNext(4, data)}
              onBack={() => handleStepBack(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5
              data={stepData.step5}
              lessonData={stepData}
              onChange={(data) => updateStepData(5, data)}
              onNext={(data) => handleStepNext(5, data)}
              onBack={() => handleStepBack(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6
              data={stepData.step6}
              classInfo={classInfo}
              onChange={(data) => updateStepData(6, data)}
              onNext={(data) => handleStepNext(6, data)}
              onBack={() => handleStepBack(5)}
            />
          )}

          {currentStep === 7 && (
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
