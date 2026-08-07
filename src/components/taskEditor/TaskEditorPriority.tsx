import Flag from 'lucide-react/icons/flag';
import { PRIORITIES } from '$constants/priority';
import { useUpdateTask } from '$hooks/queries/useTasks';
import type { Priority, Task } from '$types/task/model';

interface PriorityProps {
  task: Task;
  readOnly?: boolean;
}

export const TaskEditorPriority = ({ task, readOnly = false }: PriorityProps) => {
  const updateTaskMutation = useUpdateTask();

  const handlePriorityChange = (priority: Priority) => {
    updateTaskMutation.mutate({ id: task.id, updates: { priority } });
  };

  return (
    <div>
      <div
        id="priority-label"
        className="mb-2 flex items-center gap-2 font-medium text-sm text-surface-600 dark:text-surface-400"
      >
        <Flag className="h-4 w-4" />
        Priority
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: fieldset would change semantic structure; div with role="group" is appropriate here */}
      <div className="flex gap-2" role="group" aria-labelledby="priority-label">
        {PRIORITIES.map((p) => (
          <button
            type="button"
            key={p.value}
            onClick={() => handlePriorityChange(p.value)}
            disabled={readOnly}
            className={`flex-1 rounded-lg border px-3 py-2 font-medium text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
              task.priority === p.value
                ? `${p.borderColor} ${p.bgColor} text-surface-900 dark:text-surface-100`
                : `border-surface-200 text-surface-600 dark:border-surface-700 dark:text-surface-400 ${readOnly ? 'opacity-60' : `${p.hoverBorderColor} hover:bg-surface-50 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300`}`
            }
              ${readOnly ? 'cursor-not-allowed' : ''}
            `}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
