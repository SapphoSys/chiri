import type { PushProviderId } from '$types/push/providers';

/**
 * supported trigger types for WebDAV Push
 */
export interface PushTrigger {
  type: 'content-update' | 'property-update';
  depth: '0' | '1' | 'infinity';
}

/**
 * WebDAV Push subscription stored locally
 */
export interface PushSubscription {
  id: string;
  calendarId: string;
  accountId: string;
  /** URL to manage/delete this subscription on the server */
  registrationUrl: string;
  /** push service endpoint URL */
  pushResource: string;
  /** local provider used to create/listen to this push resource */
  providerId: PushProviderId;
  /** provider-specific registration token, if the provider needs one */
  providerToken?: string;
  /** provider-specific distributor/service that owns the token, if applicable */
  providerDistributor?: string;
  /** provider-specific JSON metadata needed to restore/remove/listen */
  providerMetadata?: string;
  /** when the subscription expires */
  expiresAt: Date;
  /** when the subscription was created locally */
  createdAt: Date;
}

/**
 * Web Push subscription details (client-to-server)
 */
export interface WebPushSubscription {
  /** push endpoint URL (from push service) */
  pushResource: string;
  /** client's ECDH public key for message encryption (base64url, uncompressed P-256) */
  subscriptionPublicKey: string;
  /** authentication secret for message encryption (base64url) */
  authSecret: string;
  /** content encoding (currently only aes128gcm) */
  contentEncoding: 'aes128gcm';
}

/**
 * Web Push subscription plus local provider metadata needed for restore
 */
export interface PushEndpointSubscription extends WebPushSubscription {
  providerId: PushProviderId;
  providerToken?: string;
  providerDistributor?: string;
  providerMetadata?: string;
}

/**
 * Web Push key pair for message encryption
 */
export interface WebPushKeyPair {
  /** public key (base64url, uncompressed P-256) */
  publicKey: string;
  /** private key (base64url) - kept locally for decryption */
  privateKey: string;
  /** authentication secret (base64url) */
  authSecret: string;
}

/**
 * registered push subscription (server response)
 */
export interface PushRegistration {
  /** URL to manage/delete this subscription */
  registrationUrl: string;
  /** when the subscription expires */
  expires: Date;
}
