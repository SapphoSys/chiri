import type { ReactNode } from 'react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ConnectionNoticeBanner } from '$components/banners/ConnectionNoticeBanner';
import { ServerTypeDescriptionBanner } from '$components/banners/ServerTypeDescriptionBanner';
import { ComposedInput } from '$components/ComposedInput';
import { BrowserAuthStep } from '$components/modals/AccountModal/BrowserAuthStep';
import { useInitialFocusRef } from '$hooks/ui/useInitialFocusRef';
import { type CalDAVSetupError, toCalDAVSetupError } from '$lib/caldav/setup';
import { hasHttpUrlScheme } from '$lib/caldav/utils';
import type { ServerType } from '$types';

export type BrowserAuthFlowPhase = 'idle' | 'validating' | 'browser' | 'connecting' | 'done';

export interface BrowserAuthFlowHandle {
  connect: () => void;
  cancel: () => void;
  getPhase: () => BrowserAuthFlowPhase;
}

interface BrowserAuthFlowProps {
  providerName: string;
  serverType: ServerType;
  requiresServerUrl?: boolean;
  urlLabel?: string;
  urlPlaceholder?: string;
  urlValue?: string;
  onUrlChange?: (url: string) => void;
  validateServerUrl?: (serverUrl: string, signal: AbortSignal) => Promise<void>;
  idleExtra?: ReactNode;
  startFlow: (opts: {
    serverUrl: string;
    signal: AbortSignal;
    setPhase: (phase: 'browser' | 'connecting') => void;
  }) => Promise<void>;
  onSuccess: () => void;
  onPhaseChange?: (phase: BrowserAuthFlowPhase) => void;
  onConnectStateChange?: (state: { disabled: boolean; loading: boolean }) => void;
}

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

export const BrowserAuthFlow = forwardRef<BrowserAuthFlowHandle, BrowserAuthFlowProps>(
  (
    {
      providerName,
      serverType,
      requiresServerUrl = false,
      urlLabel,
      urlPlaceholder,
      urlValue = '',
      onUrlChange,
      validateServerUrl,
      idleExtra,
      startFlow,
      onSuccess,
      onPhaseChange,
      onConnectStateChange,
    },
    ref,
  ) => {
    const [phase, setPhase] = useState<BrowserAuthFlowPhase>('idle');
    const [error, setError] = useState<CalDAVSetupError | null>(null);
    const [direction, setDirection] = useState<'forward' | 'back' | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const flowIdRef = useRef(0);
    const prevPhaseRef = useRef<BrowserAuthFlowPhase>('idle');
    const focusRef = useInitialFocusRef<HTMLInputElement>();

    const updatePhase = (next: BrowserAuthFlowPhase) => {
      setPhase(next);
      onPhaseChange?.(next);
    };

    const isUrlValid = !requiresServerUrl || (urlValue.trim() && hasHttpUrlScheme(urlValue));
    const isLoading = phase === 'browser' || phase === 'connecting' || phase === 'done';

    useEffect(() => {
      onConnectStateChange?.({ disabled: isLoading || !isUrlValid, loading: isLoading });
    }, [isLoading, isUrlValid, onConnectStateChange]);

    useEffect(() => {
      if (prevPhaseRef.current === 'idle' && phase !== 'idle') {
        setDirection('forward');
      } else if (prevPhaseRef.current !== 'idle' && phase === 'idle') {
        setDirection('back');
      } else {
        setDirection(null);
      }
      prevPhaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
      return () => {
        controllerRef.current?.abort();
      };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing && isUrlValid && !isLoading) {
        e.preventDefault();
        void handleConnect();
      }
    };

    const handleConnect = async () => {
      if (!isUrlValid) return;

      setError(null);
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const flowId = ++flowIdRef.current;

      try {
        if (validateServerUrl) {
          updatePhase('validating');
          await validateServerUrl(urlValue.trim(), controller.signal);

          if (flowId !== flowIdRef.current) return;
        } else {
          updatePhase('browser');
        }

        await startFlow({
          serverUrl: urlValue.trim(),
          signal: controller.signal,
          setPhase: (next) => {
            if (flowId === flowIdRef.current) {
              updatePhase(next);
            }
          },
        });

        if (flowId !== flowIdRef.current) return;

        updatePhase('done');
        onSuccess();
      } catch (e) {
        if (flowId !== flowIdRef.current) return;

        if (isAbortError(e)) {
          updatePhase('idle');
          return;
        }

        setError(
          toCalDAVSetupError(
            `Could not connect to ${providerName}`,
            e,
            'Please check the URL and server type and try again.',
          ),
        );
        updatePhase('idle');
      } finally {
        if (flowId === flowIdRef.current) {
          controllerRef.current = null;
        }
      }
    };

    const handleCancel = () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
      flowIdRef.current++;
      setError(null);
      updatePhase('idle');
    };

    useImperativeHandle(ref, () => ({
      connect: handleConnect,
      cancel: handleCancel,
      getPhase: () => phase,
    }));

    const contentAnimationClass =
      direction === 'forward'
        ? 'motion-safe:animate-step-forward'
        : direction === 'back'
          ? 'motion-safe:animate-step-back'
          : '';

    return (
      <div className="space-y-4 p-4">
        <div
          key={phase === 'idle' ? 'idle' : 'active'}
          className={`space-y-4 ${contentAnimationClass}`}
        >
          {phase === 'idle' && <ServerTypeDescriptionBanner serverType={serverType} />}

          {phase === 'idle' && requiresServerUrl && (
            <div>
              <label
                htmlFor="browser-auth-server-url"
                className="mb-1 block font-medium text-sm text-surface-700 dark:text-surface-300"
              >
                {urlLabel}
              </label>
              <ComposedInput
                ref={focusRef}
                id="browser-auth-server-url"
                type="text"
                placeholder={urlPlaceholder}
                value={urlValue}
                onChange={onUrlChange ?? (() => {})}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="w-full rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-800 transition-colors focus:border-primary-500 focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
              />
              {idleExtra}
            </div>
          )}

          <BrowserAuthStep providerName={providerName} phase={phase} />
        </div>

        {error && (
          <div key="browser-auth-error" className="motion-safe:animate-fade-in">
            <ConnectionNoticeBanner
              success={false}
              error={error}
              notice={null}
              calendarCount={0}
              onDismiss={() => setError(null)}
            />
          </div>
        )}
      </div>
    );
  },
);

BrowserAuthFlow.displayName = 'BrowserAuthFlow';
