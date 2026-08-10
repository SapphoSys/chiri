import { type ReactNode, useCallback, useSyncExternalStore } from 'react';
import {
  ConnectionContext,
  type ConnectionStore,
  connectionStore,
} from '$context/connectionContext';

export const ConnectionProvider = ({ children }: { children: ReactNode }) => {
  const currentState = useSyncExternalStore(
    connectionStore.subscribe,
    connectionStore.getSnapshot,
    connectionStore.getSnapshot,
  );

  const setConnection = useCallback(
    (accountId: string, connection: Parameters<typeof connectionStore.setConnection>[1]) => {
      connectionStore.setConnection(accountId, connection);
    },
    [],
  );

  const getConnection = useCallback((accountId: string) => {
    return connectionStore.getConnection(accountId);
  }, []);

  const deleteConnection = useCallback((accountId: string) => {
    connectionStore.deleteConnection(accountId);
  }, []);

  const hasConnection = useCallback((accountId: string) => {
    return connectionStore.hasConnection(accountId);
  }, []);

  const getStatus = useCallback((accountId: string) => {
    return connectionStore.getStatus(accountId);
  }, []);

  const beginConnection = useCallback((accountId: string) => {
    connectionStore.beginConnection(accountId);
  }, []);

  const beginTesting = useCallback((accountId: string, operationId?: string) => {
    return connectionStore.beginTesting(accountId, operationId);
  }, []);

  const endTesting = useCallback((accountId: string, operationId?: string) => {
    connectionStore.endTesting(accountId, operationId);
  }, []);

  const isTesting = useCallback((accountId: string) => {
    return connectionStore.isTesting(accountId);
  }, []);

  const isAnyTesting = useCallback(() => {
    return connectionStore.isAnyTesting();
  }, []);

  const value: ConnectionStore = {
    ...currentState,
    setConnection,
    getConnection,
    deleteConnection,
    hasConnection,
    getStatus,
    beginConnection,
    beginTesting,
    endTesting,
    isTesting,
    isAnyTesting,
  };

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
};
