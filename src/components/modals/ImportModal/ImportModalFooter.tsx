import Check from 'lucide-react/icons/check';
import Upload from 'lucide-react/icons/upload';
import { LoadingSpinner } from '$components/LoadingSpinner';
import { ModalButton } from '$components/ModalButton';
import type { ImportStep } from '$components/modals/ImportModal/StepIndicator';
import { pluralize } from '$utils/misc';

interface ImportModalFooterProps {
  placement: 'left' | 'main';
  step: ImportStep;
  taskCount: number;
  isImporting: boolean;
  importSuccess: boolean;
  canProceed: boolean;
  onClose: () => void;
  onNext: () => void;
  onImport: () => void;
}

export const ImportModalFooter = ({
  placement,
  step,
  taskCount,
  isImporting,
  importSuccess,
  canProceed,
  onClose,
  onNext,
  onImport,
}: ImportModalFooterProps) => {
  if (placement === 'left') {
    return (
      <div className="text-sm text-surface-500 dark:text-surface-400">
        {taskCount > 0 && step !== 'review' && (
          <span>
            {taskCount} {pluralize(taskCount, 'task')} selected
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      {!importSuccess && (
        <ModalButton variant="secondary" onClick={onClose} disabled={isImporting}>
          Cancel
        </ModalButton>
      )}

      {step !== 'review' ? (
        <ModalButton onClick={onNext} disabled={!canProceed}>
          Continue
        </ModalButton>
      ) : (
        <ModalButton onClick={onImport} disabled={isImporting || importSuccess || taskCount === 0}>
          {importSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Imported!
            </>
          ) : isImporting ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Import {taskCount} {pluralize(taskCount, 'Task')}
            </>
          )}
        </ModalButton>
      )}
    </>
  );
};
