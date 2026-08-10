import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MobileConfigSignatureWarning } from '$components/modals/MobileConfigSignatureWarning';

const globalWithActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

describe('MobileConfigSignatureWarning', () => {
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

  it('renders nothing for unsigned profiles', () => {
    act(() => {
      root.render(<MobileConfigSignatureWarning signature="unsigned" />);
    });

    expect(container.textContent).toBe('');
  });

  it('shows signer metadata without claiming verification', () => {
    act(() => {
      root.render(
        <MobileConfigSignatureWarning
          signature="signed-unverified"
          signer={{ commonName: 'Fallback Name', organization: 'Example Org' }}
        />,
      );
    });

    expect(container.textContent).toContain('signed by Example Org');
    expect(container.textContent).toContain('has not verified the signer yet');
  });
});
