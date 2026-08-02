import { BatchTaskTagsModal } from '$components/modals/BatchTaskTagsModal';
import { DatePickerModal } from '$components/modals/DatePickerModal';
import { MoveToCalendarModal } from '$components/modals/MoveToCalendar/MoveToCalendarModal';
import { ReminderPickerModal } from '$components/modals/ReminderPickerModal';
import { RepeatModal } from '$components/modals/RepeatModal/RepeatModal';
import type { TaskEditorActions } from '$hooks/ui/useTaskEditorActions';
import type { TaskEditorModalsState } from '$hooks/ui/useTaskEditorModals';
import type { Account } from '$types/account';
import type { Tag } from '$types/tag';
import type { Task } from '$types/task/model';

interface TaskEditorModalsProps {
  task: Task;
  accounts: Account[];
  tags: Tag[];
  isReadOnly: boolean;
  actions: TaskEditorActions;
  modals: TaskEditorModalsState;
}

export const TaskEditorModals = ({
  task,
  accounts,
  tags,
  isReadOnly,
  actions,
  modals,
}: TaskEditorModalsProps) => (
  <>
    {!isReadOnly && modals.showRepeatModal && (
      <RepeatModal
        isOpen={modals.showRepeatModal}
        onClose={modals.closeRepeatModal}
        rrule={task.rrule}
        repeatFrom={task.repeatFrom ?? 0}
        dueDate={task.dueDate ? new Date(task.dueDate) : undefined}
        initialCustom={modals.openRepeatAsCustom}
        onSave={actions.handleRepeatChange}
      />
    )}

    {!isReadOnly && modals.showTagsModal && (
      <BatchTaskTagsModal
        isOpen={modals.showTagsModal}
        onClose={modals.closeTagsModal}
        tasks={[task]}
        tags={tags}
        description={task.title.trim() || 'Untitled task'}
      />
    )}

    {!isReadOnly && modals.showStartDatePicker && (
      <DatePickerModal
        isOpen={modals.showStartDatePicker}
        onClose={modals.closeStartDatePicker}
        value={task.startDate ? new Date(task.startDate) : undefined}
        onChange={actions.handleStartDateChange}
        title="Start Date"
        allDay={task.startDateAllDay}
        onAllDayChange={actions.handleStartDateAllDayChange}
      />
    )}

    {!isReadOnly && modals.showDueDatePicker && (
      <DatePickerModal
        isOpen={modals.showDueDatePicker}
        onClose={modals.closeDueDatePicker}
        value={task.dueDate ? new Date(task.dueDate) : undefined}
        onChange={actions.handleDueDateChange}
        title="Due Date"
        allDay={task.dueDateAllDay}
        onAllDayChange={actions.handleDueDateAllDayChange}
      />
    )}

    {!isReadOnly && modals.showMoveCalendarModal && (
      <MoveToCalendarModal
        task={task}
        accounts={accounts}
        onMove={actions.handleCalendarChange}
        onClose={modals.closeMoveCalendarModal}
      />
    )}

    {!isReadOnly && modals.showReminderPicker && (
      <ReminderPickerModal
        isOpen={modals.showReminderPicker}
        onClose={modals.closeReminderPicker}
        onSave={actions.handleAddReminder}
        title="Add Reminder"
      />
    )}

    {!isReadOnly && modals.editingReminderId !== null && (
      <ReminderPickerModal
        isOpen={modals.editingReminderId !== null}
        onClose={modals.closeEditReminder}
        value={modals.editReminderDate}
        onSave={(date) => {
          if (modals.editingReminderId) {
            actions.handleUpdateReminder(modals.editingReminderId, date);
            modals.closeEditReminder();
          }
        }}
        onClear={() => {
          if (modals.editingReminderId) {
            actions.handleClearReminder(modals.editingReminderId);
            modals.closeEditReminder();
          }
        }}
        title="Edit Reminder"
      />
    )}
  </>
);
