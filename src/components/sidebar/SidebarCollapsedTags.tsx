import { closestCenter, DndContext, type DragEndEvent, type Modifier } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { MouseEvent, RefObject } from 'react';
import { SidebarCollapsedSortableItem } from '$components/sidebar/SidebarCollapsedSortableItem';
import { Tooltip } from '$components/Tooltip';
import { getIconByName } from '$constants/icons';
import { useReorderTags } from '$hooks/queries/useTags';
import { useTagSortConfig } from '$hooks/queries/useUIState';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { SidebarCollapsedSensors } from '$hooks/ui/useSidebarCollapsedDragState';
import type { Tag } from '$types/tag';
import type { Task } from '$types/task/model';

interface SidebarCollapsedTagsProps {
  tags: Tag[];
  tasks: Task[];
  activeTagId: string | null;
  contextMenu: { type: string; id: string } | null;
  showTagsSection: boolean;
  tagsSectionCollapsed: boolean;
  sectionOrder: number;
  sensors: SidebarCollapsedSensors;
  dragBoundsRef: RefObject<HTMLDivElement | null>;
  restrictDragToSection: Modifier;
  isAnyDragging: boolean;
  onDraggingChange: (isDragging: boolean) => void;
  onSelectTag: (tagId: string) => void;
  onContextMenu: (event: MouseEvent, type: 'tag', id: string) => void;
}

const isActiveTask = (task: Task) =>
  !task.deletedAt && task.status !== 'completed' && task.status !== 'cancelled';

export const SidebarCollapsedTags = ({
  tags,
  tasks,
  activeTagId,
  contextMenu,
  showTagsSection,
  tagsSectionCollapsed,
  sectionOrder,
  sensors,
  dragBoundsRef,
  restrictDragToSection,
  isAnyDragging,
  onDraggingChange,
  onSelectTag,
  onContextMenu,
}: SidebarCollapsedTagsProps) => {
  const resolveAccent = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();
  const tagSortConfig = useTagSortConfig();
  const reorderMutation = useReorderTags();
  const getTaskCount = (tagId: string) =>
    tasks.filter((task) => (task.tags ?? []).includes(tagId) && isActiveTask(task)).length;
  const sortedTags = (() => {
    const sorted = [...tags];
    if (tagSortConfig.mode === 'title') {
      sorted.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return tagSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else if (tagSortConfig.mode === 'task-count') {
      sorted.sort((a, b) => {
        const cmp = getTaskCount(a.id) - getTaskCount(b.id);
        return tagSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else {
      sorted.sort((a, b) => {
        const cmp = a.sortOrder - b.sortOrder;
        return tagSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    }
    return sorted;
  })();

  const handleDragEnd = (event: DragEndEvent) => {
    onDraggingChange(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderMutation.mutate({ activeId: active.id as string, overId: over.id as string });
  };

  if (!showTagsSection || tagsSectionCollapsed) return null;

  return (
    <>
      {tags.length > 0 && (
        <div
          className="my-1 h-px w-8 shrink-0 bg-surface-200 dark:bg-surface-700"
          style={{ order: sectionOrder }}
        />
      )}
      {sortedTags.length > 0 && (
        <div
          ref={dragBoundsRef}
          className="flex flex-col items-center gap-1"
          style={{ order: sectionOrder }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictDragToSection]}
            onDragStart={() => onDraggingChange(true)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => onDraggingChange(false)}
          >
            <SortableContext
              items={sortedTags.map((tag) => tag.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedTags.map((tag) => {
                const isActive = activeTagId === tag.id;
                const TagIcon = getIconByName(tag.icon ?? 'tag');
                const tagColor = tag.color ? resolveAccent(tag.color) : resolvedAccentColor;
                return (
                  <Tooltip
                    key={tag.id}
                    content={
                      <span className="flex flex-col whitespace-nowrap leading-tight">
                        <span>{tag.name}</span>
                        <span className="font-normal text-[10px] text-white/65">Tag</span>
                      </span>
                    }
                    position="right"
                    disabled={isAnyDragging}
                  >
                    <SidebarCollapsedSortableItem
                      id={tag.id}
                      sortable={tagSortConfig.mode === 'manual'}
                      isAnyDragging={isAnyDragging}
                    >
                      {(dragHandleProps) => (
                        <button
                          type="button"
                          data-context-menu
                          aria-label={`${tag.name} tag`}
                          onClick={() => onSelectTag(tag.id)}
                          onContextMenu={(event) => onContextMenu(event, 'tag', tag.id)}
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
                            isActive
                              ? 'bg-surface-200 dark:bg-surface-700'
                              : contextMenu?.type === 'tag' && contextMenu.id === tag.id
                                ? 'bg-surface-200 dark:bg-surface-700'
                                : 'hover:bg-surface-200 dark:hover:bg-surface-700'
                          }`}
                          {...dragHandleProps}
                        >
                          {tag.emoji ? (
                            <span className="text-base leading-none" style={{ color: tagColor }}>
                              {tag.emoji}
                            </span>
                          ) : (
                            <TagIcon className="h-5 w-5" style={{ color: tagColor }} />
                          )}
                        </button>
                      )}
                    </SidebarCollapsedSortableItem>
                  </Tooltip>
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </>
  );
};
