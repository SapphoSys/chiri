export type Priority = 'high' | 'medium' | 'low' | 'none';

export type Status = 'needs-action' | 'in-process' | 'completed' | 'cancelled';

export interface Reminder {
  id: string;
  trigger: Date; // absolute date/time when the reminder fires (resolved from relative if needed)
  relativeOffset?: number; // milliseconds; if set, this was a relative trigger and should round-trip as one
  relatedTo?: 'start' | 'end'; // which date the offset is relative to (RELATED=START/END)
  repeat?: number; // RFC 5545 REPEAT: number of additional repetitions after the initial trigger
  duration?: number; // RFC 5545 DURATION (ms): delay between repetitions; required when repeat is set
}

export interface Task {
  id: string;
  uid: string;
  etag?: string; // CalDAV ETag for sync
  href?: string;

  // core fields
  title: string;
  description: string;
  status: Status;
  completed: boolean; // derived: status === 'completed'
  completedAt?: Date;
  percentComplete?: number; // 0-100, RFC 5545 PERCENT-COMPLETE

  // categorization
  tags?: string[]; // array of tag IDs (maps to iCal CATEGORIES)
  categoryId?: string; // raw CATEGORIES string from CalDAV (used during sync, mapped to tags)
  tagColorsByName?: Record<string, string>; // lowercase tag name -> #RRGGBB from X-TASKS-TAG-COLOR
  priority: Priority;

  // dates
  startDate?: Date;
  startDateAllDay?: boolean; // if true, startDate is all-day (no time component)
  dueDate?: Date;
  dueDateAllDay?: boolean; // if true, dueDate is all-day (no time component)
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date;

  // reminders
  reminders?: Reminder[];

  // parent-child relationship (RELATED-TO in CalDAV)
  parentUid?: string; // UID of parent task
  isCollapsed?: boolean; // whether subtasks are collapsed in UI

  // sorting
  sortOrder: number; // x-apple-sort-order

  // URL (RFC 7986)
  url?: string;

  // recurrence (RFC 5545)
  rrule?: string; // RRULE value string, e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  repeatFrom?: number; // 0 = due date (default), 1 = completion date

  // sync
  accountId: string;
  calendarId: string;
  synced: boolean;
  localOnly?: boolean;
}
