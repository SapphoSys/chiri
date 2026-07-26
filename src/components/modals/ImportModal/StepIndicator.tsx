import Check from 'lucide-react/icons/check';

const STEPS = [
  { key: 'upload', label: 'Select File' },
  { key: 'destination', label: 'Choose Destination' },
  { key: 'review', label: 'Review & Import' },
] as const;

export type ImportStep = (typeof STEPS)[number]['key'];

interface StepIndicatorProps {
  currentStep: ImportStep;
  hasFile: boolean;
  hasDestination: boolean;
}

export const StepIndicator = ({ currentStep, hasFile, hasDestination }: StepIndicatorProps) => {
  const getStepStatus = (step: ImportStep): 'completed' | 'active' | 'pending' => {
    if (step === 'upload') {
      if (currentStep === 'upload') return 'active';
      return hasFile ? 'completed' : 'pending';
    }

    if (step === 'destination') {
      if (currentStep === 'destination') return 'active';
      if (currentStep === 'review') return hasDestination ? 'completed' : 'pending';
      return 'pending';
    }

    if (step === 'review') {
      if (currentStep === 'review') return 'active';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, index) => {
        const status = getStepStatus(step.key);
        return (
          <div key={step.key} className="flex items-center">
            {index > 0 && (
              <div
                className={`mx-2 h-px w-10 transition-colors ${
                  (index === 1 && (currentStep === 'destination' || currentStep === 'review')) ||
                  (index === 2 && currentStep === 'review')
                    ? 'bg-primary-500'
                    : 'bg-surface-300 dark:bg-surface-600'
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full font-medium text-xs transition-all ${
                  status === 'completed'
                    ? 'bg-primary-500 text-primary-contrast'
                    : status === 'active'
                      ? 'bg-surface-200 text-surface-900 ring-2 ring-primary-500 dark:bg-surface-700 dark:text-surface-100'
                      : 'bg-surface-200 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
                }`}
              >
                {status === 'completed' ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span
                className={`hidden font-medium text-xs transition-colors sm:inline ${
                  status === 'active'
                    ? 'text-surface-900 dark:text-surface-100'
                    : status === 'completed'
                      ? 'text-surface-700 dark:text-surface-300'
                      : 'text-surface-500 dark:text-surface-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
