import { useUIState } from '$hooks/queries/useUIState';
import type { Task } from '$types/task/model';

export const useVisibleEditorTask = (tasks: Task[]) => {
  const { data: uiState } = useUIState();
  const isEditorOpen = uiState?.isEditorOpen ?? false;
  const selectedTaskId = uiState?.selectedTaskId ?? null;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  return isEditorOpen ? selectedTask : null;
};
