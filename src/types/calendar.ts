export interface Calendar {
  id: string;
  displayName: string;
  url: string;
  ctag?: string;
  syncToken?: string;
  color?: string;
  icon?: string; // icon name from lucide-react
  emoji?: string; // emoji character(s)
  accountId: string;
  supportedComponents?: string[]; // e.g., ['VTODO', 'VEVENT']
  sortOrder: number; // apple-calendar-order

  // WebDAV Push support (draft spec)
  pushTopic?: string; // unique topic identifier for WebDAV Push messages
  pushSupported?: boolean; // whether server supports WebDAV Push
  pushVapidKey?: string; // VAPID public key for Web Push (base64url)
}
