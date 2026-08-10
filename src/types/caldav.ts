export type CalDAVServerUrlParseFailureReason =
  | 'missing-url'
  | 'invalid-url'
  | 'unsupported-scheme'
  | 'embedded-credentials'
  | 'invalid-port'
  | 'missing-hostname';

export type CalDAVServerUrlParseResult =
  | { ok: true; url: URL }
  | { ok: false; reason: CalDAVServerUrlParseFailureReason };
