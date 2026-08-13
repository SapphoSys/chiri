import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskEditorDescription } from '$components/taskEditor/TaskEditorDescription';
import { makeTask } from '../fixtures';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('$hooks/ui/useDebouncedTaskUpdate', () => ({
  useDebouncedTaskUpdate: (_taskId: string, _fieldName: string, initialValue: string) => [
    initialValue,
    vi.fn(),
  ],
}));

describe('TaskEditorDescription', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('resizes to fit the description and shrinks when content is removed', async () => {
    const textareaHeight = (height: number) => {
      const textarea = container.querySelector<HTMLTextAreaElement>('#task-description');
      if (!textarea) throw new Error('missing description textarea');
      Object.defineProperty(textarea, 'scrollHeight', {
        configurable: true,
        value: height,
      });
    };

    await act(async () => {
      root.render(<TaskEditorDescription task={makeTask({ description: 'A long description' })} />);
    });
    textareaHeight(160);

    await act(async () => {
      root.render(
        <TaskEditorDescription task={makeTask({ description: 'A long description updated' })} />,
      );
    });

    expect(container.querySelector<HTMLTextAreaElement>('#task-description')?.style.height).toBe(
      '160px',
    );

    textareaHeight(48);
    await act(async () => {
      root.render(<TaskEditorDescription task={makeTask({ description: 'Short' })} />);
    });

    expect(container.querySelector<HTMLTextAreaElement>('#task-description')?.style.height).toBe(
      '48px',
    );
  });
});
