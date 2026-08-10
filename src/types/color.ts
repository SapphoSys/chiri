export type Theme = 'light' | 'dark' | 'system';

export type AccentColor = string;

export type ColorSchemeMode = 'light' | 'dark';

interface ColorSchemeSurfaces {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorSchemeAccent {
  name: string;
  value: string;
}

interface ColorSchemeSemanticColors {
  info: string;
  dueToday: string;
  warning: string;
  success: string;
  error: string;
}

interface ColorSchemeStatusColors {
  needsAction: string;
  inProcess: string;
  completed: string;
  cancelled: string;
}

interface ColorSchemePriorityColors {
  high: string;
  medium: string;
  low: string;
}

export interface ColorSchemeFlavor {
  id: string;
  name: string;
  mode: ColorSchemeMode;
  surfaces: ColorSchemeSurfaces;
  accentColors: ColorSchemeAccent[];
  defaultAccent: string;
  semanticColors: ColorSchemeSemanticColors;
  statusColors: ColorSchemeStatusColors;
  priorityColors: ColorSchemePriorityColors;
}

export interface ColorSchemeDefinition {
  id: string;
  name: string;
  /** empty = no flavor concept (Default scheme) */
  flavors: ColorSchemeFlavor[];
}
