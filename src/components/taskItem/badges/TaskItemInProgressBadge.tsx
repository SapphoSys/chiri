import Timer from 'lucide-react/icons/timer';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';

export const TaskItemInProgressBadge = ({ percentComplete }: { percentComplete?: number }) => (
  <TaskItemBadge
    tone="in-process"
    tooltip={`In progress: ${percentComplete ?? 'unknown'}% complete`}
  >
    <Timer className="h-3 w-3" />
    {percentComplete}%
  </TaskItemBadge>
);
