import type { Status, Task } from '$types/task/model';

type CurrentTaskState = Pick<Task, 'percentComplete' | 'completedAt'>;

export const getPercentCompleteForStatus = (
  status: Status,
  currentPercentComplete?: number,
): number | undefined => {
  if (status === 'completed') return 100;
  if (status === 'in-process') {
    return currentPercentComplete !== undefined &&
      currentPercentComplete >= 1 &&
      currentPercentComplete <= 99
      ? currentPercentComplete
      : 1;
  }
  if (status === 'cancelled') return currentPercentComplete;
  return 0;
};

export const getNewTaskPercentComplete = (
  taskStatus: Status | undefined,
  taskPercentComplete: number | undefined,
  defaultStatus: Status,
  defaultPercentComplete: number,
) =>
  taskPercentComplete ??
  (taskStatus === undefined
    ? (getPercentCompleteForStatus(defaultStatus, defaultPercentComplete) ?? 0)
    : defaultPercentComplete);

export const buildStatusUpdates = (
  status: Status,
  current: CurrentTaskState,
  now = new Date(),
): Pick<Task, 'status' | 'completed' | 'completedAt' | 'percentComplete'> => ({
  status,
  completed: status === 'completed',
  completedAt: status === 'completed' ? (current.completedAt ?? now) : undefined,
  percentComplete: getPercentCompleteForStatus(status, current.percentComplete),
});

export const buildProgressUpdates = (
  percentComplete: number,
  current: CurrentTaskState,
  now = new Date(),
): Pick<Task, 'status' | 'completed' | 'completedAt' | 'percentComplete'> => {
  const normalizedPercent = Math.max(0, Math.min(100, percentComplete));
  const status: Status =
    normalizedPercent === 100
      ? 'completed'
      : normalizedPercent >= 1
        ? 'in-process'
        : 'needs-action';

  return {
    ...buildStatusUpdates(status, current, now),
    percentComplete: normalizedPercent,
  };
};
