import { useCallback, useMemo } from 'react';
import { useTaskDeletion } from '$hooks/deletion/useTaskDeletion';
import {
  useAddReminder,
  useRemoveReminder,
  useRemoveTagFromTask,
  useRestoreTask,
  useUpdateReminder,
  useUpdateTask,
} from '$hooks/queries/useTasks';
import { useSetEditorOpen } from '$hooks/queries/useUIState';
import { resetStaleCursorOnLayerClose } from '$hooks/ui/useStaleCursorReset';
import { buildProgressUpdates, buildStatusUpdates } from '$lib/task/status';
import type { Account } from '$types/account';
import type { Status, Task } from '$types/task/model';

interface UseTaskEditorActionsOptions {
  task: Task;
  accounts: Account[];
  syncStatusProgress: boolean;
}

export interface TaskEditorActions {
  handleStatusChange: (status: Status) => void;
  commitPercentComplete: (value: number) => void;
  handleCalendarChange: (calendarId: string) => void;
  handleStartDateChange: (date: Date | undefined, allDay?: boolean) => void;
  handleDueDateChange: (date: Date | undefined, allDay?: boolean) => void;
  handleStartDateAllDayChange: (allDay: boolean) => void;
  handleDueDateAllDayChange: (allDay: boolean) => void;
  handleRepeatChange: (rrule: string | undefined, repeatFrom: number) => void;
  handleRemoveTag: (tagId: string) => void;
  handleRemoveReminder: (reminderId: string) => void;
  handleAddReminder: (date: Date) => void;
  handleUpdateReminder: (reminderId: string, date: Date) => void;
  handleClearReminder: (reminderId: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTaskToRecentlyDeleted: (id: string) => Promise<boolean>;
  handleDelete: () => Promise<void>;
  handleRestore: () => void;
  handlePermanentDelete: () => Promise<void>;
  handleClose: () => void;
}

export const useTaskEditorActions = ({
  task,
  accounts,
  syncStatusProgress,
}: UseTaskEditorActionsOptions): TaskEditorActions => {
  const updateTaskMutation = useUpdateTask();
  const setEditorOpenMutation = useSetEditorOpen();
  const removeTagFromTaskMutation = useRemoveTagFromTask();
  const addReminderMutation = useAddReminder();
  const removeReminderMutation = useRemoveReminder();
  const updateReminderMutation = useUpdateReminder();
  const restoreTaskMutation = useRestoreTask();
  const { moveTaskToRecentlyDeleted, deleteTaskPermanently } = useTaskDeletion();

  const allCalendars = useMemo(
    () =>
      accounts.flatMap((account) =>
        account.calendars.map((calendar) => ({ ...calendar, accountId: account.id })),
      ),
    [accounts],
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      updateTaskMutation.mutate({ id, updates });
    },
    [updateTaskMutation],
  );

  const handleStatusChange = useCallback(
    (status: Status) => {
      updateTaskMutation.mutate({
        id: task.id,
        updates: buildStatusUpdates(status, task, new Date(), syncStatusProgress),
      });
    },
    [syncStatusProgress, task, updateTaskMutation],
  );

  const commitPercentComplete = useCallback(
    (value: number) => {
      updateTaskMutation.mutate({
        id: task.id,
        updates: buildProgressUpdates(value, task, new Date(), syncStatusProgress),
      });
    },
    [syncStatusProgress, task, updateTaskMutation],
  );

  const handleCalendarChange = useCallback(
    (calendarId: string) => {
      const targetCalendar = allCalendars.find((calendar) => calendar.id === calendarId);
      if (!targetCalendar) return;

      const updates: Partial<Task> = {
        calendarId: targetCalendar.id,
        accountId: targetCalendar.accountId,
      };
      if (task.parentUid) updates.parentUid = undefined;
      updateTaskMutation.mutate({ id: task.id, updates });
    },
    [allCalendars, task, updateTaskMutation],
  );

  const handleStartDateChange = useCallback(
    (date: Date | undefined, allDay?: boolean) => {
      updateTaskMutation.mutate({
        id: task.id,
        updates: { startDate: date, startDateAllDay: allDay },
      });
    },
    [task.id, updateTaskMutation],
  );

  const handleDueDateChange = useCallback(
    (date: Date | undefined, allDay?: boolean) => {
      updateTaskMutation.mutate({
        id: task.id,
        updates: { dueDate: date, dueDateAllDay: allDay },
      });
    },
    [task.id, updateTaskMutation],
  );

  const handleStartDateAllDayChange = useCallback(
    (allDay: boolean) => {
      updateTaskMutation.mutate({ id: task.id, updates: { startDateAllDay: allDay } });
    },
    [task.id, updateTaskMutation],
  );

  const handleDueDateAllDayChange = useCallback(
    (allDay: boolean) => {
      updateTaskMutation.mutate({ id: task.id, updates: { dueDateAllDay: allDay } });
    },
    [task.id, updateTaskMutation],
  );

  const handleRepeatChange = useCallback(
    (rrule: string | undefined, repeatFrom: number) => {
      updateTaskMutation.mutate({ id: task.id, updates: { rrule, repeatFrom } });
    },
    [task.id, updateTaskMutation],
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      removeTagFromTaskMutation.mutate({ taskId: task.id, tagId });
    },
    [removeTagFromTaskMutation, task.id],
  );

  const handleRemoveReminder = useCallback(
    (reminderId: string) => {
      removeReminderMutation.mutate({ taskId: task.id, reminderId });
    },
    [removeReminderMutation, task.id],
  );

  const handleAddReminder = useCallback(
    (date: Date) => {
      addReminderMutation.mutate({ taskId: task.id, trigger: date });
    },
    [addReminderMutation, task.id],
  );

  const handleUpdateReminder = useCallback(
    (reminderId: string, date: Date) => {
      updateReminderMutation.mutate({ taskId: task.id, reminderId, trigger: date });
    },
    [task.id, updateReminderMutation],
  );

  const handleClearReminder = useCallback(
    (reminderId: string) => {
      removeReminderMutation.mutate({ taskId: task.id, reminderId });
    },
    [removeReminderMutation, task.id],
  );

  const handleDelete = useCallback(async () => {
    const deleted = await moveTaskToRecentlyDeleted(task.id);
    if (deleted) setEditorOpenMutation.mutate(false);
  }, [moveTaskToRecentlyDeleted, setEditorOpenMutation, task.id]);

  const handleRestore = useCallback(() => {
    restoreTaskMutation.mutate({ id: task.id });
    setEditorOpenMutation.mutate(false);
  }, [restoreTaskMutation, setEditorOpenMutation, task.id]);

  const handlePermanentDelete = useCallback(async () => {
    const deleted = await deleteTaskPermanently(task.id);
    if (deleted) setEditorOpenMutation.mutate(false);
  }, [deleteTaskPermanently, setEditorOpenMutation, task.id]);

  const handleClose = useCallback(() => {
    resetStaleCursorOnLayerClose();
    setEditorOpenMutation.mutate(false);
  }, [setEditorOpenMutation]);

  return {
    handleStatusChange,
    commitPercentComplete,
    handleCalendarChange,
    handleStartDateChange,
    handleDueDateChange,
    handleStartDateAllDayChange,
    handleDueDateAllDayChange,
    handleRepeatChange,
    handleRemoveTag,
    handleRemoveReminder,
    handleAddReminder,
    handleUpdateReminder,
    handleClearReminder,
    updateTask,
    moveTaskToRecentlyDeleted,
    handleDelete,
    handleRestore,
    handlePermanentDelete,
    handleClose,
  };
};
