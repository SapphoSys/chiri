export type ProgressIncrement = 1 | 5 | 10 | 25;

export const isProgressIncrement = (value: unknown): value is ProgressIncrement =>
  value === 1 || value === 5 || value === 10 || value === 25;
