import type { DragEvent } from 'react';
import { type ImportStep, StepIndicator } from '$components/modals/ImportModal/StepIndicator';
import { DestinationStep } from '$components/modals/ImportModal/steps/DestinationStep';
import { FileUploadStep } from '$components/modals/ImportModal/steps/FileUploadStep';
import { ReviewStep } from '$components/modals/ImportModal/steps/ReviewStep';
import type { Account } from '$types/account';
import type { Calendar } from '$types/calendar';
import type { ParsedTaskWithStatus } from '$types/task/import';

interface ImportModalBodyProps {
  step: ImportStep;
  fileName: string;
  parsedTasks: ParsedTaskWithStatus[];
  accounts: Account[];
  selectedAccountId: string;
  selectedCalendarId: string;
  selectedCalendar: Calendar | undefined;
  isImporting: boolean;
  importProgress: number;
  isDraggingInDropZone: boolean;
  error: string;
  parseErrors: string[];
  onFileSelect: (file: File) => Promise<void>;
  onReset: () => void;
  onDrop: (event: DragEvent) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onFileError: (message: string) => void;
  onDestinationSelect: (accountId: string, calendarId: string) => void;
}

export const ImportModalBody = ({
  step,
  fileName,
  parsedTasks,
  accounts,
  selectedAccountId,
  selectedCalendarId,
  selectedCalendar,
  isImporting,
  importProgress,
  isDraggingInDropZone,
  error,
  parseErrors,
  onFileSelect,
  onReset,
  onDrop,
  onDragEnter,
  onDragLeave,
  onFileError,
  onDestinationSelect,
}: ImportModalBodyProps) => (
  <div className="flex h-full min-h-0 flex-col">
    <div className="shrink-0 border-surface-100 border-b px-4 py-3 dark:border-surface-700/50">
      <StepIndicator
        currentStep={step}
        hasFile={parsedTasks.length > 0}
        hasDestination={!!selectedCalendarId}
      />
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {step === 'upload' && (
        <FileUploadStep
          fileName={fileName}
          isDraggingOver={isDraggingInDropZone}
          onFileSelect={onFileSelect}
          onReset={onReset}
          onDrop={onDrop}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onFileError={onFileError}
          error={error}
          parseErrors={parseErrors}
        />
      )}

      {step === 'destination' && (
        <DestinationStep
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          selectedCalendarId={selectedCalendarId}
          onSelect={onDestinationSelect}
        />
      )}

      {step === 'review' && (
        <ReviewStep
          tasks={parsedTasks}
          selectedCalendar={selectedCalendar}
          isImporting={isImporting}
          importProgress={importProgress}
        />
      )}
    </div>
  </div>
);
