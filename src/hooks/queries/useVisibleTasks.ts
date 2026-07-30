import { useMemo } from 'react';
import { DEFAULT_SORT_CONFIG, DEFAULT_TASK_GROUP_CONFIG } from '$constants';
import { useFilteredTasks } from '$hooks/queries/useTasks';
import { useUIState } from '$hooks/queries/useUIState';
import { getSortedTasks } from '$lib/filters';
import { groupTasks, type TaskGroup } from '$lib/grouping';
import { dataStore } from '$lib/store';
import { getChildTasks } from '$lib/store/tasks';
import type { SortConfig, TaskGroupConfig } from '$types/sort';
import type { UIState } from '$types/store/state';
import type { FlattenedTask } from '$types/store/tasks';
import type { Task } from '$types/task/model';
import { flattenTasks } from '$utils/sortable';

interface VisibleTasksOptions {
  activeView: UIState['activeView'];
  filteredTasks: Task[];
  showCompletedTasks: boolean;
  moveCompletedTasksToBottom: boolean;
  sortConfig: SortConfig;
  taskGroupConfig?: TaskGroupConfig;
  calendarNames?: ReadonlyMap<string, string>;
}

export type VisibleTaskGroup = TaskGroup<FlattenedTask>;

export const getVisibleTaskGroups = ({
  activeView,
  filteredTasks,
  showCompletedTasks,
  moveCompletedTasksToBottom,
  sortConfig,
  taskGroupConfig = DEFAULT_TASK_GROUP_CONFIG,
  calendarNames,
}: VisibleTasksOptions) => {
  const visibleTaskUids = new Set(filteredTasks.map((task) => task.uid));
  const topLevelTasks = filteredTasks.filter(
    (task) => !task.parentUid || !visibleTaskUids.has(task.parentUid),
  );
  const sortedTopLevel = getSortedTasks(topLevelTasks, sortConfig, moveCompletedTasksToBottom);

  const getFilteredChildTasks = (parentUid: string) => {
    const children = getChildTasks(
      parentUid,
      activeView === 'recently-deleted' ? 'deleted' : 'active',
    );
    if (!showCompletedTasks) {
      return children.filter((task) => task.status !== 'completed' && task.status !== 'cancelled');
    }
    return children;
  };

  return groupTasks(
    sortedTopLevel,
    taskGroupConfig.mode,
    calendarNames,
    moveCompletedTasksToBottom,
    taskGroupConfig.direction,
  ).map((group) => ({
    ...group,
    tasks: flattenTasks(group.tasks, getFilteredChildTasks, (tasks) =>
      getSortedTasks(tasks, sortConfig, moveCompletedTasksToBottom),
    ),
  }));
};

export const getVisibleTasks = (options: VisibleTasksOptions) => {
  return getVisibleTaskGroups(options).flatMap((group) => group.tasks);
};

const getCalendarNames = () => {
  const calendarNames = new Map<string, string>();
  for (const account of dataStore.load().accounts) {
    for (const calendar of account.calendars) {
      calendarNames.set(calendar.id, calendar.displayName);
    }
  }
  return calendarNames;
};

export const useVisibleTaskGroups = () => {
  const { data: uiState } = useUIState();
  const { data: filteredTasks = [] } = useFilteredTasks();

  const sortConfig = uiState?.sortConfig ?? DEFAULT_SORT_CONFIG;
  const taskGroupConfig = uiState?.taskGroupConfig ?? DEFAULT_TASK_GROUP_CONFIG;
  const showCompletedTasks = uiState?.showCompletedTasks ?? true;
  const moveCompletedTasksToBottom = uiState?.moveCompletedTasksToBottom ?? false;
  const activeView = uiState?.activeView ?? 'tasks';

  return useMemo(() => {
    return getVisibleTaskGroups({
      activeView,
      filteredTasks,
      showCompletedTasks,
      moveCompletedTasksToBottom,
      sortConfig,
      taskGroupConfig,
      calendarNames: getCalendarNames(),
    });
  }, [
    activeView,
    filteredTasks,
    moveCompletedTasksToBottom,
    showCompletedTasks,
    sortConfig,
    taskGroupConfig,
  ]);
};

export const useVisibleTasks = () => {
  const groups = useVisibleTaskGroups();
  return useMemo(() => groups.flatMap((group) => group.tasks), [groups]);
};
