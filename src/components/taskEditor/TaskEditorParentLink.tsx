import CornerDownRight from 'lucide-react/icons/corner-down-right';
import type { Task } from '$types/task/model';

interface TaskEditorParentLinkProps {
  parentTask: Pick<Task, 'id' | 'title'>;
  onNavigate: () => void;
}

export const TaskEditorParentLink = ({ parentTask, onNavigate }: TaskEditorParentLinkProps) => (
  <button
    type="button"
    onClick={onNavigate}
    className="-mt-3 flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left text-surface-500 text-xs transition-colors hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
    title={`Go to parent task: ${parentTask.title || 'Untitled task'}`}
  >
    <CornerDownRight className="h-3 w-3 shrink-0" />
    <span className="truncate">
      Subtask of{' '}
      <span className="font-medium text-surface-600 dark:text-surface-300">
        {parentTask.title || 'Untitled task'}
      </span>
    </span>
  </button>
);
