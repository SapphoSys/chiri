import type { PushProviderId } from '$types/push/providers';

/**
 * runtime state for a local provider listener
 */
export interface PushProviderSubscriptionDiagnostics {
  calendarId: string;
  providerId: PushProviderId;
  listening: boolean;
  listenerStartedAt: Date | null;
  lastConnectedAt: Date | null;
  lastMessageAt: Date | null;
  receivedMessages: number;
  lastError: string | null;
  lastErrorAt: Date | null;
}

/**
 * account-level WebDAV Push health summary
 */
export interface WebDAVPushAccountDiagnostics {
  accountId: string;
  supportedCalendars: number;
  registeredCalendars: number;
  listeningCalendars: number;
  expiringSoonCalendars: number;
  lastRenewedAt: Date | null;
  lastMessageAt: Date | null;
  lastError: string | null;
  lastErrorAt: Date | null;
}
