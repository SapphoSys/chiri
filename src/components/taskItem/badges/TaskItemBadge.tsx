import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Tooltip } from '$components/Tooltip';
import type { BadgeTone } from '$types/badge';

interface TaskItemBadgeProps {
  children?: ReactNode;
  color?: string;
  tone?: BadgeTone;
  className?: string;
  title?: string;
  tooltip?: ReactNode;
  tooltipDelay?: number;
  ariaLabel?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const BASE_CLASS_NAME =
  'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-medium text-surface-700 text-xs dark:text-surface-300';

const TONE_CLASS_NAMES: Record<BadgeTone, string> = {
  neutral: 'border-surface-300 bg-surface-100 dark:border-surface-600 dark:bg-surface-700',
  primary: 'border-primary-500 bg-primary-500/15',
  info: 'border-semantic-info bg-semantic-info/10',
  'due-today': 'border-semantic-due-today bg-semantic-due-today/10',
  warning: 'border-semantic-warning bg-semantic-warning/10',
  error: 'border-semantic-error bg-semantic-error/10',
  'in-process': 'border-status-in-process bg-status-in-process/15',
};

const getColorTint = (color: string) => `color-mix(in oklab, ${color} 15%, transparent)`;

const getClassName = (color: string | undefined, tone: BadgeTone, className: string | undefined) =>
  [BASE_CLASS_NAME, color ? '' : TONE_CLASS_NAMES[tone], className ?? ''].filter(Boolean).join(' ');

export const TaskItemBadge = ({
  children,
  color,
  tone = 'neutral',
  className,
  title,
  tooltip,
  tooltipDelay = 350,
  ariaLabel,
  onClick,
}: TaskItemBadgeProps) => {
  const style: CSSProperties | undefined = color
    ? { borderColor: color, backgroundColor: getColorTint(color) }
    : undefined;
  const sharedProps = {
    className: getClassName(color, tone, className),
    style,
    title: tooltip ? undefined : title,
  };

  const badge = onClick ? (
    <button
      type="button"
      {...sharedProps}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${sharedProps.className} cursor-pointer outline-hidden transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset`}
    >
      {children}
    </button>
  ) : (
    <span {...sharedProps}>{children}</span>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} delay={tooltipDelay}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
};
