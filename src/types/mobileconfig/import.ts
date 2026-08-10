import type {
  MobileConfigDecodeFailureReason,
  MobileConfigFormat,
  MobileConfigSignatureStatus,
  MobileConfigSignerInfo,
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

export interface MobileConfigSkippedCalDAVPayload {
  reason: MobileConfigImportFailureReason;
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
      signer?: MobileConfigSignerInfo;
      candidates: MobileConfigCalDAVSettings[];
      skippedCandidates?: MobileConfigSkippedCalDAVPayload[];
    }
  | { ok: false; reason: MobileConfigImportFailureReason };

export type MobileConfigImportProfile = Extract<MobileConfigImportResult, { ok: true }>;

export interface MobileConfigImportSelection {
  format: MobileConfigFormat;
  signature: MobileConfigSignatureStatus;
  signer?: MobileConfigSignerInfo;
  settings: MobileConfigCalDAVSettings;
  skippedCandidates?: MobileConfigSkippedCalDAVPayload[];
}
