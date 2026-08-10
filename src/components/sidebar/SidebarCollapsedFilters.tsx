import { closestCenter, DndContext, type DragEndEvent, type Modifier } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { MouseEvent, RefObject } from 'react';
import { SidebarCollapsedSortableItem } from '$components/sidebar/SidebarCollapsedSortableItem';
import { Tooltip } from '$components/Tooltip';
import { getIconByName } from '$constants/icons';
import { useReorderFilters } from '$hooks/queries/useFilters';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { SidebarCollapsedSensors } from '$hooks/ui/useSidebarCollapsedDragState';
import type { Filter } from '$types/filter';

interface SidebarCollapsedFiltersProps {
  filters: Filter[];
  activeFilterId: string | null;
  contextMenu: { type: string; id: string } | null;
  showFiltersSection: boolean;
  filtersSectionCollapsed: boolean;
  sectionOrder: number;
  sensors: SidebarCollapsedSensors;
  dragBoundsRef: RefObject<HTMLDivElement | null>;
  restrictDragToSection: Modifier;
  isAnyDragging: boolean;
  onDraggingChange: (isDragging: boolean) => void;
  onSelectFilter: (filterId: string) => void;
  onContextMenu: (event: MouseEvent, type: 'filter', id: string) => void;
}

export const SidebarCollapsedFilters = ({
  filters,
  activeFilterId,
  contextMenu,
  showFiltersSection,
  filtersSectionCollapsed,
  sectionOrder,
  sensors,
  dragBoundsRef,
  restrictDragToSection,
  isAnyDragging,
  onDraggingChange,
  onSelectFilter,
  onContextMenu,
}: SidebarCollapsedFiltersProps) => {
  const resolveAccent = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();
  const reorderMutation = useReorderFilters();
  const sortedFilters = [...filters].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragEnd = (event: DragEndEvent) => {
    onDraggingChange(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderMutation.mutate({ activeId: active.id as string, overId: over.id as string });
  };

  if (!showFiltersSection || filtersSectionCollapsed) return null;

  return (
    <>
      {filters.length > 0 && (
        <div
          className="my-1 h-px w-8 shrink-0 bg-surface-200 dark:bg-surface-700"
          style={{ order: sectionOrder }}
        />
      )}
      {sortedFilters.length > 0 && (
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
              items={sortedFilters.map((filter) => filter.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedFilters.map((filter) => {
                const isActive = activeFilterId === filter.id;
                const FilterIcon = getIconByName(filter.icon ?? 'list-todo');
                const filterColor = filter.color
                  ? resolveAccent(filter.color)
                  : resolvedAccentColor;
                return (
                  <Tooltip
                    key={filter.id}
                    content={
                      <span className="flex flex-col whitespace-nowrap leading-tight">
                        <span>{filter.name}</span>
                        <span className="font-normal text-[10px] text-white/65">Filter</span>
                      </span>
                    }
                    position="right"
                    disabled={isAnyDragging}
                  >
                    <SidebarCollapsedSortableItem
                      id={filter.id}
                      sortable
                      isAnyDragging={isAnyDragging}
                    >
                      {(dragHandleProps) => (
                        <button
                          type="button"
                          data-context-menu
                          aria-label={`${filter.name} filter`}
                          onClick={() => onSelectFilter(filter.id)}
                          onContextMenu={(event) => onContextMenu(event, 'filter', filter.id)}
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
                            isActive
                              ? 'bg-surface-200 dark:bg-surface-700'
                              : contextMenu?.type === 'filter' && contextMenu.id === filter.id
                                ? 'bg-surface-200 dark:bg-surface-700'
                                : 'hover:bg-surface-200 dark:hover:bg-surface-700'
                          }`}
                          {...dragHandleProps}
                        >
                          {filter.emoji ? (
                            <span className="text-base leading-none" style={{ color: filterColor }}>
                              {filter.emoji}
                            </span>
                          ) : (
                            <FilterIcon className="h-5 w-5" style={{ color: filterColor }} />
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
