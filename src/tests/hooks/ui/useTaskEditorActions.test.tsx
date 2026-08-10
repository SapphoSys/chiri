import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTaskEditorActions } from '$hooks/ui/useTaskEditorActions';
import type { Account } from '$types/account';
import { makeCalendar, makeTask } from '../../fixtures';

const mocks = vi.hoisted(() => ({
  updateTask: vi.fn(),
  setEditorOpen: vi.fn(),
  removeTag: vi.fn(),
  addReminder: vi.fn(),
  removeReminder: vi.fn(),
  updateReminder: vi.fn(),
  restoreTask: vi.fn(),
  moveToDeleted: vi.fn(async () => true),
  permanentlyDelete: vi.fn(async () => true),
  resetCursor: vi.fn(),
}));

vi.mock('$hooks/queries/useTasks', () => ({
  useUpdateTask: () => ({ mutate: mocks.updateTask }),
  useAddReminder: () => ({ mutate: mocks.addReminder }),
  useRemoveReminder: () => ({ mutate: mocks.removeReminder }),
  useRemoveTagFromTask: () => ({ mutate: mocks.removeTag }),
  useRestoreTask: () => ({ mutate: mocks.restoreTask }),
  useUpdateReminder: () => ({ mutate: mocks.updateReminder }),
}));

vi.mock('$hooks/queries/useUIState', () => ({
  useSetEditorOpen: () => ({ mutate: mocks.setEditorOpen }),
}));

vi.mock('$hooks/deletion/useTaskDeletion', () => ({
  useTaskDeletion: () => ({
    moveTaskToRecentlyDeleted: mocks.moveToDeleted,
    deleteTaskPermanently: mocks.permanentlyDelete,
  }),
}));

vi.mock('$hooks/ui/useStaleCursorReset', () => ({
  resetStaleCursorOnLayerClose: mocks.resetCursor,
}));

const sourceCalendar = makeCalendar({ id: 'source-calendar', accountId: 'source-account' });
const targetCalendar = makeCalendar({ id: 'target-calendar', accountId: 'target-account' });
const accounts: Account[] = [
  {
    id: 'target-account',
    name: 'Target',
    calendars: [targetCalendar],
    isActive: true,
    sortOrder: 0,
    caldav: null,
  },
];

const task = makeTask({
  id: 'task-1',
  calendarId: sourceCalendar.id,
  accountId: sourceCalendar.accountId,
  parentUid: 'parent-task',
});

interface ProbeProps {
  task: typeof task;
  accounts: Account[];
}

const Probe = ({ task: currentTask, accounts: currentAccounts }: ProbeProps) => {
  const actions = useTaskEditorActions({
    task: currentTask,
    accounts: currentAccounts,
    syncStatusProgress: true,
  });
  const date = new Date(2025, 0, 15, 10);

  return (
    <div>
      <button
        type="button"
        data-action="status"
        onClick={() => actions.handleStatusChange('completed')}
      />
      <button
        type="button"
        data-action="progress"
        onClick={() => actions.commitPercentComplete(50)}
      />
      <button
        type="button"
        data-action="calendar"
        onClick={() => actions.handleCalendarChange(targetCalendar.id)}
      />
      <button
        type="button"
        data-action="start"
        onClick={() => actions.handleStartDateChange(date, true)}
      />
      <button
        type="button"
        data-action="due"
        onClick={() => actions.handleDueDateChange(date, false)}
      />
      <button
        type="button"
        data-action="repeat"
        onClick={() => actions.handleRepeatChange('FREQ=DAILY', 0)}
      />
      <button type="button" data-action="tag" onClick={() => actions.handleRemoveTag('tag-1')} />
      <button
        type="button"
        data-action="add-reminder"
        onClick={() => actions.handleAddReminder(date)}
      />
      <button
        type="button"
        data-action="update-reminder"
        onClick={() => actions.handleUpdateReminder('reminder-1', date)}
      />
      <button
        type="button"
        data-action="remove-reminder"
        onClick={() => actions.handleRemoveReminder('reminder-1')}
      />
      <button
        type="button"
        data-action="clear-reminder"
        onClick={() => actions.handleClearReminder('reminder-1')}
      />
      <button type="button" data-action="delete" onClick={() => void actions.handleDelete()} />
      <button type="button" data-action="restore" onClick={actions.handleRestore} />
      <button
        type="button"
        data-action="permanent-delete"
        onClick={() => void actions.handlePermanentDelete()}
      />
      <button type="button" data-action="close" onClick={actions.handleClose} />
    </div>
  );
};

describe('useTaskEditorActions', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    for (const mock of Object.values(mocks)) mock.mockClear();
    mocks.moveToDeleted.mockResolvedValue(true);
    mocks.permanentlyDelete.mockResolvedValue(true);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const click = async (action: string) => {
    await act(async () => {
      container.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)?.click();
    });
  };

  it('translates editor field actions into task and reminder mutations', async () => {
    act(() => root.render(createElement(Probe, { task, accounts })));

    await click('status');
    await click('progress');
    await click('calendar');
    await click('start');
    await click('due');
    await click('repeat');
    await click('tag');
    await click('add-reminder');
    await click('update-reminder');
    await click('remove-reminder');
    await click('clear-reminder');

    expect(mocks.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: task.id,
        updates: expect.objectContaining({
          calendarId: targetCalendar.id,
          accountId: targetCalendar.accountId,
          parentUid: undefined,
        }),
      }),
    );
    expect(mocks.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: task.id,
        updates: { startDateAllDay: true, startDate: expect.any(Date) },
      }),
    );
    expect(mocks.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: task.id,
        updates: { dueDateAllDay: false, dueDate: expect.any(Date) },
      }),
    );
    expect(mocks.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({ id: task.id, updates: { rrule: 'FREQ=DAILY', repeatFrom: 0 } }),
    );
    expect(mocks.removeTag).toHaveBeenCalledWith({ taskId: task.id, tagId: 'tag-1' });
    expect(mocks.addReminder).toHaveBeenCalledWith({ taskId: task.id, trigger: expect.any(Date) });
    expect(mocks.updateReminder).toHaveBeenCalledWith({
      taskId: task.id,
      reminderId: 'reminder-1',
      trigger: expect.any(Date),
    });
    expect(mocks.removeReminder).toHaveBeenCalledTimes(2);
  });

  it('closes the editor only after successful deletion and resets the cursor on close', async () => {
    act(() => root.render(createElement(Probe, { task, accounts })));

    await click('delete');
    expect(mocks.moveToDeleted).toHaveBeenCalledWith(task.id);
    expect(mocks.setEditorOpen).toHaveBeenCalledWith(false);

    await click('restore');
    expect(mocks.restoreTask).toHaveBeenCalledWith({ id: task.id });

    await click('permanent-delete');
    expect(mocks.permanentlyDelete).toHaveBeenCalledWith(task.id);
    await click('close');
    expect(mocks.resetCursor).toHaveBeenCalledOnce();
  });
});
