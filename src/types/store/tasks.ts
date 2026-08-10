import type { Task } from '$types/task/model';

export interface FlattenedTask extends Task {
  ancestorIds: string[];
  depth: number;
}
