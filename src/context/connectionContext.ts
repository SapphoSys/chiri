import { createContext, useContext } from 'react';
import type { CalDAVCredentials } from '$lib/http';
import type { ServerType } from '$types/account';

interface AccountConnection {
  serverUrl: string;
  credentials: CalDAVCredentials;
  principalUrl: string;
  calendarHome: string;
  serverType: ServerType;
}

interface ConnectionState {
  connections: Record<string, AccountConnection>;
  statuses: Record<string, AccountConnectionStatus>;
  testingAccountIds: Record<string, true>;
  testingOperationIds: Record<string, string>;
}

export type AccountConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

interface ConnectionActions {
  setConnection: (accountId: string, connection: AccountConnection) => void;
  getConnection: (accountId: string) => AccountConnection | undefined;
  deleteConnection: (accountId: string) => void;
  hasConnection: (accountId: string) => boolean;
  getStatus: (accountId: string) => AccountConnectionStatus;
  beginConnection: (accountId: string) => void;
  beginTesting: (accountId: string, operationId?: string) => boolean;
  endTesting: (accountId: string, operationId?: string) => void;
  isTesting: (accountId: string) => boolean;
  isAnyTesting: () => boolean;
}

export type ConnectionStore = ConnectionState & ConnectionActions;

// singleton store for accessing state outside React
let state: ConnectionState = {
  connections: {},
  statuses: {},
  testingAccountIds: {},
  testingOperationIds: {},
};
const listeners = new Set<() => void>();

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => {
  return state;
};

// actions that can be called from anywhere
export const connectionStore = {
  getState: () => state,
  subscribe,
  getSnapshot,

  setConnection: (accountId: string, connection: AccountConnection) => {
    state = {
      ...state,
      connections: {
        ...state.connections,
        [accountId]: connection,
      },
      statuses: {
        ...state.statuses,
        [accountId]: 'connected',
      },
    };
    emitChange();
  },

  getConnection: (accountId: string) => state.connections[accountId],

  deleteConnection: (accountId: string) => {
    const { [accountId]: _, ...rest } = state.connections;
    state = {
      ...state,
      connections: rest,
      statuses: { ...state.statuses, [accountId]: 'disconnected' },
    };
    emitChange();
  },

  hasConnection: (accountId: string) => accountId in state.connections,

  getStatus: (accountId: string) => state.statuses[accountId] ?? 'disconnected',

  beginConnection: (accountId: string) => {
    state = {
      ...state,
      statuses: {
        ...state.statuses,
        [accountId]: accountId in state.connections ? 'reconnecting' : 'connecting',
      },
    };
    emitChange();
  },

  beginTesting: (accountId: string, operationId?: string) => {
    if (accountId in state.testingAccountIds) return false;

    state = {
      ...state,
      testingAccountIds: {
        ...state.testingAccountIds,
        [accountId]: true,
      },
      testingOperationIds: operationId
        ? { ...state.testingOperationIds, [accountId]: operationId }
        : state.testingOperationIds,
    };
    emitChange();
    return true;
  },

  endTesting: (accountId: string, operationId?: string) => {
    if (operationId && state.testingOperationIds[accountId] !== operationId) return;

    const { [accountId]: _, ...rest } = state.testingAccountIds;
    const { [accountId]: _operationId, ...restOperations } = state.testingOperationIds;
    state = {
      ...state,
      testingAccountIds: rest,
      testingOperationIds: restOperations,
    };
    emitChange();
  },

  isTesting: (accountId: string) => accountId in state.testingAccountIds,

  isAnyTesting: () => Object.keys(state.testingAccountIds).length > 0,
};

// context for React components
export const ConnectionContext = createContext<ConnectionStore | null>(null);

export const useConnectionStore = (): ConnectionStore => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnectionStore must be used within a ConnectionProvider');
  }
  return context;
};
