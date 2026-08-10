import Edit2 from 'lucide-react/icons/edit-2';
import Trash2 from 'lucide-react/icons/trash-2';

interface SidebarFilterItemContextMenuProps {
  filterId: string;
  onClose: () => void;
  onEditFilter: (filterId: string) => void;
  onDeleteFilter: (filterId: string) => Promise<void>;
}

export const SidebarFilterItemContextMenu = ({
  filterId,
  onClose,
  onEditFilter,
  onDeleteFilter,
}: SidebarFilterItemContextMenuProps) => (
  <>
    <button
      type="button"
      onClick={() => {
        onEditFilter(filterId);
        onClose();
      }}
      className="flex w-full items-center gap-2 rounded-t-md px-3 py-2 text-sm text-surface-700 outline-hidden hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:text-surface-300 dark:hover:bg-surface-700"
    >
      <Edit2 className="h-4 w-4" />
      Edit Filter
    </button>

    <div className="border-surface-200 border-t dark:border-surface-700" />

    <button
      type="button"
      onClick={async () => {
        onClose();
        await onDeleteFilter(filterId);
      }}
      className="flex w-full items-center gap-2 rounded-b-md px-3 py-2 text-semantic-error text-sm outline-hidden hover:bg-semantic-error/15 focus-visible:ring-2 focus-visible:ring-semantic-error focus-visible:ring-inset"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </button>
  </>
);
