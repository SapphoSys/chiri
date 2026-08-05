import { openUrl } from '@tauri-apps/plugin-opener';
import Link from 'lucide-react/icons/link';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';

export const TaskItemURLBadge = ({ url }: { url: string }) => (
  <TaskItemBadge
    tone="primary"
    onClick={(e) => {
      e.stopPropagation();
      openUrl(url);
    }}
    title={url}
  >
    <Link className="h-3 w-3" />
    URL
  </TaskItemBadge>
);
