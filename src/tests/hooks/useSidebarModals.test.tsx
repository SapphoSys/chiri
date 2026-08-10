import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSidebarContextMenu } from '$hooks/ui/useSidebarContextMenu';
import { useSidebarModals } from '$hooks/useSidebarModals';

const SidebarModalsProbe = () => {
  const modals = useSidebarModals();

  return (
    <>
      <button
        type="button"
        data-action="edit-account"
        onClick={() => modals.openAccount('account-1')}
      />
      <button type="button" data-action="new-account" onClick={() => modals.openAccount()} />
      <button type="button" data-action="close-account" onClick={modals.closeAccount} />
      <button
        type="button"
        data-action="edit-calendar"
        onClick={() => modals.openCalendar({ accountId: 'account-1', calendarId: 'calendar-1' })}
      />
      <button
        type="button"
        data-action="export-calendar"
        onClick={() => modals.openExportCalendar('calendar-1')}
      />
      <button
        type="button"
        data-action="export-account"
        onClick={() => modals.openExportAccount('account-1')}
      />
      <button type="button" data-action="close-export" onClick={modals.closeExport} />
      <output data-state={JSON.stringify(modals)} />
    </>
  );
};

const SidebarContextMenuProbe = () => {
  const { contextMenu, handleContextMenu, handleCloseContextMenu } = useSidebarContextMenu();

  return (
    <>
      <button
        type="button"
        data-action="open-context-menu"
        onContextMenu={(event) => handleContextMenu(event, 'account', 'account-1')}
      />
      <button type="button" data-action="close-context-menu" onClick={handleCloseContextMenu} />
      <output data-state={JSON.stringify(contextMenu)} />
    </>
  );
};

const clickAction = (container: HTMLElement, action: string) => {
  const button = container.querySelector(`[data-action="${action}"]`);
  if (!(button instanceof HTMLButtonElement)) throw new Error(`Missing action: ${action}`);
  act(() => button.click());
};

const getState = (container: HTMLElement) => {
  const output = container.querySelector('[data-state]');
  if (!(output instanceof HTMLOutputElement)) throw new Error('Missing state output');
  return JSON.parse(output.dataset.state ?? 'null');
};

describe('useSidebarModals', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(createElement(SidebarModalsProbe)));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('stores editing IDs and clears them when their modal closes', () => {
    clickAction(container, 'edit-account');
    expect(getState(container)).toMatchObject({
      showAccountModal: true,
      editingAccountId: 'account-1',
    });

    clickAction(container, 'close-account');
    expect(getState(container)).toMatchObject({
      showAccountModal: false,
      editingAccountId: null,
    });
  });

  it('replaces the export target instead of keeping account and calendar IDs together', () => {
    clickAction(container, 'export-calendar');
    expect(getState(container).exportTarget).toEqual({
      type: 'calendar',
      calendarId: 'calendar-1',
    });

    clickAction(container, 'export-account');
    expect(getState(container).exportTarget).toEqual({
      type: 'account',
      accountId: 'account-1',
    });

    clickAction(container, 'close-export');
    expect(getState(container).exportTarget).toBeNull();
  });
});

describe('useSidebarContextMenu', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(createElement(SidebarContextMenuProbe)));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('opens a typed menu and toggles it closed when the same target is invoked again', () => {
    const button = container.querySelector('[data-action="open-context-menu"]');
    if (!(button instanceof HTMLButtonElement)) throw new Error('Missing context-menu action');

    act(() => {
      button.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, clientX: 120, clientY: 240 }),
      );
    });
    expect(getState(container)).toEqual({
      type: 'account',
      id: 'account-1',
      x: 120,
      y: 240,
    });

    act(() => {
      button.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, clientX: 120, clientY: 240 }),
      );
    });
    expect(getState(container)).toBeNull();
  });

  it('closes the menu through the explicit close action', () => {
    const button = container.querySelector('[data-action="open-context-menu"]');
    if (!(button instanceof HTMLButtonElement)) throw new Error('Missing context-menu action');

    act(() => {
      button.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    });
    clickAction(container, 'close-context-menu');
    expect(getState(container)).toBeNull();
  });
});
