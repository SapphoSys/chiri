import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MobileConfigImportSkippedWarning } from '$components/modals/MobileConfigImportSkippedWarning';

const globalWithActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

describe('MobileConfigImportSkippedWarning', () => {
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
  });

  it('renders nothing when no payloads were skipped', () => {
    act(() => {
      root.render(<MobileConfigImportSkippedWarning />);
    });

    expect(container.textContent).toBe('');
  });

  it('renders a singular skipped-account warning', () => {
    act(() => {
      root.render(
        <MobileConfigImportSkippedWarning skippedCandidates={[{ reason: 'missing-hostname' }]} />,
      );
    });

    expect(container.textContent).toContain(
      '1 CalDAV account in this profile could not be imported.',
    );
  });

  it('renders a plural skipped-account warning', () => {
    act(() => {
      root.render(
        <MobileConfigImportSkippedWarning
          skippedCandidates={[{ reason: 'missing-hostname' }, { reason: 'invalid-port' }]}
        />,
      );
    });

    expect(container.textContent).toContain(
      '2 CalDAV accounts in this profile could not be imported.',
    );
  });
});
