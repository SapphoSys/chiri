import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, StrictMode } from 'react';
import ReactDOM, { type Root } from 'react-dom/client';
import { BootstrapErrorScreen } from '$components/BootstrapErrorScreen';
import { ErrorBoundary } from '$components/ErrorBoundary';
import { GlobalDragRegion } from '$components/GlobalDragRegion';
import { settingsStore } from '$context/settingsContext';
import {
  applyHiddenWindowDockIconState,
  deleteDatabase,
  forceShowWindow,
  initializeApp,
  initializeTray,
  shouldShowWindowOnStartup,
  showWindow,
} from '$lib/bootstrap';
import { BOOTSTRAP_ERROR_SIMULATION_EVENT } from '$lib/bootstrapErrorSimulation';
import { loggers } from '$lib/logger';
import { queryClient } from '$lib/queryClient';
import { ConfirmDialogProvider } from '$providers/ConfirmDialogProvider';
import { ConnectionProvider } from '$providers/ConnectionProvider';
import { DismissableLayerProvider } from '$providers/DismissableLayerProvider';
import { ModalStateProvider } from '$providers/ModalStateProvider';
import { NotificationProvider } from '$providers/NotificationProvider';
import { SettingsProvider } from '$providers/SettingsProvider';
import { SyncProvider } from '$providers/SyncProvider';
import { TaskHighlightProvider } from '$providers/TaskHighlightProvider';
import { TaskSelectionProvider } from '$providers/TaskSelectionProvider';
import { ToastProvider } from '$providers/ToastProvider';

import App from '~/App';
import '$styles/index.css';

const log = loggers.main;

let root: Root | null = null;

const renderRoot = (children: ReactNode) => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  root ??= ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <GlobalDragRegion />
      {children}
    </StrictMode>,
  );
};

const renderApp = () => {
  renderRoot(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <NotificationProvider>
            <ConnectionProvider>
              <SyncProvider>
                <DismissableLayerProvider>
                  <ModalStateProvider>
                    <ConfirmDialogProvider>
                      <TaskSelectionProvider>
                        <TaskHighlightProvider>
                          <ToastProvider />
                          <App />
                        </TaskHighlightProvider>
                      </TaskSelectionProvider>
                    </ConfirmDialogProvider>
                  </ModalStateProvider>
                </DismissableLayerProvider>
              </SyncProvider>
            </ConnectionProvider>
          </NotificationProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>,
  );
};

const renderBootstrapError = (error: unknown) => {
  renderRoot(<BootstrapErrorScreen error={error} onResetDatabase={deleteDatabase} />);
};

const bootstrap = async () => {
  const simulateBootstrapErrorOnStartup = settingsStore.getState().simulateBootstrapErrorOnStartup;

  await initializeApp();

  if (simulateBootstrapErrorOnStartup) {
    settingsStore.setSimulateBootstrapErrorOnStartup(false);
    throw new Error('Simulated critical startup error');
  }

  renderApp();
  if (await shouldShowWindowOnStartup()) {
    await showWindow();
  } else {
    await applyHiddenWindowDockIconState();
  }
};

window.addEventListener(BOOTSTRAP_ERROR_SIMULATION_EVENT, () => {
  log.warn('Simulating critical startup error from diagnostics controls');
  void (async () => {
    await initializeTray();
    renderBootstrapError(new Error('Simulated critical startup error'));
    await forceShowWindow().catch((error) => {
      log.error('Failed to show simulated bootstrap error window:', error);
    });
  })();
});

await bootstrap().catch(async (error) => {
  log.error('Failed to initialize app:', error);
  await initializeTray();
  renderBootstrapError(error);
  // still show window so user can see the error
  await forceShowWindow().catch((windowError) => {
    log.error('Failed to show bootstrap error window:', windowError);
  });
});
