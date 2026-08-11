interface DragOverlayProps {
  isUnsupportedFile: boolean;
}

export const DragOverlay = ({ isUnsupportedFile }: DragOverlayProps) => {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-80 flex items-center justify-center backdrop-blur-xs ${
        isUnsupportedFile ? 'bg-semantic-error/10' : 'bg-primary-500/10'
      }`}
    >
      <div
        className={`rounded-lg border px-4 py-3 font-medium text-sm shadow-lg ${
          isUnsupportedFile
            ? 'border-semantic-error/30 bg-surface-100/90 text-semantic-error dark:bg-surface-800/90'
            : 'border-primary-ink/30 bg-white/90 text-surface-800 dark:bg-surface-800/90 dark:text-surface-200'
        }`}
      >
        {isUnsupportedFile
          ? 'Unsupported file format. Only .ics, .json, and .mobileconfig files are supported.'
          : 'Drop .ics or .json files to import tasks, or .mobileconfig to add an account'}
      </div>
    </div>
  );
};
