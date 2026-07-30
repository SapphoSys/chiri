import { useCallback, useState } from 'react';
import type { EditingCalendar, SidebarExportTarget, SidebarModals } from '$types/modals';

export const useSidebarModals = (): SidebarModals => {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [showCreateCalendar, setShowCreateCalendar] = useState(false);
  const [createCalendarAccountId, setCreateCalendarAccountId] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<EditingCalendar | null>(null);
  const [showFilterPresetModal, setShowFilterPresetModal] = useState(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [exportTarget, setExportTarget] = useState<SidebarExportTarget | null>(null);
  const [mobileConfigAccountId, setMobileConfigAccountId] = useState<string | null>(null);

  const openAccount = useCallback((accountId: string | null = null) => {
    setEditingAccountId(accountId);
    setShowAccountModal(true);
  }, []);

  const closeAccount = useCallback(() => {
    setShowAccountModal(false);
    setEditingAccountId(null);
  }, []);

  const openTag = useCallback((tagId: string | null = null) => {
    setEditingTagId(tagId);
    setShowTagModal(true);
  }, []);

  const closeTag = useCallback(() => {
    setShowTagModal(false);
    setEditingTagId(null);
  }, []);

  const openCreateCalendar = useCallback((accountId: string) => {
    setCreateCalendarAccountId(accountId);
    setShowCreateCalendar(true);
  }, []);

  const closeCreateCalendar = useCallback(() => {
    setShowCreateCalendar(false);
    setCreateCalendarAccountId(null);
  }, []);

  const openCalendar = useCallback((calendar: EditingCalendar) => {
    setEditingCalendar(calendar);
    setShowCalendarModal(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setShowCalendarModal(false);
    setEditingCalendar(null);
  }, []);

  const openFilterPreset = useCallback(() => {
    setShowFilterPresetModal(true);
  }, []);

  const closeFilterPreset = useCallback(() => {
    setShowFilterPresetModal(false);
  }, []);

  const openFilter = useCallback((filterId: string) => {
    setEditingFilterId(filterId);
  }, []);

  const closeFilter = useCallback(() => {
    setEditingFilterId(null);
  }, []);

  const openExportCalendar = useCallback((calendarId: string) => {
    setExportTarget({ type: 'calendar', calendarId });
  }, []);

  const openExportAccount = useCallback((accountId: string) => {
    setExportTarget({ type: 'account', accountId });
  }, []);

  const closeExport = useCallback(() => {
    setExportTarget(null);
  }, []);

  const openMobileConfigExport = useCallback((accountId: string) => {
    setMobileConfigAccountId(accountId);
  }, []);

  const closeMobileConfigExport = useCallback(() => {
    setMobileConfigAccountId(null);
  }, []);

  return {
    showAccountModal,
    editingAccountId,
    showTagModal,
    editingTagId,
    showCreateCalendar,
    createCalendarAccountId,
    showCalendarModal,
    editingCalendar,
    showFilterPresetModal,
    editingFilterId,
    exportTarget,
    mobileConfigAccountId,
    openAccount,
    closeAccount,
    openTag,
    closeTag,
    openCreateCalendar,
    closeCreateCalendar,
    openCalendar,
    closeCalendar,
    openFilterPreset,
    closeFilterPreset,
    openFilter,
    closeFilter,
    openExportCalendar,
    openExportAccount,
    closeExport,
    openMobileConfigExport,
    closeMobileConfigExport,
  };
};
