import { openUrl } from '@tauri-apps/plugin-opener';
import Link from 'lucide-react/icons/link';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';

export const TaskItemURLBadge = ({ url }: { url: string }) => (
  <TaskItemBadge
    tone="primary"
    tooltip={`Open link: ${url}`}
    onClick={(e) => {
      e.stopPropagation();
      openUrl(url);
    }}
  >
    <Link className="h-3 w-3" />
    URL
  </TaskItemBadge>
);
