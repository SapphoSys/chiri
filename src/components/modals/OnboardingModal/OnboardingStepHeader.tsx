import type { ReactNode } from 'react';

interface OnboardingStepHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  iconWrapperClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const OnboardingStepHeader = ({
  title,
  description,
  icon,
  iconWrapperClassName = 'mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary-500 text-primary-contrast',
  titleClassName = 'font-semibold text-2xl text-surface-950 dark:text-surface-50',
  descriptionClassName = 'mt-2 text-sm text-surface-600 leading-6 dark:text-surface-400',
}: OnboardingStepHeaderProps) => (
  <div className="shrink-0">
    {icon && <div className={iconWrapperClassName}>{icon}</div>}
    <h2 className={titleClassName}>{title}</h2>
    <p className={descriptionClassName}>{description}</p>
  </div>
);
