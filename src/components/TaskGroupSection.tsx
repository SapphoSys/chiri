import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CalendarSearch from 'lucide-react/icons/calendar-search';
import ChevronDown from 'lucide-react/icons/chevron-down';
import type { MouseEvent, Ref } from 'react';
import { Tooltip } from '$components/Tooltip';
import { TaskItem } from '$components/taskItem/TaskItem';
import { useSetActiveAccount, useSetActiveCalendar } from '$hooks/queries/useUIState';
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
  const setActiveAccountMutation = useSetActiveAccount();
  const setActiveCalendarMutation = useSetActiveCalendar();
  const taskCount = group.tasks.length;
  const calendarId = group.key.startsWith('calendar:')
    ? group.key.slice('calendar:'.length)
    : undefined;
  const calendarTask = calendarId
    ? group.tasks.find((task) => task.calendarId === calendarId)
    : undefined;
  const handleCalendarFilterClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (!calendarId || calendarId === 'unknown' || !calendarTask) return;
    setActiveAccountMutation.mutate(calendarTask.accountId);
    setActiveCalendarMutation.mutate(calendarId);
  };
  if (tasks.length === 0 && !isCollapsed) return null;

  return (
    <section className="space-y-1.5" aria-label={showHeader ? group.label : undefined}>
      {showHeader && (
        <div className="group flex w-full items-center gap-1 rounded pb-1">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!isCollapsed}
            className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 text-left outline-hidden hover:text-surface-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:text-surface-100"
          >
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-surface-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
            />
            <span className="truncate font-medium text-sm text-surface-600 dark:text-surface-400">
              {group.label}
            </span>
            <span className="shrink-0 text-surface-400 text-xs dark:text-surface-500">
              {taskCount} {pluralize(taskCount, 'task')}
            </span>
          </button>
          {calendarId && calendarId !== 'unknown' && calendarTask && (
            <Tooltip content="Go to this calendar" position="top" allowInModal>
              <button
                type="button"
                onClick={handleCalendarFilterClick}
                aria-label={`Go to ${group.label}`}
                className="flex size-7 shrink-0 items-center justify-center rounded text-surface-400 opacity-0 outline-hidden transition-opacity hover:bg-surface-100 hover:text-surface-700 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset group-hover:opacity-100 dark:hover:bg-surface-700 dark:hover:text-surface-200"
              >
                <CalendarSearch className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
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
