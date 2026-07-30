import { act, createElement, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccountConnectionTestRunner } from '$hooks/account/useAccountConnectionTestRunner';
import type { Account } from '$types/account';

const { testAccountConnectionMock } = vi.hoisted(() => ({
  testAccountConnectionMock: vi.fn(),
}));

vi.mock('$lib/caldav/test', () => ({
  testAccountConnection: testAccountConnectionMock,
}));

const account: Account = {
  id: 'runner-test-account',
  name: 'Runner test account',
  calendars: [],
  isActive: true,
  sortOrder: 0,
  caldav: {
    serverUrl: 'https://example.com',
    username: 'user',
    password: 'password',
    serverType: 'generic',
    authType: 'basic',
  },
};

const RunnerProbe = () => {
  const { runTest } = useAccountConnectionTestRunner({
    enforceVapid: false,
    operationIdPrefix: 'runner-test',
  });
  const [result, setResult] = useState('idle');

  return (
    <button
      type="button"
      data-result={result}
      onClick={async () => {
        try {
          await runTest(account);
          setResult('success');
        } catch {
          setResult('error');
        }
      }}
    />
  );
};

describe('useAccountConnectionTestRunner', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    testAccountConnectionMock.mockReset();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(createElement(RunnerProbe)));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('passes a scoped operation context to the shared connection test', async () => {
    testAccountConnectionMock.mockResolvedValue({ calendars: [], diagnostics: {}, notice: null });

    await act(async () => {
      container.querySelector('button')?.click();
    });

    const [, enforceVapid, context] = testAccountConnectionMock.mock.calls[0];
    expect(enforceVapid).toBe(false);
    expect(context.operationId).toMatch(/^runner-test:runner-test-account:/);
    expect(context.signal).toBeInstanceOf(AbortSignal);
    expect(container.querySelector('button')?.dataset.result).toBe('success');
  });

  it('aborts active tests when the caller unmounts', () => {
    let signal: AbortSignal | undefined;
    testAccountConnectionMock.mockImplementation(
      (_account: Account, _enforceVapid: boolean, context: { signal: AbortSignal }) => {
        signal = context.signal;
        return new Promise(() => {});
      },
    );

    act(() => {
      container.querySelector('button')?.click();
    });
    expect(signal?.aborted).toBe(false);

    act(() => root.unmount());
    expect(signal?.aborted).toBe(true);
  });
});
