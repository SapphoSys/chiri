export type TaskCreationSource = 'user' | 'remote' | 'import';

export interface TaskCreationOptions {
  source?: TaskCreationSource;
  /** Select and open the task before publishing it to task-list subscribers. */
  selectCreatedTask?: boolean;
}
