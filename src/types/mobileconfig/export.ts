export type MobileConfigExportIneligibleReason = 'local-account' | 'invalid-server-url';

export type MobileConfigCredentialWarning = 'oauth-token-may-expire';

export type MobileConfigExportEligibility =
  | { eligible: true }
  | { eligible: false; reason: MobileConfigExportIneligibleReason };

export type MobileConfigExportResult = 'saved' | 'cancelled';

export interface MobileConfigGenerationOptions {
  includePassword?: boolean;
  profileUuid?: string;
  payloadUuid?: string;
}
