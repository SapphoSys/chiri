import Timer from 'lucide-react/icons/timer';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '$hooks/ui/usePrefersReducedMotion';
import type { Task } from '$types/task/model';

interface TaskEditorProgressProps {
  task: Task;
  onCommitPercent: (value: number) => void;
  readOnly?: boolean;
  highlighted?: boolean;
  highlightRequest?: number;
}

export const TaskEditorProgress = ({
  task,
  onCommitPercent,
  readOnly = false,
  highlighted = false,
  highlightRequest = 0,
}: TaskEditorProgressProps) => {
  const [draftPercent, setDraftPercent] = useState<number | undefined>(undefined);
  const [isHighlightVisible, setIsHighlightVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const percent = draftPercent ?? task.percentComplete ?? 0;

  useEffect(() => {
    if (!highlighted || highlightRequest === 0) return;

    const frameId = requestAnimationFrame(() => {
      containerRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      inputRef.current?.focus({ preventScroll: true });
      setIsHighlightVisible(true);
    });
    const timeoutId = setTimeout(() => setIsHighlightVisible(false), 1600);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [highlighted, highlightRequest, prefersReducedMotion]);

  const commitPercent = (value: number) => {
    setDraftPercent(undefined);
    onCommitPercent(value);
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-lg ring-2 ring-transparent transition-colors ${isHighlightVisible ? 'bg-primary-50/60 ring-primary-500 dark:bg-primary-900/20' : ''}`}
    >
      <label
        htmlFor="task-percent-complete"
        className="mb-1 flex items-center gap-2 font-medium text-sm text-surface-600 dark:text-surface-400"
      >
        <Timer className="h-4 w-4" />
        Progress ({percent}%)
      </label>
      <div className={readOnly ? 'cursor-not-allowed' : undefined}>
        <input
          ref={inputRef}
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
    </div>
  );
};
