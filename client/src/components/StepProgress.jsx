const DEFAULT_STEPS = ['Basics', 'Standards', 'Content', 'Coverage', 'Review', 'Details', 'Export'];

export default function StepProgress({ currentStep, onStepClick, steps = DEFAULT_STEPS }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((label, idx) => {
          const step = idx + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(step)}
                  disabled={!isClickable}
                  title={isCompleted ? `Go back to ${label}` : label}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-progress-green text-white hover:bg-green-600 cursor-pointer ring-2 ring-transparent hover:ring-green-300'
                      : isCurrent
                      ? 'bg-accent text-white ring-4 ring-amber-100 cursor-default'
                      : 'bg-gray-100 text-gray-400 cursor-default'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </button>
                <span className={`text-xs mt-1 font-medium hidden sm:block ${
                  isCurrent ? 'text-accent' : isCompleted ? 'text-progress-green' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
                  isCompleted ? 'bg-progress-green' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      {currentStep > 1 && onStepClick && (
        <p className="text-xs text-gray-400 text-center mt-2">Click a completed step to go back</p>
      )}
    </div>
  );
}
