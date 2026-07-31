export interface EditorFieldVisibility {
  status: boolean;
  progress: boolean;
  description: boolean;
  url: boolean;
  dates: boolean;
  repeat: boolean;
  priority: boolean;
  calendar: boolean;
  tags: boolean;
  reminders: boolean;
  subtasks: boolean;
}

export type EditorFieldKey = keyof EditorFieldVisibility;

export interface TaskBadgeVisibility {
  startDate: boolean;
  dueDate: boolean;
  tags: boolean;
  calendar: boolean;
  url: boolean;
  status: boolean;
  snooze: boolean;
  repeat: boolean;
  subtasks: boolean;
}

export type TaskBadgeKey = keyof TaskBadgeVisibility;
