import type { ReactNode } from 'react';
import { Tooltip } from '$components/Tooltip';

interface TaskBatchActionTooltipProps {
  content: string;
  isCompact: boolean;
  children: ReactNode;
}

export const TaskBatchActionTooltip = ({
  content,
  isCompact,
  children,
}: TaskBatchActionTooltipProps) => {
  if (!isCompact) return <>{children}</>;
  return (
    <Tooltip content={content} position="bottom">
      {children}
    </Tooltip>
  );
};
