import BellOff from 'lucide-react/icons/bell-off';
import X from 'lucide-react/icons/x';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { useTaskSnooze } from '$lib/notifications/snoozes';
import { formatTime } from '$utils/date';

export const TaskItemSnoozedBadge = ({ taskId }: { taskId: string }) => {
  const { until, clear } = useTaskSnooze(taskId);

  if (!until || until <= Date.now()) return null;

  return (
    <TaskItemBadge
      tone="info"
      tooltip={`Snoozed until ${formatTime(new Date(until))}. Use the close button to cancel.`}
    >
      <BellOff className="h-3 w-3" />
      Snoozed until {formatTime(new Date(until))}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          clear();
        }}
        className="ml-0.5 rounded outline-hidden hover:bg-semantic-info/20 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset"
        aria-label="Cancel snooze"
      >
        <X className="h-3 w-3" />
      </button>
    </TaskItemBadge>
  );
};
