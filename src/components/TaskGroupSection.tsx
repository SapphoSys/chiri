import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ChevronDown from 'lucide-react/icons/chevron-down';
import type { MouseEvent, Ref } from 'react';
import { TaskItem } from '$components/taskItem/TaskItem';
import type { VisibleTaskGroup } from '$hooks/queries/useVisibleTasks';
import type { Task } from '$types/task/model';
import { pluralize } from '$utils/misc';
import { getSortableItemKey } from '$utils/sortable';

interface TaskGroupSectionProps {
  group: VisibleTaskGroup;
  visibleTaskIds: ReadonlySet<string>;
  dragBoundsRef?: Ref<HTMLDivElement>;
  showHeader: boolean;
  isCollapsed: boolean;
  isDragEnabled: boolean;
  isSelectionMode: boolean;
  selectedTaskIdSet: ReadonlySet<string>;
  onTaskClick: (task: Task, event: MouseEvent) => void;
  onSelectionCheckboxClick: (task: Task, event: MouseEvent) => void;
  onTaskContextMenu: (task: Task, event: MouseEvent) => void;
  onToggleCollapsed: () => void;
}

export const TaskGroupSection = ({
  group,
  visibleTaskIds,
  dragBoundsRef,
  showHeader,
  isCollapsed,
  isDragEnabled,
  isSelectionMode,
  selectedTaskIdSet,
  onTaskClick,
  onSelectionCheckboxClick,
  onTaskContextMenu,
  onToggleCollapsed,
}: TaskGroupSectionProps) => {
  const tasks = group.tasks.filter((task) => visibleTaskIds.has(task.id));
  if (tasks.length === 0 && !isCollapsed) return null;
  const taskCount = group.tasks.length;

  return (
    <section className="space-y-1.5" aria-label={showHeader ? group.label : undefined}>
      {showHeader && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!isCollapsed}
          className="flex w-full items-center gap-2 rounded px-1 pb-1 text-left outline-hidden hover:text-surface-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:text-surface-100"
        >
          <ChevronDown
            className={`h-4 w-4 text-surface-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
          />
          <span className="font-medium text-sm text-surface-600 dark:text-surface-400">
            {group.label}
          </span>
          <span className="text-surface-400 text-xs dark:text-surface-500">
            {taskCount} {pluralize(taskCount, 'task')}
          </span>
        </button>
      )}

      {!isCollapsed && (
        <div ref={dragBoundsRef} className="space-y-1.5">
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
            disabled={!isDragEnabled}
          >
            {tasks.map((task) => (
              <TaskItem
                key={getSortableItemKey(task.id, task.parentUid)}
                task={task}
                depth={task.depth}
                ancestorIds={task.ancestorIds}
                isDragEnabled={isDragEnabled && !isSelectionMode}
                isMultiSelected={selectedTaskIdSet.has(task.id)}
                isSelectionMode={isSelectionMode}
                hideDueDateBadge={
                  group.key.startsWith('due-date:') &&
                  group.key !== 'due-date:overdue' &&
                  !task.parentUid
                }
                hideStartDateBadge={group.key.startsWith('start-date:') && !task.parentUid}
                hideCalendarBadge={group.key.startsWith('calendar:')}
                onTaskClick={onTaskClick}
                onSelectionCheckboxClick={onSelectionCheckboxClick}
                onTaskContextMenu={onTaskContextMenu}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </section>
  );
};
