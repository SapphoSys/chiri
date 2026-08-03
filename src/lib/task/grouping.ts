import { format, isToday, isTomorrow, startOfDay } from 'date-fns';
import type { SortDirection, TaskGroupMode } from '$types/sort';
import type { Task } from '$types/task/model';

export interface TaskGroup<T extends Task = Task> {
  key: string;
  label: string;
  tasks: T[];
  defaultCollapsed?: boolean;
}

interface GroupDetails {
  key: string;
  label: string;
  order: number;
  defaultCollapsed?: boolean;
}

const getTerminalGroupLabel = (hasCompleted: boolean, hasCancelled: boolean) => {
  if (hasCompleted && hasCancelled) return 'Completed & Cancelled';
  if (hasCancelled) return 'Cancelled';
  return 'Completed';
};

const STATUS_GROUPS: Record<Task['status'], GroupDetails> = {
  'needs-action': { key: 'status:needs-action', label: 'Needs Action', order: 0 },
  'in-process': { key: 'status:in-process', label: 'In Process', order: 1 },
  completed: { key: 'status:completed', label: 'Completed', order: 2 },
  cancelled: { key: 'status:cancelled', label: 'Cancelled', order: 3 },
};

const PRIORITY_GROUPS: Record<Task['priority'], GroupDetails> = {
  high: { key: 'priority:high', label: 'High Priority', order: 0 },
  medium: { key: 'priority:medium', label: 'Medium Priority', order: 1 },
  low: { key: 'priority:low', label: 'Low Priority', order: 2 },
  none: { key: 'priority:none', label: 'No Priority', order: 3 },
};

const getDateLabel = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMM d, yyyy');
};

const getDateGroup = (
  date: Date | undefined,
  mode: Extract<TaskGroupMode, 'due-date' | 'start-date' | 'created' | 'modified'>,
): GroupDetails => {
  const noDateLabel =
    mode === 'due-date' ? 'No Due Date' : mode === 'start-date' ? 'No Start Date' : 'No Date';
  if (!date) return { key: `${mode}:none`, label: noDateLabel, order: Number.MAX_SAFE_INTEGER };

  const day = startOfDay(new Date(date));
  if (mode === 'due-date' && day < startOfDay(new Date())) {
    return { key: 'due-date:overdue', label: 'Overdue', order: Number.NEGATIVE_INFINITY };
  }

  return {
    key: `${mode}:${format(day, 'yyyy-MM-dd')}`,
    label: getDateLabel(day),
    order: day.getTime(),
  };
};

const getGroupDetails = (
  task: Task,
  mode: TaskGroupMode,
  calendarNames: ReadonlyMap<string, string>,
  completedAtBottom: boolean,
): GroupDetails => {
  if (
    completedAtBottom &&
    mode !== 'none' &&
    mode !== 'status' &&
    (task.status === 'completed' || task.status === 'cancelled')
  ) {
    return {
      key: 'completed',
      label: 'Completed',
      order: Number.POSITIVE_INFINITY,
      defaultCollapsed: true,
    };
  }

  switch (mode) {
    case 'status':
      return STATUS_GROUPS[task.status];
    case 'priority':
      return PRIORITY_GROUPS[task.priority];
    case 'calendar': {
      const label = calendarNames.get(task.calendarId) ?? 'Unknown Calendar';
      return { key: `calendar:${task.calendarId || 'unknown'}`, label, order: 0 };
    }
    case 'due-date':
      return getDateGroup(task.dueDate, mode);
    case 'start-date':
      return getDateGroup(task.startDate, mode);
    case 'created':
      return getDateGroup(task.createdAt, mode);
    case 'modified':
      return getDateGroup(task.modifiedAt, mode);
    case 'none':
      return { key: 'all', label: '', order: 0 };
  }
};

/**
 * Groups already-sorted root tasks without splitting their descendant trees.
 */
export const groupTasks = <T extends Task>(
  tasks: T[],
  mode: TaskGroupMode,
  calendarNames: ReadonlyMap<string, string> = new Map(),
  completedAtBottom = false,
  direction: SortDirection = 'asc',
): TaskGroup<T>[] => {
  const groups = new Map<
    string,
    TaskGroup<T> & { order: number; hasCompletedTask?: boolean; hasCancelledTask?: boolean }
  >();

  for (const task of tasks) {
    const { key, label, order, defaultCollapsed } = getGroupDetails(
      task,
      mode,
      calendarNames,
      completedAtBottom,
    );
    const isCompletedTask = task.status === 'completed';
    const isCancelledTask = task.status === 'cancelled';
    const group = groups.get(key);
    if (group) {
      group.tasks.push(task);
      group.hasCompletedTask ||= isCompletedTask;
      group.hasCancelledTask ||= isCancelledTask;
      if (key === 'completed') {
        group.label = getTerminalGroupLabel(!!group.hasCompletedTask, !!group.hasCancelledTask);
      }
    } else {
      groups.set(key, {
        key,
        label:
          key === 'completed' ? getTerminalGroupLabel(isCompletedTask, isCancelledTask) : label,
        order,
        defaultCollapsed,
        tasks: [task],
        hasCompletedTask: isCompletedTask,
        hasCancelledTask: isCancelledTask,
      });
    }
  }

  return [...groups.values()]
    .sort((a, b) => {
      if (a.key === 'completed') return 1;
      if (b.key === 'completed') return -1;
      const comparison = a.order - b.order || a.label.localeCompare(b.label);
      return direction === 'asc' ? comparison : -comparison;
    })
    .map((group) => ({
      key: group.key,
      label: group.label,
      tasks: group.tasks,
      defaultCollapsed: group.defaultCollapsed,
    }));
};
