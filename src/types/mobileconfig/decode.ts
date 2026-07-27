/** the container format Chiri decoded the configuration profile from */
export type MobileConfigFormat = 'xml' | 'binary-plist' | 'signed-cms';

/** Chiri can currently identify CMS signatures, but does not verify their trust chain */
export type MobileConfigSignatureStatus = 'unsigned' | 'signed-unverified';

/** display-only metadata from an embedded CMS signing certificate. Chiri does not verify it. not right now anyway */
export interface MobileConfigSignerInfo {
  commonName?: string;
  organization?: string;
}

export type MobileConfigDecodeFailureReason =
  | 'file-too-large'
  | 'invalid-profile'
  | 'invalid-cms'
  | 'encrypted-profile-unsupported'
  | 'missing-payload-content'
  | 'missing-caldav-payload'
  | 'invalid-caldav-payload'
  | 'unexpected-error';

/** a structurally decoded com.apple.caldav.account payload */
export interface DecodedMobileConfigCalDAVPayload {
  accountDescription?: string;
  hostname?: string;
  port?: number;
  useSSL?: boolean;
  username?: string;
  password?: string;
  principalUrl?: string;
  payloadIdentifier?: string;
  payloadUuid?: string;
}

export interface DecodedMobileConfig {
  format: MobileConfigFormat;
  signature: MobileConfigSignatureStatus;
  signer?: MobileConfigSignerInfo;
  caldavPayloads: DecodedMobileConfigCalDAVPayload[];
}

export type MobileConfigDecodeResult =
  | { ok: true; profile: DecodedMobileConfig }
  | { ok: false; reason: MobileConfigDecodeFailureReason };
