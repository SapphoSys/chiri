import type { Calendar } from '$types/calendar';

type ManagedServerTypes =
  | 'disrootCloud'
  | 'fastmail'
  | 'fruux'
  | 'mailbox'
  | 'migadu'
  | 'purelymail'
  | 'runbox';

type SelfHostedServerTypes =
  | 'baikal'
  | 'nextcloud'
  | 'radicale'
  | 'rustical'
  | 'stalwart'
  | 'vikunja'
  | 'xandikos';

export type ServerType = ManagedServerTypes | SelfHostedServerTypes | 'generic';

export type ServerValidationResult =
  | { ok: true }
  | { ok: false; reason: 'timeout' | 'unreachable' };

export interface CalDAVConfig {
  serverUrl: string;
  username: string;
  password: string;
  serverType: ServerType;
  calendarHomeUrl?: string;
  principalUrl?: string;
  acceptInvalidCerts?: boolean;
  authType: 'basic' | 'oauth';
  refreshToken?: string;
  tokenExpiry?: string;
  oauthClientId?: string;
}

export interface Account {
  id: string;
  name: string;
  icon?: string;
  emoji?: string;
  calendars: Calendar[];
  lastSync?: Date;
  isActive: boolean;
  sortOrder: number;
  caldav: CalDAVConfig | null;
}
