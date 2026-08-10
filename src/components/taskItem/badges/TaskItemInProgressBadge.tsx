import Timer from 'lucide-react/icons/timer';
import type { MouseEvent } from 'react';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';

export const TaskItemInProgressBadge = ({
  percentComplete,
  onClick,
}: {
  percentComplete?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) => {
  const progress = `${percentComplete ?? 'unknown'}%`;

  return (
    <TaskItemBadge
      tone="in-process"
      tooltip={onClick ? `Edit progress: ${progress}` : `In progress: ${progress} complete`}
      ariaLabel={onClick ? `Edit progress: ${progress}` : undefined}
      onClick={
        onClick
          ? (event) => {
              event.stopPropagation();
              onClick(event);
            }
          : undefined
      }
    >
      <Timer className="h-3 w-3" />
      {progress}
    </TaskItemBadge>
  );
};
