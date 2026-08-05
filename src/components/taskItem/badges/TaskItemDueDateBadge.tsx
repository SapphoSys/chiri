import Clock from 'lucide-react/icons/clock';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { formatDueDate } from '$utils/date';

interface TaskItemDueDateBadgeProps {
  dueDate: Date | undefined;
}

export const TaskItemDueDateBadge = ({ dueDate }: TaskItemDueDateBadgeProps) => {
  if (!dueDate) return null;
  const display = formatDueDate(dueDate);
  if (!display) return null;

  return (
    <TaskItemBadge tone={display.tone}>
      <Clock className="h-3 w-3" />
      {display.text}
    </TaskItemBadge>
  );
};
