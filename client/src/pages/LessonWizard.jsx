import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function LessonWizard({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [lessonId, setLessonId] = useState(isNew ? null : id);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({});
  const [classInfo, setClassInfo] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const saveTimerRef = useRef(null);
  const retryRef = useRef(false);

  useEffect(() => {
    api.getClass().then((res) => setClassInfo(res.class)).catch(() => {});
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

    setSaveStatus('saving');
    try {
      if (!lessonId) return; // not yet created

      await api.updateLesson(lessonId, {
        step_data: dataToSave,
        current_step: stepToSave,
      });
      setSaveStatus('saved');
      retryRef.current = false;
      // Fade out saved indicator
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      setSaveStatus('error');
      if (!retryRef.current) {
        retryRef.current = true;
        setTimeout(() => saveLesson(overrideData, overrideStep), 2000);
      }
    }
  }, [lessonId, stepData, currentStep]);

  // Debounced auto-save
  function scheduleAutoSave(data, step) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveLesson(data, step);
    }, 800);
  }

  function updateStepData(step, data) {
    const updated = { ...stepData, [`step${step}`]: { ...(stepData[`step${step}`] || {}), ...data } };
    setStepData(updated);
    if (lessonId) scheduleAutoSave(updated, currentStep);
  }

  async function handleStep1Next(data) {
    const newStepData = { ...stepData, step1: data };
    setStepData(newStepData);

    if (!lessonId) {
      // Create the lesson
      setSaveStatus('saving');
      try {
        const res = await api.createLesson({
          title: data.title,
          grade: data.grade,
          subject: data.subject,
          step_data: newStepData,
        });
        setLessonId(res.lesson.id);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2500);
        // Update URL
        navigate(`/lesson/${res.lesson.id}`, { replace: true });
      } catch (err) {
        setSaveStatus('error');
        return;
      }
    } else {
      await api.updateLesson(lessonId, {
        title: data.title,
        grade: data.grade,
        subject: data.subject,
        step_data: newStepData,
        current_step: 2,
      });
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
        await api.updateLesson(lessonId, {
          step_data: newStepData,
          current_step: nextStep,
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2500);
      } catch (err) {
        setSaveStatus('error');
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
        <div className="w-10 h-10 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')}>
            <Logo size="sm" />
          </button>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-label hover:text-primary transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Step progress */}
        <StepProgress currentStep={currentStep} />

        {/* Step card */}
        <div className="card">
          {currentStep === 1 && (
            <Step1
              data={stepData.step1}
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
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3
              data={stepData.step3}
              onChange={(data) => updateStepData(3, data)}
              onNext={(data) => handleStepNext(3, data)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4
              data={stepData.step4}
              lessonId={lessonId}
              lessonData={stepData}
              onChange={(data) => updateStepData(4, data)}
              onNext={(data) => handleStepNext(4, data)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5
              data={stepData.step5}
              lessonData={stepData}
              onChange={(data) => updateStepData(5, data)}
              onNext={(data) => handleStepNext(5, data)}
              onBack={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6
              data={stepData.step6}
              lessonData={stepData}
              onChange={(data) => updateStepData(6, data)}
              onNext={(data) => handleStepNext(6, data)}
              onBack={() => setCurrentStep(5)}
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

          {/* Watermark */}
          <div className="watermark mt-6">Room4AI</div>
        </div>
      </main>
    </div>
  );
}
