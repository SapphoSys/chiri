import HelpCircle from 'lucide-react/icons/help-circle';
import { Tooltip } from '$components/Tooltip';
import { useSettingsStore } from '$context/settingsContext';

export const StatusProgressSettings = () => {
  const { syncStatusProgress, setSyncStatusProgress } = useSettingsStore();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">
        Status & progress
      </h3>

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
        <label
          htmlFor="sync-status-progress"
          className="flex cursor-pointer items-start justify-between gap-4 p-4"
        >
          <div className="min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  Keep status, progress, and completion in sync
                </span>
                <Tooltip
                  content="0% means Needs Action, 1–99% means In Process, and 100% means Completed."
                  position="top"
                  allowInModal
                >
                  <button
                    type="button"
                    aria-label="Status and progress synchronization rules"
                    onClick={(event) => event.preventDefault()}
                    className="flex size-5 shrink-0 items-center justify-center rounded-md p-0 text-surface-400 leading-none outline-hidden transition-colors hover:text-surface-600 focus-visible:bg-primary-500/15 focus-visible:text-primary-500 dark:text-surface-500 dark:focus-visible:bg-primary-400/15 dark:focus-visible:text-primary-400 dark:hover:text-surface-300"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
              <p className="text-surface-500 text-xs dark:text-surface-400">
                Changing a task&apos;s status or progress updates the related fields automatically
              </p>
            </div>
          </div>
          <input
            id="sync-status-progress"
            type="checkbox"
            checked={syncStatusProgress}
            onChange={(event) => setSyncStatusProgress(event.target.checked)}
            className="mt-0.5 shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          />
        </label>
      </div>
    </div>
  );
};
