import CheckCircle2 from 'lucide-react/icons/check-circle-2';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';

export const TaskItemSubtaskProgressBadge = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => (
  <TaskItemBadge>
    <CheckCircle2 className="h-3 w-3" />
    {completed}/{total}
  </TaskItemBadge>
);
