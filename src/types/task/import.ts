import type { Task } from '$types/task/model';

export interface ParsedTaskWithStatus extends Partial<Task> {
  importStatus?: 'pending' | 'importing' | 'success' | 'error';
  importError?: string;
}
