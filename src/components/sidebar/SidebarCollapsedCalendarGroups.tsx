import { closestCenter, DndContext, type DragEndEvent, type Modifier } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { MouseEvent, RefObject } from 'react';
import { SidebarCollapsedSortableItem } from '$components/sidebar/SidebarCollapsedSortableItem';
import { Tooltip } from '$components/Tooltip';
import { getIconByName } from '$constants/icons';
import { useReorderCalendars } from '$hooks/queries/useAccounts';
import { useAccountSortConfig, useCalendarSortConfig } from '$hooks/queries/useUIState';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { SidebarCollapsedSensors } from '$hooks/ui/useSidebarCollapsedDragState';
import type { Account } from '$types/account';
import type { Calendar } from '$types/calendar';
import type { Task } from '$types/task/model';

interface SidebarCollapsedCalendarGroupsProps {
  accounts: Account[];
  tasks: Task[];
  activeCalendarId: string | null;
  contextMenu: { type: string; id: string; accountId?: string } | null;
  showLocalSection: boolean;
  localSectionCollapsed: boolean;
  showAccountsSection: boolean;
  accountsSectionCollapsed: boolean;
  sectionOrder: number;
  sensors: SidebarCollapsedSensors;
  dragBoundsRef: RefObject<HTMLDivElement | null>;
  restrictDragToSection: Modifier;
  isAnyDragging: boolean;
  draggingCalendarAccountId: string | null;
  onDraggingAccountChange: (accountId: string | null) => void;
  onSelectCalendar: (accountId: string, calendarId: string) => void;
  onContextMenu: (event: MouseEvent, type: 'calendar', id: string, accountId?: string) => void;
}

const isActiveTask = (task: Task) =>
  !task.deletedAt && task.status !== 'completed' && task.status !== 'cancelled';

export const SidebarCollapsedCalendarGroups = ({
  accounts,
  tasks,
  activeCalendarId,
  contextMenu,
  showLocalSection,
  localSectionCollapsed,
  showAccountsSection,
  accountsSectionCollapsed,
  sectionOrder,
  sensors,
  dragBoundsRef,
  restrictDragToSection,
  isAnyDragging,
  draggingCalendarAccountId,
  onDraggingAccountChange,
  onSelectCalendar,
  onContextMenu,
}: SidebarCollapsedCalendarGroupsProps) => {
  const resolveAccent = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();
  const accountSortConfig = useAccountSortConfig();
  const calendarSortConfig = useCalendarSortConfig();
  const reorderMutation = useReorderCalendars();
  const getTaskCount = (predicate: (task: Task) => boolean) =>
    tasks.filter((task) => isActiveTask(task) && predicate(task)).length;

  const sortedAccounts = (() => {
    const sorted = [...accounts];
    if (accountSortConfig.mode === 'title') {
      sorted.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return accountSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else if (accountSortConfig.mode === 'task-count') {
      sorted.sort((a, b) => {
        const cmp =
          getTaskCount((task) => task.accountId === a.id) -
          getTaskCount((task) => task.accountId === b.id);
        return accountSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else if (accountSortConfig.mode === 'calendar-count') {
      sorted.sort((a, b) => {
        const cmp = a.calendars.length - b.calendars.length;
        return accountSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else {
      sorted.sort((a, b) => {
        const cmp = a.sortOrder - b.sortOrder;
        return accountSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    }
    return sorted;
  })();

  const visibleAccounts = sortedAccounts.filter(
    (account) =>
      (!account.caldav && showLocalSection && !localSectionCollapsed) ||
      (account.caldav && showAccountsSection && !accountsSectionCollapsed),
  );
  const calendarAccounts = [
    ...visibleAccounts.filter((account) => !account.caldav),
    ...visibleAccounts.filter((account) => account.caldav),
  ].filter((account) => account.calendars.length > 0);

  const getSortedCalendars = (calendars: Calendar[]) => {
    const sorted = [...calendars];
    if (calendarSortConfig.mode === 'title') {
      sorted.sort((a, b) => {
        const cmp = a.displayName.localeCompare(b.displayName);
        return calendarSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else if (calendarSortConfig.mode === 'task-count') {
      sorted.sort((a, b) => {
        const cmp =
          getTaskCount((task) => task.calendarId === a.id) -
          getTaskCount((task) => task.calendarId === b.id);
        return calendarSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else {
      sorted.sort((a, b) => {
        const cmp = a.sortOrder - b.sortOrder;
        return calendarSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    }
    return sorted;
  };

  const handleDragEnd = (accountId: string, event: DragEndEvent) => {
    onDraggingAccountChange(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderMutation.mutate({
      accountId,
      activeId: active.id as string,
      overId: over.id as string,
    });
  };

  if (!showLocalSection && !showAccountsSection) return null;

  return (
    <div
      ref={dragBoundsRef}
      className="flex w-full flex-col items-center gap-1"
      style={{ order: sectionOrder }}
    >
      {calendarAccounts.map((account, index) => {
        const sortedCalendars = getSortedCalendars(account.calendars);
        const startsCalendarSection =
          index === 0 || account.caldav !== calendarAccounts[index - 1]?.caldav;

        return (
          <div key={account.id} className="flex w-full flex-col items-center gap-1">
            {startsCalendarSection && (
              <div
                aria-hidden="true"
                className="my-1 h-px w-8 shrink-0 bg-surface-200 dark:bg-surface-700"
              />
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictDragToSection]}
              onDragStart={() => onDraggingAccountChange(account.id)}
              onDragEnd={(event) => handleDragEnd(account.id, event)}
              onDragCancel={() => onDraggingAccountChange(null)}
            >
              <SortableContext
                items={sortedCalendars.map((calendar) => calendar.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedCalendars.map((calendar) => {
                  const CalendarIcon = getIconByName(calendar.icon ?? 'calendar');
                  const isActive = activeCalendarId === calendar.id;
                  const calendarColor = calendar.color
                    ? resolveAccent(calendar.color)
                    : resolvedAccentColor;
                  return (
                    <Tooltip
                      key={calendar.id}
                      content={
                        <span className="flex flex-col whitespace-nowrap leading-tight">
                          <span>{calendar.displayName}</span>
                          <span className="font-normal text-[10px] text-white/65">
                            {account.caldav ? 'Calendar' : 'Local calendar'}
                          </span>
                        </span>
                      }
                      position="right"
                      disabled={isAnyDragging}
                    >
                      <SidebarCollapsedSortableItem
                        id={calendar.id}
                        sortable={calendarSortConfig.mode === 'manual'}
                        isAnyDragging={draggingCalendarAccountId === account.id}
                      >
                        {(dragHandleProps) => (
                          <button
                            type="button"
                            data-context-menu
                            aria-label={`${calendar.displayName} calendar`}
                            onClick={() => onSelectCalendar(account.id, calendar.id)}
                            onContextMenu={(event) =>
                              onContextMenu(event, 'calendar', calendar.id, account.id)
                            }
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
                              isActive
                                ? 'bg-surface-200 dark:bg-surface-700'
                                : contextMenu?.type === 'calendar' && contextMenu.id === calendar.id
                                  ? 'bg-surface-200 dark:bg-surface-700'
                                  : 'hover:bg-surface-200 dark:hover:bg-surface-700'
                            }`}
                            {...dragHandleProps}
                          >
                            {calendar.emoji ? (
                              <span
                                className="text-base leading-none"
                                style={{ color: calendarColor }}
                              >
                                {calendar.emoji}
                              </span>
                            ) : (
                              <CalendarIcon className="h-5 w-5" style={{ color: calendarColor }} />
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
        );
      })}
    </div>
  );
};
