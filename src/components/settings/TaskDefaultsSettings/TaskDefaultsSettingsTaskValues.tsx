import Ban from 'lucide-react/icons/ban';
import Check from 'lucide-react/icons/check';
import RotateCcw from 'lucide-react/icons/rotate-ccw';
import Timer from 'lucide-react/icons/timer';
import { PRIORITIES } from '$constants/priority';
import { useSettingsStore } from '$context/settingsContext';
import { defaultState } from '$context/settingsDefaults';
import { buildProgressUpdates, buildStatusUpdates } from '$lib/task/status';
import type { Status } from '$types/task/model';

const STATUS_OPTIONS = [
  {
    value: 'needs-action',
    label: 'Needs Action',
    Icon: RotateCcw,
    iconClass: 'text-status-needs-action',
    activeClass:
      'border-status-needs-action bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-100',
  },
  {
    value: 'in-process',
    label: 'In Process',
    Icon: Timer,
    iconClass: 'text-status-in-process',
    activeClass:
      'border-status-in-process bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-100',
  },
  {
    value: 'completed',
    label: 'Completed',
    Icon: Check,
    iconClass: 'text-status-completed',
    activeClass:
      'border-status-completed bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-100',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    Icon: Ban,
    iconClass: 'text-status-cancelled',
    activeClass:
      'border-status-cancelled bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-100',
  },
] as const;

export const TaskDefaultsSettingsTaskValues = () => {
  const {
    defaultPriority,
    setDefaultPriority,
    defaultStatus,
    setDefaultStatus,
    defaultPercentComplete,
    setDefaultPercentComplete,
    syncStatusProgress,
  } = useSettingsStore();

  const handleStatusChange = (status: Status) => {
    setDefaultStatus(status);
    if (syncStatusProgress) {
      const updates = buildStatusUpdates(status, { percentComplete: defaultPercentComplete });
      if (updates.percentComplete !== undefined) {
        setDefaultPercentComplete(updates.percentComplete);
      }
    }
  };

  const handlePercentChange = (percent: number) => {
    const updates = buildProgressUpdates(
      percent,
      { percentComplete: defaultPercentComplete },
      new Date(),
      syncStatusProgress,
    );
    if (updates.status !== undefined) {
      setDefaultStatus(updates.status);
    }
    setDefaultPercentComplete(updates.percentComplete ?? percent);
  };

  const handleReset = () => {
    setDefaultStatus(defaultState.defaultStatus);
    setDefaultPriority(defaultState.defaultPriority);
    const resetPercent = defaultState.defaultPercentComplete;
    setDefaultPercentComplete(resetPercent);
  };

  const hasChanged =
    defaultStatus !== defaultState.defaultStatus ||
    defaultPriority !== defaultState.defaultPriority ||
    defaultPercentComplete !== defaultState.defaultPercentComplete;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">
          Task values
        </h4>
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

      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">Status</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map(({ value, label, Icon, iconClass, activeClass }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleStatusChange(value as Status)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-medium text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
                  defaultStatus === value
                    ? activeClass
                    : 'border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50 dark:border-surface-600 dark:text-surface-400 dark:hover:bg-surface-700'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${defaultStatus === value ? iconClass : ''}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-surface-200 border-t dark:border-surface-700" />

        <div className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-medium text-surface-500 text-xs dark:text-surface-400">Progress</p>
            <span className="font-medium text-surface-600 text-xs dark:text-surface-400">
              {defaultPercentComplete}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={defaultPercentComplete}
            style={{ '--pct': `${defaultPercentComplete}%` } as React.CSSProperties}
            onChange={(e) => handlePercentChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between">
            <span className="text-surface-400 text-xs">0%</span>
            <span className="text-surface-400 text-xs">100%</span>
          </div>
        </div>

        <div className="border-surface-200 border-t dark:border-surface-700" />

        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
            Priority
          </p>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => setDefaultPriority(p.value)}
                className={`flex-1 rounded-lg border px-3 py-2 font-medium text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
                  defaultPriority === p.value
                    ? `${p.borderColor} bg-surface-200 text-surface-900 dark:bg-surface-700 dark:text-surface-100`
                    : 'border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50 dark:border-surface-600 dark:text-surface-400 dark:hover:bg-surface-700'
                }`}
              >
                <span className={p.color}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
