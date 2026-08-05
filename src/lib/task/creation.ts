import type { TaskCreationOptions } from '$types/task/creation';

export const resolveTaskTags = (
  providedTags: string[] | undefined,
  activeTagId: string | null,
  defaultTags: string[],
  options: TaskCreationOptions = {},
) => {
  if (options.source === 'remote' || options.source === 'import') {
    return providedTags ?? [];
  }

  let tags = providedTags ?? [];
  if (activeTagId && !tags.includes(activeTagId)) {
    tags = [activeTagId, ...tags];
  }
  if (tags.length === 0 && defaultTags.length > 0) {
    tags = [...defaultTags];
  }

  return tags;
};
