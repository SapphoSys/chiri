import { useCallback, useState } from 'react';

export interface TaskEditorModalsState {
  showTagsModal: boolean;
  showStartDatePicker: boolean;
  showDueDatePicker: boolean;
  showMoveCalendarModal: boolean;
  showRepeatModal: boolean;
  openRepeatAsCustom: boolean;
  showReminderPicker: boolean;
  editingReminderId: string | null;
  editReminderDate: Date | undefined;
  openTagsModal: () => void;
  closeTagsModal: () => void;
  openStartDatePicker: () => void;
  closeStartDatePicker: () => void;
  openDueDatePicker: () => void;
  closeDueDatePicker: () => void;
  openMoveCalendarModal: () => void;
  closeMoveCalendarModal: () => void;
  openRepeatModal: (initialCustom?: boolean) => void;
  closeRepeatModal: () => void;
  openReminderPicker: () => void;
  closeReminderPicker: () => void;
  openEditReminder: (reminder: { id: string; trigger: Date }) => void;
  closeEditReminder: () => void;
}

export const useTaskEditorModals = (): TaskEditorModalsState => {
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showMoveCalendarModal, setShowMoveCalendarModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [openRepeatAsCustom, setOpenRepeatAsCustom] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [editReminderDate, setEditReminderDate] = useState<Date | undefined>(undefined);

  const openRepeatModal = useCallback((initialCustom = false) => {
    setOpenRepeatAsCustom(initialCustom);
    setShowRepeatModal(true);
  }, []);

  const closeEditReminder = useCallback(() => {
    setEditingReminderId(null);
    setEditReminderDate(undefined);
  }, []);

  return {
    showTagsModal,
    showStartDatePicker,
    showDueDatePicker,
    showMoveCalendarModal,
    showRepeatModal,
    openRepeatAsCustom,
    showReminderPicker,
    editingReminderId,
    editReminderDate,
    openTagsModal: useCallback(() => setShowTagsModal(true), []),
    closeTagsModal: useCallback(() => setShowTagsModal(false), []),
    openStartDatePicker: useCallback(() => setShowStartDatePicker(true), []),
    closeStartDatePicker: useCallback(() => setShowStartDatePicker(false), []),
    openDueDatePicker: useCallback(() => setShowDueDatePicker(true), []),
    closeDueDatePicker: useCallback(() => setShowDueDatePicker(false), []),
    openMoveCalendarModal: useCallback(() => setShowMoveCalendarModal(true), []),
    closeMoveCalendarModal: useCallback(() => setShowMoveCalendarModal(false), []),
    openRepeatModal,
    closeRepeatModal: useCallback(() => setShowRepeatModal(false), []),
    openReminderPicker: useCallback(() => setShowReminderPicker(true), []),
    closeReminderPicker: useCallback(() => setShowReminderPicker(false), []),
    openEditReminder: useCallback((reminder: { id: string; trigger: Date }) => {
      setEditingReminderId(reminder.id);
      setEditReminderDate(reminder.trigger);
    }, []),
    closeEditReminder,
  };
};
