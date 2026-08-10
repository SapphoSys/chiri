import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ModalWrapper } from '$components/ModalWrapper';
import { DismissableLayerProvider } from '$providers/DismissableLayerProvider';
import { ModalStateProvider } from '$providers/ModalStateProvider';

const globalWithActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

const ModalHandoff = () => {
  const [activeModal, setActiveModal] = useState<'first' | 'second'>('first');

  return (
    <>
      <button type="button" onClick={() => setActiveModal('second')}>
        Open second modal
      </button>
      <ModalWrapper isOpen={activeModal === 'first'} title="first modal" onClose={() => {}}>
        first
      </ModalWrapper>
      <ModalWrapper isOpen={activeModal === 'second'} title="second modal" onClose={() => {}}>
        second
      </ModalWrapper>
    </>
  );
};

describe('ModalWrapper', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it('keeps the backdrop opaque when handing off to another modal', () => {
    act(() => {
      root.render(
        <DismissableLayerProvider>
          <ModalStateProvider>
            <ModalHandoff />
          </ModalStateProvider>
        </DismissableLayerProvider>,
      );
    });

    const initialBackdrop = document.querySelector('.modal-backdrop-layer');
    expect(initialBackdrop).not.toBeNull();
    expect(initialBackdrop?.classList.contains('motion-safe:animate-fade-in')).toBe(true);

    act(() => {
      container.querySelector('button')?.click();
    });

    const backdrop = document.querySelector('.modal-backdrop-layer');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.classList.contains('motion-safe:animate-fade-in')).toBe(false);
    expect(backdrop?.classList.contains('motion-safe:animate-fade-in-from-dimmed')).toBe(true);
  });
});
