export type TaskCreationSource = 'user' | 'remote' | 'import';

export interface TaskCreationOptions {
  source?: TaskCreationSource;
}
