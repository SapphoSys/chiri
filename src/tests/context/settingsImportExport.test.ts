import { describe, expect, it, vi } from 'vitest';
import type { KeyboardShortcut } from '$types/shortcuts';

vi.mock('@tauri-apps/plugin-os', () => ({
  platform: () => 'macos',
}));

const shortcut = (overrides: Partial<KeyboardShortcut>): KeyboardShortcut => ({
  id: 'test-shortcut',
  key: 'n',
  description: 'Test shortcut',
  ...overrides,
});

describe('mergeShortcuts', () => {
  it('restores defaults for stored shortcuts reserved by macOS', async () => {
    const { mergeShortcuts } = await import('$context/settingsImportExport');
    const defaults = [shortcut({ id: 'new-task', key: 'n', meta: true })];
    const existing = [shortcut({ id: 'new-task', key: 'q', meta: true })];

    expect(mergeShortcuts(existing, defaults)).toEqual(defaults);
  });

  it('keeps non-reserved stored shortcuts', async () => {
    const { mergeShortcuts } = await import('$context/settingsImportExport');
    const defaults = [shortcut({ id: 'new-task', key: 'n', meta: true })];
    const existing = [shortcut({ id: 'new-task', key: 'j', meta: true })];

    expect(mergeShortcuts(existing, defaults)).toEqual(existing);
  });
});

describe('enableSystemTrayExplicitlySet round-trip', () => {
  it('preserves the explicit tray flag through export and import', async () => {
    const { exportSettings, importSettings } = await import('$context/settingsImportExport');
    const { defaultState } = await import('$context/settingsDefaults');

    const state = {
      ...defaultState,
      enableSystemTray: false,
      enableSystemTrayExplicitlySet: true,
    };

    const exported = exportSettings(state);
    const imported = importSettings(exported, defaultState);

    expect(imported).not.toBeNull();
    expect(imported?.enableSystemTray).toBe(false);
    expect(imported?.enableSystemTrayExplicitlySet).toBe(true);
  });

  it('defaults the explicit tray flag to false when missing from imported data', async () => {
    const { importSettings } = await import('$context/settingsImportExport');
    const { defaultState } = await import('$context/settingsDefaults');

    const exported = JSON.stringify({
      version: 1,
      enableSystemTray: true,
    });

    const imported = importSettings(exported, defaultState);

    expect(imported).not.toBeNull();
    expect(imported?.enableSystemTray).toBe(true);
    expect(imported?.enableSystemTrayExplicitlySet).toBe(false);
  });
});

describe('status and progress synchronization', () => {
  it('round-trips the synchronization preference', async () => {
    const { exportSettings, importSettings } = await import('$context/settingsImportExport');
    const { defaultState } = await import('$context/settingsDefaults');

    const imported = importSettings(
      exportSettings({
        ...defaultState,
        defaultStatus: 'completed',
        defaultPercentComplete: 42,
        syncStatusProgress: false,
      }),
      defaultState,
    );

    expect(imported?.syncStatusProgress).toBe(false);
    expect(imported?.defaultStatus).toBe('completed');
    expect(imported?.defaultPercentComplete).toBe(42);
  });

  it('defaults the preference to enabled when importing older settings', async () => {
    const { importSettings } = await import('$context/settingsImportExport');
    const { defaultState } = await import('$context/settingsDefaults');

    const imported = importSettings(JSON.stringify({ version: 1 }), defaultState);

    expect(imported?.syncStatusProgress).toBe(true);
  });
});

describe('editor field migration', () => {
  it('keeps legacy grouped visibility settings in sync', async () => {
    const { importSettings } = await import('$context/settingsImportExport');
    const { defaultState } = await import('$context/settingsDefaults');

    const imported = importSettings(
      JSON.stringify({
        version: 1,
        editorFieldVisibility: { status: false },
        editorFieldOrder: ['status', 'description'],
      }),
      defaultState,
    );

    expect(imported?.editorFieldVisibility.status).toBe(false);
    expect(imported?.editorFieldVisibility.progress).toBe(false);
    expect(imported?.editorFieldOrder.slice(0, 2)).toEqual(['status', 'progress']);
  });

  it('keeps independently configured progress visibility intact', async () => {
    const { importSettings } = await import('$context/settingsImportExport');
    const { defaultState } = await import('$context/settingsDefaults');

    const imported = importSettings(
      JSON.stringify({
        version: 1,
        editorFieldVisibility: { status: false, progress: true },
        editorFieldOrder: ['progress', 'status'],
      }),
      defaultState,
    );

    expect(imported?.editorFieldVisibility).toMatchObject({ status: false, progress: true });
    expect(imported?.editorFieldOrder.slice(0, 2)).toEqual(['progress', 'status']);
  });
});
