import type { Filter, FilterPresetDefinition } from '$types/filter';

export const DEFAULT_FILTER_PRESET_DEFINITIONS: FilterPresetDefinition[] = [
  {
    presetId: 'today',
    category: 'date',
    name: 'Today',
    icon: 'calendar-check',
    combinator: 'all',
    sortOrder: 100,
    criteria: [
      { field: 'dueDate', op: 'today' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
    taskDefaults: { dueDate: 'today' },
  },
  {
    presetId: 'overdue',
    category: 'date',
    name: 'Overdue',
    icon: 'clock',
    combinator: 'all',
    sortOrder: 200,
    criteria: [
      { field: 'dueDate', op: 'beforeToday' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    presetId: 'scheduled',
    category: 'date',
    name: 'Scheduled',
    icon: 'calendar-clock',
    combinator: 'all',
    sortOrder: 300,
    criteria: [
      { field: 'dueDate', op: 'exists' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    presetId: 'this-week',
    category: 'date',
    name: 'This Week',
    icon: 'calendar-days',
    combinator: 'all',
    sortOrder: 400,
    criteria: [
      { field: 'dueDate', op: 'withinDays', value: 7 },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
];

export const FILTER_PRESET_DEFINITIONS: FilterPresetDefinition[] = [
  ...DEFAULT_FILTER_PRESET_DEFINITIONS,
  {
    presetId: 'recently-modified',
    category: 'date',
    name: 'Recently Modified',
    icon: 'sparkles',
    combinator: 'all',
    sortOrder: 500,
    criteria: [{ field: 'modifiedAt', op: 'withinDays', value: 7 }],
  },
  {
    presetId: 'tomorrow',
    category: 'date',
    name: 'Tomorrow',
    icon: 'calendar',
    combinator: 'all',
    sortOrder: 600,
    criteria: [
      { field: 'dueDate', op: 'tomorrow' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
    taskDefaults: { dueDate: 'tomorrow' },
  },
  {
    presetId: 'no-due-date',
    category: 'date',
    name: 'No Due Date',
    icon: 'calendar-off',
    combinator: 'all',
    sortOrder: 700,
    criteria: [
      { field: 'dueDate', op: 'empty' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
    taskDefaults: { dueDate: 'none' },
  },
  {
    presetId: 'high-priority',
    category: 'priority',
    name: 'High Priority',
    icon: 'flag',
    combinator: 'all',
    sortOrder: 800,
    criteria: [
      { field: 'priority', op: 'is', value: 'high' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
    taskDefaults: { priority: 'high' },
  },
  {
    presetId: 'untagged',
    category: 'organization',
    name: 'Untagged',
    icon: 'tag',
    combinator: 'all',
    sortOrder: 900,
    criteria: [
      { field: 'tags', op: 'empty' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    presetId: 'recently-completed',
    category: 'date',
    name: 'Recently Completed',
    icon: 'check-square',
    combinator: 'all',
    sortOrder: 1000,
    criteria: [
      { field: 'completedAt', op: 'withinDays', value: 7 },
      { field: 'status', op: 'is', value: 'completed' },
    ],
  },
];

export const DEFAULT_FILTER_DEFINITIONS: Array<FilterPresetDefinition & Pick<Filter, 'id'>> =
  DEFAULT_FILTER_PRESET_DEFINITIONS.map((filter, index) => ({
    ...filter,
    id: `default-filter-${filter.presetId}`,
    sortOrder: (index + 1) * 100,
  }));

export const getFilterPresetId = (filter: Pick<Filter, 'presetId'>) => filter.presetId;
