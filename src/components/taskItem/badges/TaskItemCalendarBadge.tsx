import type { MouseEvent } from 'react';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { getIconByName } from '$constants/icons';
import type { Calendar } from '$types/calendar';

export const TaskItemCalendarBadge = ({
  calendar,
  calendarColor,
  onCalendarClick,
  readOnly = false,
}: {
  calendar: Calendar;
  calendarColor: string;
  onCalendarClick: (calendarId: string, event: MouseEvent) => void;
  readOnly?: boolean;
}) => {
  const CalendarIcon = getIconByName(calendar.icon || 'calendar');
  const content = (
    <>
      {calendar.emoji ? (
        <span className="text-xs leading-none">{calendar.emoji}</span>
      ) : (
        <CalendarIcon className="h-3 w-3" />
      )}
      {calendar.displayName || 'Calendar'}
    </>
  );

  if (readOnly) {
    return (
      <TaskItemBadge
        color={calendarColor}
        className="cursor-not-allowed"
        tooltip={`Calendar: ${calendar.displayName || 'Calendar'}`}
      >
        {content}
      </TaskItemBadge>
    );
  }

  return (
    <TaskItemBadge
      color={calendarColor}
      tooltip={`Open calendar: ${calendar.displayName || 'Calendar'}`}
      onClick={(e) => {
        e.stopPropagation();
        onCalendarClick(calendar.id, e);
      }}
    >
      {content}
    </TaskItemBadge>
  );
};
