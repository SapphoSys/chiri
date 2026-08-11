import RotateCcw from 'lucide-react/icons/rotate-ccw';
import Trash2 from 'lucide-react/icons/trash-2';
import X from 'lucide-react/icons/x';
import { Tooltip } from '$components/Tooltip';

interface TaskEditorHeaderProps {
  onDelete: () => void;
  onClose: () => void;
  isDeleted?: boolean;
  isSubtask?: boolean;
  onRestore?: () => void;
  onDeletePermanently?: () => void;
}

export const TaskEditorHeader = ({
  onDelete,
  onClose,
  isDeleted = false,
  isSubtask = false,
  onRestore,
  onDeletePermanently,
}: TaskEditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-surface-200 border-b p-4 dark:border-surface-700">
      <h2 className="font-semibold text-lg text-surface-800 dark:text-surface-200">
        {isDeleted ? 'Recently deleted' : isSubtask ? 'Edit subtask' : 'Edit task'}
      </h2>
      <div className="flex items-center gap-2">
        {isDeleted ? (
          <>
            <Tooltip content="Restore" position="bottom">
              <button
                type="button"
                onClick={onRestore}
                className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:hover:bg-surface-800 dark:hover:text-surface-300"
                aria-label="Restore task"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </Tooltip>

            <Tooltip content="Delete permanently" position="bottom">
              <button
                type="button"
                onClick={onDeletePermanently}
                className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-semantic-error/10 hover:text-semantic-error focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset"
                aria-label="Delete task permanently"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </Tooltip>
          </>
        ) : (
          <Tooltip content="Delete" position="bottom">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-semantic-error/10 hover:text-semantic-error focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset"
              aria-label="Delete task"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        <Tooltip content="Close" position="bottom">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:hover:bg-surface-800 dark:hover:text-surface-300"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
