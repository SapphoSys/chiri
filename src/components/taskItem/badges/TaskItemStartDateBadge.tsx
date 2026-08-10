import CalendarClock from 'lucide-react/icons/calendar-clock';
import type { MouseEvent } from 'react';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import type { formatStartDate } from '$utils/date';

export const TaskItemStartDateBadge = ({
  startDateDisplay,
  onClick,
}: {
  startDateDisplay: ReturnType<typeof formatStartDate>;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) => (
  <TaskItemBadge
    color={startDateDisplay.color}
    tooltip={
      onClick ? `Edit start date: ${startDateDisplay.text}` : `Starts: ${startDateDisplay.text}`
    }
    ariaLabel={onClick ? `Edit start date: ${startDateDisplay.text}` : undefined}
    onClick={
      onClick
        ? (event) => {
            event.stopPropagation();
            onClick(event);
          }
        : undefined
    }
  >
    <CalendarClock className="h-3 w-3" />
    {startDateDisplay.text}
  </TaskItemBadge>
);
