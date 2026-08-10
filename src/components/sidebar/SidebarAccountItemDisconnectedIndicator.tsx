import CloudOff from 'lucide-react/icons/cloud-off';
import Loader2 from 'lucide-react/icons/loader-2';
import { Tooltip } from '$components/Tooltip';
import { useConnectionStore } from '$context/connectionContext';

export const SidebarAccountItemDisconnectedIndicator = ({
  accountId,
  isCalDAV,
}: {
  accountId: string;
  isCalDAV: boolean;
}) => {
  const { getStatus } = useConnectionStore();
  if (!isCalDAV) return null;

  const status = getStatus(accountId);
  if (status === 'connected') return null;

  const isConnecting = status === 'connecting';
  const label = isConnecting
    ? 'Connecting…'
    : status === 'reconnecting'
      ? 'Reconnecting…'
      : 'Disconnected';
  return (
    <Tooltip content={label} position="top">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {status === 'disconnected' ? (
          <CloudOff className="h-3.5 w-3.5 text-semantic-warning" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 text-surface-400 motion-safe:animate-spin" />
        )}
      </span>
    </Tooltip>
  );
};
