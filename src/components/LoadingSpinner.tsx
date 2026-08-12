import type { ComponentPropsWithoutRef } from 'react';

type LoadingSpinnerProps = Pick<ComponentPropsWithoutRef<'span'>, 'aria-hidden' | 'className'>;

export const LoadingSpinner = ({
  className = '',
  'aria-hidden': ariaHidden = true,
}: LoadingSpinnerProps) => (
  <span
    aria-hidden={ariaHidden}
    className={`block shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin ${className}`}
  />
);
