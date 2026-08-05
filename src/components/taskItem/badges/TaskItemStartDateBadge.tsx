import CalendarClock from 'lucide-react/icons/calendar-clock';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import type { formatStartDate } from '$utils/date';

export const TaskItemStartDateBadge = ({
  startDateDisplay,
}: {
  startDateDisplay: ReturnType<typeof formatStartDate>;
}) => (
  <TaskItemBadge color={startDateDisplay.color}>
    <CalendarClock className="h-3 w-3" />
    {startDateDisplay.text}
  </TaskItemBadge>
);
