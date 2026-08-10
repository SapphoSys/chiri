import { FILTER_PRESET_DEFINITIONS } from '$constants/filters';
import type { Filter } from '$types/filter';
import type { TaskCreationDefaults, TaskCreationOptions } from '$types/task/creation';

export const getFilterTaskCreationDefaults = (filter: Filter | undefined): TaskCreationDefaults => {
  if (!filter?.presetId) return {};

  const preset = FILTER_PRESET_DEFINITIONS.find(({ presetId }) => presetId === filter.presetId);
  return preset?.taskDefaults ? { ...preset.taskDefaults } : {};
};

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
