import Timer from 'lucide-react/icons/timer';
import { type CSSProperties, useState } from 'react';
import type { Task } from '$types/task/model';

interface TaskEditorProgressProps {
  task: Task;
  onCommitPercent: (value: number) => void;
  readOnly?: boolean;
}

export const TaskEditorProgress = ({
  task,
  onCommitPercent,
  readOnly = false,
}: TaskEditorProgressProps) => {
  const [draftPercent, setDraftPercent] = useState<number | undefined>(undefined);
  const percent = draftPercent ?? task.percentComplete ?? 0;

  const commitPercent = (value: number) => {
    setDraftPercent(undefined);
    onCommitPercent(value);
  };

  return (
    <div>
      <label
        htmlFor="task-percent-complete"
        className="mb-1 flex items-center gap-2 font-medium text-sm text-surface-600 dark:text-surface-400"
      >
        <Timer className="h-4 w-4" />
        Progress ({percent}%)
      </label>
      <div className={readOnly ? 'cursor-not-allowed' : undefined}>
        <input
          id="task-percent-complete"
          type="range"
          min={0}
          max={100}
          step={5}
          value={percent}
          style={{ '--pct': `${percent}%` } as CSSProperties}
          onChange={(e) => setDraftPercent(Number(e.target.value))}
          onPointerUp={(e) => {
            if (readOnly) return;
            commitPercent(Number((e.target as HTMLInputElement).value));
          }}
          onKeyUp={(e) => {
            if (readOnly) return;
            commitPercent(Number((e.target as HTMLInputElement).value));
          }}
          disabled={readOnly}
          className={`w-full ${readOnly ? 'pointer-events-none' : ''}`}
        />
      </div>
      <div className="mt-1 flex justify-between text-surface-400 text-xs">
        <span>0%</span>
        <span>100%</span>
      </div>
      {!readOnly && (
        <p className="mt-2 text-surface-400 text-xs">
          Changing progress updates the task status automatically.
        </p>
      )}
    </div>
  );
};
