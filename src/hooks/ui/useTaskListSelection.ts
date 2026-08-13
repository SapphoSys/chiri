import { type MouseEvent, useCallback, useEffect, useMemo } from 'react';
import { useTaskSelection } from '$context/taskSelectionContext';
import { useSetEditorOpen, useSetSelectedTask, useUIState } from '$hooks/queries/useUIState';
import type { Task } from '$types/task/model';

interface UseTaskListSelectionOptions {
  visibleTasks: ReadonlyArray<Pick<Task, 'id'>>;
}

export const useTaskListSelection = ({ visibleTasks }: UseTaskListSelectionOptions) => {
  const { data: uiState } = useUIState();
  const setSelectedTaskMutation = useSetSelectedTask();
  const setEditorOpenMutation = useSetEditorOpen();
  const { selectedTaskIds, selectedTaskIdSet, anchorTaskId, setSelection, clearSelection } =
    useTaskSelection();

  const selectedTaskId = uiState?.selectedTaskId ?? null;
  const isEditorOpen = uiState?.isEditorOpen ?? false;
  const isSelectionMode = selectedTaskIds.length > 0;

  const visibleTaskIds = useMemo(
    () => visibleTasks.map((visibleTask) => visibleTask.id),
    [visibleTasks],
  );

  useEffect(() => {
    if (selectedTaskIds.length === 0) return;

    const visibleTaskIdSet = new Set(visibleTaskIds);
    const nextSelectedTaskIds = selectedTaskIds.filter((taskId) => visibleTaskIdSet.has(taskId));
    if (nextSelectedTaskIds.length !== selectedTaskIds.length) {
      setSelection(
        nextSelectedTaskIds,
        nextSelectedTaskIds.includes(anchorTaskId ?? '') ? anchorTaskId : null,
      );
    }
  }, [anchorTaskId, selectedTaskIds, setSelection, visibleTaskIds]);

  const handleSingleTaskClick = useCallback(
    (task: Task) => {
      clearSelection();

      if (selectedTaskId === task.id && isEditorOpen) {
        setEditorOpenMutation.mutate(false);
        return;
      }

      setSelectedTaskMutation.mutate(task.id);
    },
    [clearSelection, isEditorOpen, selectedTaskId, setEditorOpenMutation, setSelectedTaskMutation],
  );

  const selectTaskWithModifiers = useCallback(
    (task: Task, e: MouseEvent, toggleWithoutModifier = false) => {
      const isRangeSelection = e.shiftKey;
      const isToggleSelection = e.metaKey || e.ctrlKey;
      const shouldToggleSelection = toggleWithoutModifier || isToggleSelection;

      e.preventDefault();
      e.stopPropagation();
      setEditorOpenMutation.mutate(false);

      if (isRangeSelection) {
        const anchorId =
          anchorTaskId ?? selectedTaskIds[selectedTaskIds.length - 1] ?? selectedTaskId ?? task.id;
        const anchorIndex = visibleTaskIds.indexOf(anchorId);
        const taskIndex = visibleTaskIds.indexOf(task.id);

        if (anchorIndex === -1 || taskIndex === -1) {
          setSelection([task.id], task.id);
          return;
        }

        const [start, end] =
          anchorIndex < taskIndex ? [anchorIndex, taskIndex] : [taskIndex, anchorIndex];
        const rangeTaskIds = visibleTaskIds.slice(start, end + 1);
        setSelection(
          isToggleSelection ? [...selectedTaskIds, ...rangeTaskIds] : rangeTaskIds,
          anchorId,
        );
        return;
      }

      if (!shouldToggleSelection) {
        return;
      }

      const baseTaskIds =
        selectedTaskIds.length > 0
          ? selectedTaskIds
          : selectedTaskId !== null
            ? [selectedTaskId]
            : [];
      const nextSelectedTaskIds = selectedTaskIdSet.has(task.id)
        ? baseTaskIds.filter((taskId) => taskId !== task.id)
        : [...baseTaskIds, task.id];

      setSelection(nextSelectedTaskIds, task.id);
    },
    [
      anchorTaskId,
      selectedTaskId,
      selectedTaskIdSet,
      selectedTaskIds,
      setEditorOpenMutation,
      setSelection,
      visibleTaskIds,
    ],
  );

  const handleTaskClick = useCallback(
    (task: Task, e: MouseEvent) => {
      const isSelectionGesture = e.shiftKey || e.metaKey || e.ctrlKey;
      if (isSelectionMode) {
        selectTaskWithModifiers(task, e, true);
        return;
      }

      if (!isSelectionGesture) {
        handleSingleTaskClick(task);
        return;
      }

      selectTaskWithModifiers(task, e);
    },
    [handleSingleTaskClick, isSelectionMode, selectTaskWithModifiers],
  );

  const handleSelectionCheckboxClick = useCallback(
    (task: Task, e: MouseEvent) => {
      selectTaskWithModifiers(task, e, true);
    },
    [selectTaskWithModifiers],
  );

  const handleTaskContextMenu = useCallback(
    (task: Task) => {
      if (selectedTaskIds.length > 0 && !selectedTaskIdSet.has(task.id)) {
        setSelection([task.id], task.id);
      }
    },
    [selectedTaskIdSet, selectedTaskIds.length, setSelection],
  );

  return {
    clearSelection,
    handleSelectionCheckboxClick,
    handleTaskClick,
    handleTaskContextMenu,
    isSelectionMode,
    selectedTaskIdSet,
  };
};
