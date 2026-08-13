import AlignJustify from 'lucide-react/icons/align-justify';
import LayoutList from 'lucide-react/icons/layout-list';
import type { ReactNode } from 'react';
import { TaskListLayoutSettingsDensityPreview } from '$components/settings/TaskListLayoutSettings/TaskListLayoutSettingsDensityPreview';
import { useSettingsStore } from '$context/settingsContext';
import type { TaskListDensity, TaskTitleLines } from '$types/settings/categories/layout';

const DENSITY_OPTIONS: { value: TaskListDensity; label: string; icon: ReactNode }[] = [
  { value: 'comfortable', label: 'Comfortable', icon: <LayoutList className="h-4 w-4" /> },
  { value: 'compact', label: 'Compact', icon: <AlignJustify className="h-4 w-4" /> },
];

const TITLE_LINE_OPTIONS: { value: TaskTitleLines; label: string }[] = [
  { value: 'one', label: 'Single line' },
  { value: 'multiple', label: 'Multiple lines' },
];

const SWITCHER_CLASS =
  'flex flex-1 items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset';
const SWITCHER_ACTIVE =
  'border-surface-300 dark:border-surface-500 bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-100';
const SWITCHER_INACTIVE =
  'border-surface-300 dark:border-surface-700 hover:border-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400';
const INLINE_SWITCHER_CLASS =
  'flex items-center rounded-lg border px-3 py-1.5 text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset';
const INLINE_SWITCHER_ACTIVE =
  'border-surface-300 bg-surface-200 text-surface-900 dark:border-surface-500 dark:bg-surface-700 dark:text-surface-100';
const INLINE_SWITCHER_INACTIVE =
  'border-transparent bg-surface-100 text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:bg-surface-700/50 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-300';

export const TaskListLayoutSettings = () => {
  const { taskListDensity, setTaskListDensity, taskTitleLines, setTaskTitleLines } =
    useSettingsStore();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">
        List & layout
      </h3>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="p-4">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
            Task list density
          </p>
          <div className="flex gap-2">
            {DENSITY_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setTaskListDensity(option.value)}
                className={`${SWITCHER_CLASS} ${taskListDensity === option.value ? SWITCHER_ACTIVE : SWITCHER_INACTIVE}`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
          <TaskListLayoutSettingsDensityPreview
            density={taskListDensity}
            titleLines={taskTitleLines}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Task title wrapping</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              How task titles appear in the task list
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {TITLE_LINE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setTaskTitleLines(option.value)}
                className={`${INLINE_SWITCHER_CLASS} ${taskTitleLines === option.value ? INLINE_SWITCHER_ACTIVE : INLINE_SWITCHER_INACTIVE}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
