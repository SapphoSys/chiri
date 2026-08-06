import Clock from 'lucide-react/icons/clock';
import type { MouseEvent } from 'react';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { formatDueDate } from '$utils/date';

interface TaskItemDueDateBadgeProps {
  dueDate: Date | undefined;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const TaskItemDueDateBadge = ({ dueDate, onClick }: TaskItemDueDateBadgeProps) => {
  if (!dueDate) return null;
  const display = formatDueDate(dueDate);
  if (!display) return null;

  return (
    <TaskItemBadge
      tone={display.tone}
      tooltip={onClick ? `Edit due date: ${display.text}` : `Due: ${display.text}`}
      ariaLabel={onClick ? `Edit due date: ${display.text}` : undefined}
      onClick={
        onClick
          ? (event) => {
              event.stopPropagation();
              onClick(event);
            }
          : undefined
      }
    >
      <Clock className="h-3 w-3" />
      {display.text}
    </TaskItemBadge>
  );
};
