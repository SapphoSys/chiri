import ChevronDown from 'lucide-react/icons/chevron-down';
import ChevronRight from 'lucide-react/icons/chevron-right';
import type { MouseEvent } from 'react';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { pluralize } from '$utils/misc';

export const TaskItemCollapseButtonBadge = ({
  isCollapsed,
  childCount,
  onToggleCollapsed,
}: {
  isCollapsed: boolean;
  childCount: number;
  onToggleCollapsed: (e: MouseEvent) => void;
}) => (
  <TaskItemBadge className="collapse-button gap-0.5" onClick={onToggleCollapsed}>
    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
    <span>
      {childCount} {pluralize(childCount, 'subtask')}
    </span>
  </TaskItemBadge>
);
