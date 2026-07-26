export interface PendingDeletion {
  uid: string;
  href: string;
  accountId: string;
  calendarId: string;
  etag?: string;
  deletedAt?: Date;
  attemptCount?: number;
  lastAttemptAt?: Date;
  lastError?: string;
}
