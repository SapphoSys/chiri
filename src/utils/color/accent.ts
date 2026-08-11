import type { AccentColor, ColorSchemeAccent, ColorSchemeMode } from '$types/color';
import { getContrastTextColor, hslToRgb, parseCssColor, rgbToHsl } from '$utils/color';

const WHITE_RGB: [number, number, number] = [255, 255, 255];

const getRelativeLuminance = ([r, g, b]: [number, number, number]) => {
  const linearize = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
};

const getContrastRatio = (
  foreground: [number, number, number],
  background: [number, number, number],
) => {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

const rgbToHex = ([r, g, b]: [number, number, number]) =>
  `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

/**
 * Derive a readable same-hue color for light-mode text, icons, borders, and
 * focus indicators without changing the selected accent used for fills.
 */
const getLightModeAccentInk = (color: AccentColor) => {
  const rgb = parseCssColor(color);
  if (!rgb || getContrastRatio(rgb, WHITE_RGB) >= 4.5) return color;

  const [hue, lightness, saturation] = rgbToHsl(...rgb);

  for (
    let candidateLightness = Math.min(lightness, 50);
    candidateLightness >= 5;
    candidateLightness -= 1
  ) {
    const candidate = hslToRgb(hue, saturation, candidateLightness);
    if (getContrastRatio(candidate, WHITE_RGB) >= 4.5) return rgbToHex(candidate);
  }

  return rgbToHex(hslToRgb(hue, saturation, 5));
};

/**
 * resolve a stored accent value to a hex color
 * presets are stored by name (e.g. "Rose"); custom colors are stored as hex
 * if the stored value matches a preset name, returns its current hex, making
 * the palette resilient to hex changes without orphaning user selections
 */
export const resolveAccentColor = (
  stored: AccentColor,
  accentColors: ColorSchemeAccent[],
): AccentColor => {
  const preset = accentColors.find((c) => c.name === stored);
  return preset ? preset.value : stored;
};

const applyPrimaryPalette = (
  color: AccentColor,
  lightnessMultiplier: number,
  mode: ColorSchemeMode = 'light',
) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  const rgb = parseCssColor(color);
  if (!rgb) return;
  const [r, g, b] = rgb;

  const [h, s, origL] = rgbToHsl(r, g, b);
  const lShift = (origL - 50) * lightnessMultiplier;
  const cl = (l: number) => Math.max(5, Math.min(97, l + lShift));

  const shades = [
    { shade: 50, l: cl(97) },
    { shade: 100, l: cl(94) },
    { shade: 200, l: cl(86) },
    { shade: 300, l: cl(76) },
    { shade: 400, l: cl(64) },
    { shade: 500, l: cl(50) },
    { shade: 600, l: cl(42) },
    { shade: 700, l: cl(35) },
    { shade: 800, l: cl(28) },
    { shade: 900, l: cl(22) },
    { shade: 950, l: cl(14) },
  ];

  for (const { shade, l } of shades) {
    const [sr, sg, sb] = hslToRgb(h, s, l);
    root.style.setProperty(`--primary-rgb-${shade}`, `${sr} ${sg} ${sb}`);
  }

  root.style.setProperty('--primary-contrast-color', getContrastTextColor(color));
  root.style.setProperty('--primary-ink', mode === 'light' ? getLightModeAccentInk(color) : color);
};

/**
 * like applyAccentColor, but anchors primary-500 to the exact chosen color by using
 * a 1.0× lightness shift. operates directly on parsed RGB. no intermediate string conversion
 */
export const applySchemeAccentColor = (color: AccentColor, mode: ColorSchemeMode) => {
  applyPrimaryPalette(color, 1, mode);
};

/**
 * apply accent color as CSS custom properties
 * generates a palette of shades from the base accent color
 */
export const applyAccentColor = (color: AccentColor, mode: ColorSchemeMode) => {
  applyPrimaryPalette(color, 1, mode);
};
