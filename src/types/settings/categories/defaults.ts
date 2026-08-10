export type DefaultReminderOffset =
  | 'at-due'
  | '5min-before-due'
  | '15min-before-due'
  | '30min-before-due'
  | '1hr-before-due'
  | '2hr-before-due'
  | '1day-before-due'
  | '2days-before-due'
  | '1week-before-due';

export type DefaultDateOffset =
  | 'none'
  | 'today'
  | 'tomorrow'
  | 'next-working-day'
  | '1week'
  | '2weeks'
  | 'due-date'
  | 'due-time'
  | '1day-before-due'
  | '1week-before-due';
