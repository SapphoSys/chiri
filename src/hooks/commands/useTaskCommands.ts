import { useCallback } from 'react';
import { useTaskSelection } from '$context/taskSelectionContext';
import { useTaskDeletion } from '$hooks/deletion/useTaskDeletion';
import { useCreateTask } from '$hooks/queries/useTasks';
import { useSetEditorOpen, useUIState } from '$hooks/queries/useUIState';
import { useVisibleTasks } from '$hooks/queries/useVisibleTasks';

export const useTaskCommands = () => {
  const createTaskMutation = useCreateTask('created', { selectCreatedTask: true });
  const { data: uiState } = useUIState();
  const { moveTaskToRecentlyDeleted } = useTaskDeletion();

  const { selectedTaskIds, setSelection, clearSelection } = useTaskSelection();
  const flattenedTasks = useVisibleTasks();
  const setEditorOpenMutation = useSetEditorOpen();

  const newTask = useCallback(() => {
    createTaskMutation.mutate({ title: '' });
  }, [createTaskMutation]);

  const deleteTask = useCallback(async () => {
    if (uiState?.activeView === 'recently-deleted') return;
    const selectedTaskId = uiState?.selectedTaskId ?? null;
    if (selectedTaskId) {
      await moveTaskToRecentlyDeleted(selectedTaskId);
    }
  }, [uiState?.activeView, uiState?.selectedTaskId, moveTaskToRecentlyDeleted]);

  const selectAll = useCallback(() => {
    if (flattenedTasks.length === 0) return;

    if (selectedTaskIds.length > 0) {
      clearSelection();
      return;
    }

    setEditorOpenMutation.mutate(false);
    setSelection(
      flattenedTasks.map((task) => task.id),
      flattenedTasks[0].id,
    );
  }, [clearSelection, flattenedTasks, selectedTaskIds.length, setEditorOpenMutation, setSelection]);

  return {
    newTask,
    deleteTask,
    selectAll,
  };
};
