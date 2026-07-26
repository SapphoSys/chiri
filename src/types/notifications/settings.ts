export type NotificationActionKey = 'complete' | 'snooze';

export type SnoozeDurationUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

export interface SnoozeDuration {
  id: string;
  value: number;
  unit: SnoozeDurationUnit;
}

export interface NotificationActionSettings {
  complete: boolean;
  snooze: boolean;
  snoozeDurations: SnoozeDuration[];
  order: NotificationActionKey[];
}
