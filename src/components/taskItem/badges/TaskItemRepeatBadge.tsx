import RefreshCw from 'lucide-react/icons/refresh-cw';
import type { MouseEvent } from 'react';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { rruleToDisplaySummary, rruleToText } from '$lib/task/recurrence';
import type { DateFormat } from '$types/settings/categories/region';

export const TaskItemRepeatBadge = ({
  rrule,
  repeatFrom,
  dateFormat,
  onClick,
}: {
  rrule: string;
  repeatFrom?: number;
  dateFormat?: DateFormat;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) => {
  const fullSummary = rruleToText(rrule, repeatFrom, dateFormat);
  const { short } = rruleToDisplaySummary(rrule, repeatFrom, dateFormat);

  const content = (
    <>
      <RefreshCw className="h-3 w-3 shrink-0" />
      <span className="truncate">{short}</span>
    </>
  );

  if (!onClick) {
    return (
      <TaskItemBadge tooltip={`Repeat: ${fullSummary}`} className="max-w-36">
        {content}
      </TaskItemBadge>
    );
  }

  return (
    <TaskItemBadge
      tooltip={`Repeat: ${fullSummary}`}
      ariaLabel={`Edit repeat rule: ${fullSummary}`}
      className="max-w-36"
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
    >
      {content}
    </TaskItemBadge>
  );
};
