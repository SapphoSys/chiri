import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { CLOSE_CONTEXT_MENUS_EVENT, useContextMenuDismissal } from '$hooks/ui/useContextMenu';
import {
  refreshStaleCursorAfterLayoutAtEventPoint,
  resetStaleCursorAfterLayout,
  resetStaleCursorOnLayerClose,
} from '$hooks/ui/useStaleCursorReset';

const CONTEXT_MENU_DISMISS_CURSOR_RESET_DELAY_FRAMES = 2;

type ContextMenuType = 'account' | 'calendar' | 'tag' | 'filter' | 'accounts-section';

type ContextMenuState = {
  type: ContextMenuType;
  id: string;
  accountId?: string;
  source?: 'account-menu-trigger';
  x: number;
  y: number;
};

const isPointInsideRect = (
  { clientX, clientY }: { clientX: number; clientY: number },
  rect: DOMRect,
) => clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

const findAccountMenuTrigger = (accountId: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-account-menu-trigger]')).find(
    (element) => element.dataset.accountMenuTrigger === accountId,
  );

export const useSidebarContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [activeAccountMenuTriggerId, setActiveAccountMenuTriggerId] = useState<string | null>(null);
  const lastMenuCloseTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!activeAccountMenuTriggerId) return;

    const clearIfPointerLeftTrigger = (event: PointerEvent) => {
      const accountMenuTrigger = findAccountMenuTrigger(activeAccountMenuTriggerId);
      if (
        !accountMenuTrigger ||
        !isPointInsideRect(event, accountMenuTrigger.getBoundingClientRect())
      ) {
        setActiveAccountMenuTriggerId(null);
      }
    };

    document.addEventListener('pointermove', clearIfPointerLeftTrigger, true);
    document.addEventListener('pointerdown', clearIfPointerLeftTrigger, true);

    return () => {
      document.removeEventListener('pointermove', clearIfPointerLeftTrigger, true);
      document.removeEventListener('pointerdown', clearIfPointerLeftTrigger, true);
    };
  }, [activeAccountMenuTriggerId]);

  const resetStaleCursorAfterContextMenuDismiss = useCallback(
    (event: MouseEvent) => {
      const isAccountMenu = contextMenu?.type === 'account';
      const accountMenuId = isAccountMenu ? contextMenu.id : undefined;
      const accountMenuTrigger = accountMenuId ? findAccountMenuTrigger(accountMenuId) : undefined;

      if (
        accountMenuId &&
        contextMenu?.source === 'account-menu-trigger' &&
        accountMenuTrigger &&
        isPointInsideRect(event, accountMenuTrigger.getBoundingClientRect())
      ) {
        setActiveAccountMenuTriggerId(accountMenuId);
        resetStaleCursorOnLayerClose();
        return;
      }

      setActiveAccountMenuTriggerId(null);
      if (isAccountMenu) {
        resetStaleCursorAfterLayout({
          delayFrames: CONTEXT_MENU_DISMISS_CURSOR_RESET_DELAY_FRAMES,
        });
        return;
      }

      refreshStaleCursorAfterLayoutAtEventPoint(event, {
        delayFrames: CONTEXT_MENU_DISMISS_CURSOR_RESET_DELAY_FRAMES,
      });
    },
    [contextMenu],
  );

  const handleContextMenu = useCallback(
    (event: MouseEvent, type: ContextMenuType, id: string, accountId?: string) => {
      event.preventDefault();
      event.stopPropagation();

      if (contextMenu && contextMenu.type === type && contextMenu.id === id) {
        resetStaleCursorAfterContextMenuDismiss(event);
        setContextMenu(null);
        lastMenuCloseTimeRef.current = Date.now();
        return;
      }

      if (Date.now() - lastMenuCloseTimeRef.current < 100) return;

      const openedFromAccountMenuTrigger =
        type === 'account' &&
        event.target instanceof Element &&
        event.target.closest<HTMLElement>('[data-account-menu-trigger]')?.dataset
          .accountMenuTrigger === id;

      setActiveAccountMenuTriggerId(null);
      document.dispatchEvent(new CustomEvent(CLOSE_CONTEXT_MENUS_EVENT));
      setContextMenu({
        type,
        id,
        accountId,
        source: openedFromAccountMenuTrigger ? 'account-menu-trigger' : undefined,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [contextMenu, resetStaleCursorAfterContextMenuDismiss],
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
    lastMenuCloseTimeRef.current = Date.now();
  }, []);

  useContextMenuDismissal(handleCloseContextMenu, contextMenu !== null);

  return {
    contextMenu,
    activeAccountMenuTriggerId,
    handleContextMenu,
    handleCloseContextMenu,
    resetStaleCursorAfterContextMenuDismiss,
  };
};
