export interface KeyboardShortcut {
  id: string;
  key?: string;
  ctrl?: boolean;
  meta?: boolean;
  super?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}
