import { isCompletedTask } from '$lib/task/filtering';
import type { SortConfig } from '$types/sort';
import type { Priority, Task } from '$types/task/model';

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

export const sortTasks = (
  tasks: Task[],
  sortConfig: SortConfig,
  moveCompletedTasksToBottom = false,
) => {
  const { mode, direction } = sortConfig;
  const multiplier = direction === 'asc' ? 1 : -1;

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (mode) {
      case 'manual':
      case 'smart':
        return (a.sortOrder - b.sortOrder) * multiplier;

      case 'due-date':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * multiplier;

      case 'start-date':
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * multiplier;

      case 'priority':
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * multiplier;

      case 'title':
        return a.title.localeCompare(b.title) * multiplier;

      case 'modified':
        return (new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()) * multiplier;

      case 'created':
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * multiplier;

      default:
        return 0;
    }
  });

  if (!moveCompletedTasksToBottom) return sortedTasks;

  return [
    ...sortedTasks.filter((task) => !isCompletedTask(task)),
    ...sortedTasks.filter(isCompletedTask),
  ];
};
