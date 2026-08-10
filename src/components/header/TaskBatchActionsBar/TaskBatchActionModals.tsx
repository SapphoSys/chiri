import { BatchTaskDatesModal } from '$components/modals/BatchTaskDatesModal';
import { BatchTaskTagsModal } from '$components/modals/BatchTaskTagsModal';
import { ExportModal } from '$components/modals/ExportModal';
import { MoveToCalendarModal } from '$components/modals/MoveToCalendar/MoveToCalendarModal';
import type { Account } from '$types/account';
import type { TimeFormat } from '$types/settings/categories/region';
import type { Tag } from '$types/tag';
import type { Task } from '$types/task/model';

interface TaskBatchActionModalsProps {
  selectedTasks: Task[];
  accounts: Account[];
  tags: Tag[];
  timeFormat: TimeFormat;
  currentCalendarIds: string[];
  exportTasks: Task[];
  showTagsModal: boolean;
  showDatesModal: boolean;
  showMoveModal: boolean;
  showExportModal: boolean;
  onCloseTagsModal: () => void;
  onCloseDatesModal: () => void;
  onCloseMoveModal: () => void;
  onCloseExportModal: () => void;
  onMoveToCalendar: (calendarId: string) => void;
}

export const TaskBatchActionModals = ({
  selectedTasks,
  accounts,
  tags,
  timeFormat,
  currentCalendarIds,
  exportTasks,
  showTagsModal,
  showDatesModal,
  showMoveModal,
  showExportModal,
  onCloseTagsModal,
  onCloseDatesModal,
  onCloseMoveModal,
  onCloseExportModal,
  onMoveToCalendar,
}: TaskBatchActionModalsProps) => (
  <>
    {showTagsModal && (
      <BatchTaskTagsModal
        isOpen={showTagsModal}
        onClose={onCloseTagsModal}
        tasks={selectedTasks}
        tags={tags}
      />
    )}

    {showDatesModal && (
      <BatchTaskDatesModal
        isOpen={showDatesModal}
        onClose={onCloseDatesModal}
        tasks={selectedTasks}
        timeFormat={timeFormat}
      />
    )}

    {showMoveModal && (
      <MoveToCalendarModal
        accounts={accounts}
        currentCalendarIds={currentCalendarIds}
        title="Move selected tasks"
        description={`${selectedTasks.length} selected ${selectedTasks.length === 1 ? 'task' : 'tasks'}`}
        onMove={onMoveToCalendar}
        onClose={onCloseMoveModal}
      />
    )}

    {showExportModal && (
      <ExportModal
        tasks={exportTasks}
        fileName="selected-tasks"
        type="tasks"
        onClose={onCloseExportModal}
      />
    )}
  </>
);
