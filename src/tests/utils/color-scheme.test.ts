import { describe, expect, it } from 'vitest';
import { getAppearanceColorState } from '$utils/color/scheme';

describe('getAppearanceColorState', () => {
  it('hides dark-only schemes in light mode', () => {
    const { schemeOptions } = getAppearanceColorState({
      theme: 'light',
      accentColor: 'Pink',
      colorScheme: 'default',
      colorSchemeFlavor: null,
    });

    const schemeIds = schemeOptions.map((option) => option.id);

    expect(schemeIds).not.toContain('nord');
    expect(schemeIds).toContain('tokyo-night');
  });

  it('keeps dark-only schemes available in dark mode', () => {
    const { schemeOptions } = getAppearanceColorState({
      theme: 'dark',
      accentColor: 'Pink',
      colorScheme: 'default',
      colorSchemeFlavor: null,
    });

    expect(schemeOptions.map((option) => option.id)).toContain('nord');
  });
});
