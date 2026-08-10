import type { DateFormat, StartOfWeek, TimeFormat } from '$types/settings/categories/region';

export type InstallType =
  | 'appimage'
  | 'nix'
  | 'aur'
  | 'copr'
  | 'flatpak'
  | 'homebrew'
  | 'scoop'
  | 'standard';

export interface SystemRegionPreferences {
  locale: string | null;
  timezone: string | null;
  dateFormat: DateFormat | null;
  timeFormat: TimeFormat | null;
  startOfWeek: StartOfWeek | null;
}
