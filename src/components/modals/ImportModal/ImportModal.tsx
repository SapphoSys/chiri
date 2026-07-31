import ChevronLeft from 'lucide-react/icons/chevron-left';
import { type DragEvent, useCallback, useEffect, useState } from 'react';
import { ModalWrapper } from '$components/ModalWrapper';
import { ImportModalBody } from '$components/modals/ImportModal/ImportModalBody';
import { ImportModalFooter } from '$components/modals/ImportModal/ImportModalFooter';
import type { ImportStep } from '$components/modals/ImportModal/StepIndicator';
import { useImportExecution } from '$hooks/import/useImportExecution';
import { useImportFile } from '$hooks/import/useImportFile';
import { useAccounts } from '$hooks/queries/useAccounts';
import type { Calendar } from '$types/calendar';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  preloadedFile?: { name: string; content: string } | null;
  /** callback when file is dropped directly on the modal's drop zone */
  onFileDrop?: () => void;
}

export const ImportModal = ({ isOpen, onClose, preloadedFile, onFileDrop }: ImportModalProps) => {
  const { data: accounts = [] } = useAccounts();
  const [step, setStep] = useState<ImportStep>('upload');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCalendarId, setSelectedCalendarId] = useState('');
  const [isDraggingInDropZone, setIsDraggingInDropZone] = useState(false);

  const {
    fileName,
    parsedTasks,
    error,
    parseErrors,
    handleFileContent,
    handleFileSelect,
    resetFile,
    setError,
    setParsedTasks,
  } = useImportFile();

  const allCalendars: Calendar[] = accounts.flatMap((account) => account.calendars);
  const selectedCalendar = allCalendars.find((c) => c.id === selectedCalendarId);

  const handleDestinationSelect = useCallback((accountId: string, calendarId: string) => {
    setSelectedAccountId(accountId);
    setSelectedCalendarId(calendarId);
  }, []);

  const resetModal = useCallback(() => {
    setStep('upload');
    resetFile();
    setIsDraggingInDropZone(false);
    setSelectedAccountId('');
    setSelectedCalendarId('');
    onFileDrop?.();
  }, [onFileDrop, resetFile]);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [onClose, resetModal]);

  const { isImporting, importProgress, importSuccess, handleImport, resetImport } =
    useImportExecution({
      allCalendars,
      parsedTasks,
      selectedAccountId,
      selectedCalendarId,
      onImportStart: () => setStep('review'),
      onClose: handleClose,
      onError: setError,
      onTasksChange: setParsedTasks,
    });

  useEffect(() => {
    if (!isOpen) {
      resetModal();
      resetImport();
    }
  }, [isOpen, resetImport, resetModal]);

  useEffect(() => {
    if (isOpen && preloadedFile) {
      handleFileContent(preloadedFile.name, preloadedFile.content);
    }
  }, [isOpen, preloadedFile, handleFileContent]);

  const handleReset = useCallback(() => {
    setStep('upload');
    resetFile();
    setSelectedAccountId('');
    setSelectedCalendarId('');
  }, [resetFile]);

  const handleBack = useCallback(() => {
    if (step === 'destination') {
      setStep('upload');
    } else if (step === 'review') {
      setStep('destination');
    }
  }, [step]);

  const canProceed =
    (step === 'upload' && parsedTasks.length > 0) ||
    (step === 'destination' && !!selectedCalendarId);

  const handleNext = useCallback(() => {
    if (step === 'upload' && parsedTasks.length > 0) {
      setStep('destination');
    } else if (step === 'destination' && selectedCalendarId) {
      setStep('review');
    }
  }, [parsedTasks.length, selectedCalendarId, step]);

  // handle drops anywhere on the modal (only for preventing default behavior)
  const handleModalDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // don't process drops at modal level - let the drop zone handle it
    // this just prevents the browser from trying to open the file
  }, []);

  const handleModalDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleModalDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDropZoneDragEnter = useCallback(() => {
    setIsDraggingInDropZone(true);
  }, []);

  const handleDropZoneDragLeave = useCallback(() => {
    setIsDraggingInDropZone(false);
  }, []);

  const handleDropZoneDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      await handleFileSelect(file);

      onFileDrop?.();
    },
    [handleFileSelect, onFileDrop],
  );

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Tasks"
      zIndex="z-60"
      className="max-w-lg"
      contentPadding={false}
      preventClose={isImporting}
      backdropProps={{
        onDrop: handleModalDrop,
        onDragOver: handleModalDragOver,
        onDragLeave: handleModalDragLeave,
      }}
      headerLeft={
        step !== 'upload' && !isImporting && !importSuccess ? (
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg p-1.5 text-surface-500 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:hover:bg-surface-700 dark:hover:text-surface-300"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : undefined
      }
      footerLeft={
        <ImportModalFooter
          placement="left"
          step={step}
          taskCount={parsedTasks.length}
          isImporting={isImporting}
          importSuccess={importSuccess}
          canProceed={canProceed}
          onClose={handleClose}
          onNext={handleNext}
          onImport={handleImport}
        />
      }
      footer={
        <ImportModalFooter
          placement="main"
          step={step}
          taskCount={parsedTasks.length}
          isImporting={isImporting}
          importSuccess={importSuccess}
          canProceed={canProceed}
          onClose={handleClose}
          onNext={handleNext}
          onImport={handleImport}
        />
      }
    >
      <ImportModalBody
        step={step}
        fileName={fileName}
        parsedTasks={parsedTasks}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        selectedCalendarId={selectedCalendarId}
        selectedCalendar={selectedCalendar}
        isImporting={isImporting}
        importProgress={importProgress}
        isDraggingInDropZone={isDraggingInDropZone && step === 'upload'}
        error={error}
        parseErrors={parseErrors}
        onFileSelect={handleFileSelect}
        onReset={handleReset}
        onDrop={handleDropZoneDrop}
        onDragEnter={handleDropZoneDragEnter}
        onDragLeave={handleDropZoneDragLeave}
        onFileError={setError}
        onDestinationSelect={handleDestinationSelect}
      />
    </ModalWrapper>
  );
};
