import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileConfigImportChooserModal } from '$components/modals/MobileConfigImportChooserModal';
import type { MobileConfigImportProfile } from '$types/mobileconfig/import';

const globalWithActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

const profile = (): MobileConfigImportProfile => ({
  ok: true,
  format: 'xml',
  signature: 'unsigned',
  candidates: [
    {
      accountName: 'Personal CalDAV',
      serverUrl: 'https://personal.example.test',
      username: 'personal@example.test',
      password: 'app-password',
      serverType: 'generic',
    },
    {
      accountName: 'Work CalDAV',
      serverUrl: 'https://work.example.test',
      username: 'work@example.test',
      serverType: 'generic',
    },
  ],
  skippedCandidates: [{ reason: 'invalid-port' }],
});

describe('MobileConfigImportChooserModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.replaceChildren();
  });

  it('renders skipped-account context and credential hints', () => {
    act(() => {
      root.render(
        <MobileConfigImportChooserModal profile={profile()} onSelect={vi.fn()} onClose={vi.fn()} />,
      );
    });

    expect(document.body.textContent).toContain(
      '1 CalDAV account in this profile could not be imported.',
    );
    expect(document.body.textContent).toContain('Password included');
    expect(document.body.textContent).toContain('Password missing');
  });
});
