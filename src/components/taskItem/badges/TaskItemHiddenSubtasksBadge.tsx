import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { pluralize } from '$utils/misc';

export const TaskItemHiddenSubtasksBadge = ({ count }: { count: number }) => (
  <TaskItemBadge>
    {count} hidden {pluralize(count, 'subtask')}
  </TaskItemBadge>
);
