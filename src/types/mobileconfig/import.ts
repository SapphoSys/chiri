import type {
  MobileConfigDecodeFailureReason,
  MobileConfigFormat,
  MobileConfigSignatureStatus,
} from '$types/mobileconfig/decode';

/** account setup values produced from a decoded CalDAV payload */
export interface MobileConfigCalDAVSettings {
  accountName?: string;
  serverUrl: string;
  username?: string;
  password?: string;
  principalUrl?: string;
  payloadIdentifier?: string;
  payloadUuid?: string;
  serverType: 'generic';
}

export type MobileConfigImportFailureReason =
  | MobileConfigDecodeFailureReason
  | 'missing-hostname'
  | 'invalid-hostname'
  | 'invalid-port'
  | 'invalid-principal-url';

export type MobileConfigImportResult =
  | {
      ok: true;
      format: MobileConfigFormat;
      signature: MobileConfigSignatureStatus;
      candidates: MobileConfigCalDAVSettings[];
    }
  | { ok: false; reason: MobileConfigImportFailureReason };

export type MobileConfigImportProfile = Extract<MobileConfigImportResult, { ok: true }>;

export interface MobileConfigImportSelection {
  format: MobileConfigFormat;
  signature: MobileConfigSignatureStatus;
  settings: MobileConfigCalDAVSettings;
}
