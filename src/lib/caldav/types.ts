import type { Task } from '$types/task/model';

export interface CalDAVTaskObject {
  taskUid: string;
  accountId: string;
  calendarId: string;
  href: string;
  etag?: string;
  vtodo: string;
  lastSyncAt: Date;
}

export interface TaskWithCalDAVObject extends Task {
  caldavObject: CalDAVTaskObject;
}
