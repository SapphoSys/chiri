import History from 'lucide-react/icons/history';
import { useState } from 'react';
import { TaskHistoryModal } from '$components/modals/TaskHistory/TaskHistoryModal';
import { Tooltip } from '$components/Tooltip';
import type { TimeFormat } from '$types/settings/categories/region';
import type { Task } from '$types/task/model';
import { formatDate, formatTime } from '$utils/date';

interface TaskEditorFooterProps {
  task: Task;
  timeFormat: TimeFormat;
}

export const TaskEditorFooter = ({ task, timeFormat }: TaskEditorFooterProps) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-surface-300 border-t p-4 text-surface-500 text-xs dark:border-surface-700 dark:text-surface-400">
        <div>
          <div>
            Created: {formatDate(new Date(task.createdAt), true)}{' '}
            {formatTime(new Date(task.createdAt), timeFormat)}
          </div>
          <div>
            Modified: {formatDate(new Date(task.modifiedAt), true)}{' '}
            {formatTime(new Date(task.modifiedAt), timeFormat)}
          </div>
          {task.completedAt && (
            <div>
              Completed: {formatDate(new Date(task.completedAt), true)}{' '}
              {formatTime(new Date(task.completedAt), timeFormat)}
            </div>
          )}
          {task.deletedAt && (
            <div>
              Deleted: {formatDate(new Date(task.deletedAt), true)}{' '}
              {formatTime(new Date(task.deletedAt), timeFormat)}
            </div>
          )}
        </div>
        <Tooltip content="History" position="top">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-600 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            aria-label="View task history"
          >
            <History className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>

      <TaskHistoryModal
        isOpen={showHistory}
        taskTitle={task.title}
        taskUid={task.uid}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
};
