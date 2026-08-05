import type { MouseEvent } from 'react';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
import { getIconByName } from '$constants/icons';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { Tag } from '$types/tag';

export const TaskItemTagBadge = ({
  tag,
  onTagClick,
}: {
  tag: Tag;
  onTagClick: (tagId: string, event: MouseEvent) => void;
}) => {
  const resolveAccent = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();
  const TagIcon = getIconByName(tag.icon || 'tag');
  const tagColor = tag.color ? resolveAccent(tag.color) : resolvedAccentColor;
  return (
    <TaskItemBadge
      color={tagColor}
      onClick={(e) => {
        e.stopPropagation();
        onTagClick(tag.id, e);
      }}
    >
      {tag.emoji ? (
        <span className="text-xs leading-none">{tag.emoji}</span>
      ) : (
        <TagIcon className="h-3 w-3" />
      )}
      {tag.name}
    </TaskItemBadge>
  );
};
