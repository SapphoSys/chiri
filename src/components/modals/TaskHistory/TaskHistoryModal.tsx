import { format, isThisWeek, isToday, isYesterday } from 'date-fns';
import { ModalWrapper } from '$components/ModalWrapper';
import { HistoryEntry } from '$components/modals/TaskHistory/HistoryEntry';
import { useSettingsStore } from '$context/settingsContext';
import { useTaskHistory } from '$hooks/queries/useTaskHistory';
import type { TaskHistoryEntry } from '$types/task/history';
import { formatDate } from '$utils/date';

interface TaskHistoryModalProps {
  isOpen: boolean;
  taskTitle: string;
  taskUid: string;
  onClose: () => void;
}

const groupHistoryByDate = (history: TaskHistoryEntry[]) => {
  const groups = new Map<string, TaskHistoryEntry[]>();

  for (const entry of history) {
    const dateKey = format(entry.changedAt, 'yyyy-MM-dd');
    const entries = groups.get(dateKey);

    if (entries) {
      entries.push(entry);
    } else {
      groups.set(dateKey, [entry]);
    }
  }

  return [...groups.values()];
};

const formatHistoryDate = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return formatDate(date, true);
};

export const TaskHistoryModal = ({
  isOpen,
  taskTitle,
  taskUid,
  onClose,
}: TaskHistoryModalProps) => {
  const { data: history, isLoading } = useTaskHistory(taskUid);
  const { timeFormat } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="History"
      description={taskTitle}
      zIndex="z-60"
      className="max-h-[80vh] max-w-md"
    >
      {isLoading ? (
        <p className="text-sm text-surface-400 dark:text-surface-500">Loading...</p>
      ) : !history || history.length === 0 ? (
        <p className="text-sm text-surface-400 dark:text-surface-500">No history yet.</p>
      ) : (
        <div className="space-y-4">
          {groupHistoryByDate(history).map((entries) => (
            <section key={format(entries[0].changedAt, 'yyyy-MM-dd')}>
              <h3 className="mb-2 font-semibold text-sm text-surface-600 dark:text-surface-400">
                {formatHistoryDate(entries[0].changedAt)}
              </h3>
              <div>
                {entries.map((entry, index) => (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    timeFormat={timeFormat}
                    isLast={index === entries.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </ModalWrapper>
  );
};
