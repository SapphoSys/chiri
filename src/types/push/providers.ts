/**
 * push endpoint provider used to receive Web Push-compatible messages
 */
export const NTFY_DIRECT_PROVIDER_ID = 'ntfy-direct';
export const KUNIFIED_PUSH_PROVIDER_ID = 'kunifiedpush';
export const MOZILLA_AUTOPUSH_PROVIDER_ID = 'mozilla-autopush';
export type PushProviderId =
  | typeof NTFY_DIRECT_PROVIDER_ID
  | typeof KUNIFIED_PUSH_PROVIDER_ID
  | typeof MOZILLA_AUTOPUSH_PROVIDER_ID;

/**
 * ntfy server configuration
 */
export interface NtfyProviderConfig {
  /** ntfy server URL (default: https://ntfy.sh) */
  serverUrl: string;
  /**
   * topic prefix for generating UnifiedPush topics
   * must be "up" for ntfy subscriber-based rate limiting
   */
  topicPrefix: string;
}

export interface PushProviderConfig {
  providerId: PushProviderId;
  ntfyConfig?: NtfyProviderConfig;
  mozillaAutopushConfig?: MozillaAutopushProviderConfig;
}

/**
 * Mozilla Autopush configuration
 */
export interface MozillaAutopushProviderConfig {
  /** Autopush websocket URL used by clients */
  websocketUrl: string;
  /** Autopush HTTP endpoint base URL used by senders */
  endpointUrl: string;
}

/**
 * callback fired when a local push provider receives a message for a calendar
 */
export type PushMessageHandler = (calendarId: string, message: string) => void;
