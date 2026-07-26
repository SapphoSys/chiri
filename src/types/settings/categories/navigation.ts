export type SettingsCategory = 'app' | 'tasks' | 'accounts' | 'misc';

export type SettingsSubtab =
  | 'appearance'
  | 'navigation'
  | 'safety'
  | 'defaults'
  | 'scheduling'
  | 'list-layout'
  | 'editor'
  | 'notifications'
  | 'region-and-time'
  | 'keyboard-shortcuts'
  | 'startup-window'
  | 'connections'
  | 'data-diagnostics'
  | 'sync'
  | 'push'
  | 'network'
  | 'updates'
  | 'about';

export type DefaultLaunchView = 'last-view' | 'all-tasks' | 'recently-deleted' | `filter:${string}`;

export type SidebarSectionKey = 'filters' | 'local' | 'accounts' | 'tags';
