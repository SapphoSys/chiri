import type { MouseEvent } from 'react';
import { SidebarAccountsList } from '$components/sidebar/SidebarAccountsList';
import { SidebarFiltersList } from '$components/sidebar/SidebarFiltersList';
import { SidebarLocalList } from '$components/sidebar/SidebarLocalList';
import { SidebarTagsList } from '$components/sidebar/SidebarTagsList';
import type { Account } from '$types/account';
import type { Filter } from '$types/filter';
import type { SidebarSectionKey } from '$types/settings/categories/navigation';
import type { Tag } from '$types/tag';
import type { Task } from '$types/task/model';

export type SidebarContextMenuState = {
  type: 'account' | 'calendar' | 'tag' | 'filter' | 'accounts-section';
  id: string;
  accountId?: string;
} | null;

export interface SidebarSectionsProps {
  activeCalendarId: string | null;
  activeTagId: string | null;
  activeFilterId: string | null;
  localAccounts: Account[];
  caldavAccounts: Account[];
  tags: Tag[];
  filters: Filter[];
  tasks: Task[];
  expandedAccounts: Set<string>;
  contextMenu: SidebarContextMenuState;
  isAnyModalOpen: boolean;
  activeAccountMenuTriggerId: string | null;
  showSidebarTaskCounts: boolean;
  localSectionCollapsed: boolean;
  accountsSectionCollapsed: boolean;
  filtersSectionCollapsed: boolean;
  tagsSectionCollapsed: boolean;
  showLocalSection: boolean;
  showAccountsSection: boolean;
  showFiltersSection: boolean;
  showTagsSection: boolean;
  sidebarSectionOrder: SidebarSectionKey[];
  onSelectCalendar: (accountId: string, calendarId: string) => void;
  onSelectTag: (tagId: string) => void;
  onSelectFilter: (filterId: string) => void;
  onContextMenu: (
    event: MouseEvent,
    type: 'account' | 'calendar' | 'tag' | 'filter' | 'accounts-section',
    id: string,
    accountId?: string,
  ) => void;
  onToggleLocalSection: () => void;
  onToggleAccountsSection: () => void;
  onToggleFiltersSection: () => void;
  onToggleTagsSection: () => void;
  onToggleAccount: (accountId: string) => void;
  onAddLocalCalendar: () => void;
  onCreateCalendar: (accountId: string) => void;
  onAddAccount: () => void;
  onAddFilter: () => void;
  onAddTag: () => void;
}

export const SidebarSections = ({
  activeCalendarId,
  activeTagId,
  activeFilterId,
  localAccounts,
  caldavAccounts,
  tags,
  filters,
  tasks,
  expandedAccounts,
  contextMenu,
  isAnyModalOpen,
  activeAccountMenuTriggerId,
  showSidebarTaskCounts,
  localSectionCollapsed,
  accountsSectionCollapsed,
  filtersSectionCollapsed,
  tagsSectionCollapsed,
  showLocalSection,
  showAccountsSection,
  showFiltersSection,
  showTagsSection,
  sidebarSectionOrder,
  onSelectCalendar,
  onSelectTag,
  onSelectFilter,
  onContextMenu,
  onToggleLocalSection,
  onToggleAccountsSection,
  onToggleFiltersSection,
  onToggleTagsSection,
  onToggleAccount,
  onAddLocalCalendar,
  onCreateCalendar,
  onAddAccount,
  onAddFilter,
  onAddTag,
}: SidebarSectionsProps) => {
  const renderSection = (section: SidebarSectionKey) => {
    if (section === 'filters') {
      return showFiltersSection ? (
        <SidebarFiltersList
          key={section}
          filters={filters}
          tasks={tasks}
          activeFilterId={activeFilterId}
          contextMenu={contextMenu}
          isAnyModalOpen={isAnyModalOpen}
          showTaskCounts={showSidebarTaskCounts}
          collapsed={filtersSectionCollapsed}
          onToggle={onToggleFiltersSection}
          onSelectFilter={onSelectFilter}
          onAddFilter={onAddFilter}
          onContextMenu={onContextMenu}
        />
      ) : null;
    }

    if (section === 'local') {
      return showLocalSection ? (
        <SidebarLocalList
          key={section}
          accounts={localAccounts}
          tasks={tasks}
          activeCalendarId={activeCalendarId}
          contextMenu={contextMenu}
          isAnyModalOpen={isAnyModalOpen}
          showTaskCounts={showSidebarTaskCounts}
          collapsed={localSectionCollapsed}
          onToggle={onToggleLocalSection}
          onContextMenu={onContextMenu}
          onSelectCalendar={onSelectCalendar}
          onAddCalendar={onAddLocalCalendar}
        />
      ) : null;
    }

    if (section === 'accounts') {
      return showAccountsSection ? (
        <SidebarAccountsList
          key={section}
          accounts={caldavAccounts}
          tasks={tasks}
          expandedAccounts={expandedAccounts}
          activeCalendarId={activeCalendarId}
          contextMenu={contextMenu}
          isAnyModalOpen={isAnyModalOpen}
          activeAccountMenuTriggerId={activeAccountMenuTriggerId}
          showTaskCounts={showSidebarTaskCounts}
          accountsSectionCollapsed={accountsSectionCollapsed}
          onToggleAccountsSection={onToggleAccountsSection}
          onContextMenu={onContextMenu}
          onToggleAccount={onToggleAccount}
          onSelectCalendar={onSelectCalendar}
          onCreateCalendar={onCreateCalendar}
          onAddAccount={onAddAccount}
        />
      ) : null;
    }

    return showTagsSection ? (
      <SidebarTagsList
        key={section}
        tags={tags}
        tasks={tasks}
        activeTagId={activeTagId}
        contextMenu={contextMenu}
        isAnyModalOpen={isAnyModalOpen}
        showTaskCounts={showSidebarTaskCounts}
        tagsSectionCollapsed={tagsSectionCollapsed}
        onToggleTagsSection={onToggleTagsSection}
        onSelectTag={onSelectTag}
        onContextMenu={onContextMenu}
        onAddTag={onAddTag}
      />
    ) : null;
  };

  return <>{sidebarSectionOrder.map(renderSection)}</>;
};
