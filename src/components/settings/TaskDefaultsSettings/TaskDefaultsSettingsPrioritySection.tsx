import RotateCcw from 'lucide-react/icons/rotate-ccw';
import { PRIORITIES } from '$constants/priority';
import { useSettingsStore } from '$context/settingsContext';
import { defaultState } from '$context/settingsDefaults';

export const TaskDefaultsSettingsPrioritySection = () => {
  const { defaultPriority, setDefaultPriority } = useSettingsStore();

  const handleReset = () => {
    setDefaultPriority(defaultState.defaultPriority);
  };

  const hasChanged = defaultPriority !== defaultState.defaultPriority;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">Priority</h4>
        {hasChanged && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-surface-500 text-xs outline-hidden transition-colors hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
            Default priority
          </p>
          <div className="flex gap-2">
            {PRIORITIES.map((priority) => (
              <button
                type="button"
                key={priority.value}
                onClick={() => setDefaultPriority(priority.value)}
                aria-pressed={defaultPriority === priority.value}
                className={`flex-1 rounded-lg border px-3 py-2 font-medium text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
                  defaultPriority === priority.value
                    ? `${priority.borderColor} ${priority.bgColor} text-surface-900 dark:text-surface-100`
                    : `border-surface-300 text-surface-600 ${priority.hoverBorderColor} hover:bg-surface-50 hover:text-surface-700 dark:border-surface-600 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-300`
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
