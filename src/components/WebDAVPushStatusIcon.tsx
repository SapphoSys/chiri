import CircleAlert from 'lucide-react/icons/circle-alert';
import TriangleAlert from 'lucide-react/icons/triangle-alert';
import Zap from 'lucide-react/icons/zap';
import ZapOff from 'lucide-react/icons/zap-off';
import { LoadingSpinner } from '$components/LoadingSpinner';
import type { WebDAVPushStatus } from '$lib/push/status';

export const WebDAVPushStatusIcon = ({ icon }: { icon: WebDAVPushStatus['icon'] }) => {
  switch (icon) {
    case 'checking':
      return <LoadingSpinner className="size-3.5" />;
    case 'alert':
      return <TriangleAlert className="size-3.5 shrink-0" />;
    case 'warning':
      return <CircleAlert className="size-3.5 shrink-0" />;
    case 'off':
      return <ZapOff className="size-3.5 shrink-0" />;
    case 'ready':
      return <Zap className="size-3.5 shrink-0 fill-current" />;
  }
};
