import type { DefaultDateOffset } from '$types/settings/categories/defaults';
import type { Priority, Status } from '$types/task/model';

export interface TaskCreationDefaults {
  status?: Status;
  priority?: Priority;
  startDate?: DefaultDateOffset;
  dueDate?: DefaultDateOffset;
}

export type TaskCreationSource = 'user' | 'remote' | 'import';

export interface TaskCreationOptions {
  source?: TaskCreationSource;
  /** Select and open the task before publishing it to task-list subscribers. */
  selectCreatedTask?: boolean;
}
