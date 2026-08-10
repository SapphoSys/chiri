import RefreshCw from 'lucide-react/icons/refresh-cw';
import RefreshCwOff from 'lucide-react/icons/refresh-cw-off';
import { AddRepeatRuleButton } from '$components/repeat/AddRepeatRuleButton';
import { RepeatRulePreview } from '$components/repeat/RepeatRulePreview';
import { TaskEditorEmptyState } from '$components/taskEditor/TaskEditorEmptyState';
import { useSettingsStore } from '$context/settingsContext';
import { getRepeatPresets } from '$lib/task/recurrence';
import type { Task } from '$types/task/model';

interface TaskEditorRepeatProps {
  task: Task;
  onOpen: () => void;
  onOpenCustom: () => void;
  onSetPreset: (rrule: string) => void;
  readOnly?: boolean;
}

export const TaskEditorRepeat = ({
  task,
  onOpen,
  onOpenCustom,
  onSetPreset,
  readOnly = false,
}: TaskEditorRepeatProps) => {
  const { workingDays } = useSettingsStore();
  const dueDate = task.dueDate ? new Date(task.dueDate) : undefined;
  const presets = getRepeatPresets(dueDate, workingDays);

  return (
    <div>
      <div
        id="repeat-label"
        className="mb-2 flex items-center gap-2 font-medium text-sm text-surface-600 dark:text-surface-400"
      >
        <RefreshCw className="h-4 w-4" />
        Repeat
      </div>
      {task.rrule ? (
        <RepeatRulePreview
          rrule={task.rrule}
          repeatFrom={task.repeatFrom ?? 0}
          dueDate={dueDate}
          onOpen={onOpen}
          labelId="repeat-label"
          readOnly={readOnly}
        />
      ) : readOnly ? (
        <TaskEditorEmptyState icon={<RefreshCwOff className="h-4 w-4 shrink-0" />}>
          No repeat rule
        </TaskEditorEmptyState>
      ) : (
        <AddRepeatRuleButton presets={presets} onSelect={onSetPreset} onCustom={onOpenCustom} />
      )}
    </div>
  );
};
