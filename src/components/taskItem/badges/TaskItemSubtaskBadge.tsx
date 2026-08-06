import CheckCircle2 from 'lucide-react/icons/check-circle-2';
import ChevronDown from 'lucide-react/icons/chevron-down';
import ChevronRight from 'lucide-react/icons/chevron-right';
import type { MouseEvent } from 'react';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { pluralize } from '$utils/misc';

export const TaskItemSubtaskBadge = ({
  completed,
  total,
  isCollapsed,
  onToggleCollapsed,
}: {
  completed: number;
  total: number;
  isCollapsed: boolean;
  onToggleCollapsed: (e: MouseEvent) => void;
}) => (
  <TaskItemBadge
    className="gap-0.5"
    onClick={onToggleCollapsed}
    ariaLabel={isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
    title={isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
  >
    <CheckCircle2 className="h-3 w-3" />
    <span>
      {completed}/{total} {pluralize(total, 'subtask')}
    </span>
    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
  </TaskItemBadge>
);
