import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';
import type { DateFilterField, Filter, FilterCriterion } from '$types/filter';
import type { Task } from '$types/task/model';

export const isCompletedTask = (task: Task) =>
  task.status === 'completed' || task.status === 'cancelled';

const getDateValue = (task: Task, field: DateFilterField) => {
  switch (field) {
    case 'dueDate':
      return task.dueDate;
    case 'startDate':
      return task.startDate;
    case 'createdAt':
      return task.createdAt;
    case 'modifiedAt':
      return task.modifiedAt;
    case 'completedAt':
      return task.completedAt;
  }
};

const isSameDay = (date: Date, day: Date) => {
  const start = startOfDay(day);
  const end = endOfDay(day);
  return date >= start && date <= end;
};

const matchesDateCriterion = (
  task: Task,
  criterion: Extract<FilterCriterion, { field: DateFilterField }>,
) => {
  const date = getDateValue(task, criterion.field);
  const today = new Date();

  switch (criterion.op) {
    case 'exists':
      return date !== undefined;
    case 'empty':
      return date === undefined;
    case 'today':
      return date ? isSameDay(date, today) : false;
    case 'tomorrow':
      return date ? isSameDay(date, addDays(today, 1)) : false;
    case 'beforeToday':
      return date ? date < startOfDay(today) : false;
    case 'withinDays': {
      if (!date) return false;
      const days = criterion.value ?? 0;
      if (criterion.field === 'createdAt' || criterion.field === 'modifiedAt') {
        return date >= subDays(today, days) && date <= today;
      }
      return date >= startOfDay(today) && date <= endOfDay(addDays(today, days));
    }
  }
};

const valueListIncludes = <T extends string>(value: T | T[], candidate: T) => {
  return Array.isArray(value) ? value.includes(candidate) : value === candidate;
};

const matchesCriterion = (task: Task, criterion: FilterCriterion) => {
  switch (criterion.field) {
    case 'dueDate':
    case 'startDate':
    case 'createdAt':
    case 'modifiedAt':
    case 'completedAt':
      return matchesDateCriterion(task, criterion);

    case 'status':
      switch (criterion.op) {
        case 'is':
        case 'in':
          return valueListIncludes(criterion.value, task.status);
        case 'isNot':
        case 'notIn':
          return !valueListIncludes(criterion.value, task.status);
      }
      return false;

    case 'priority':
      switch (criterion.op) {
        case 'is':
        case 'in':
          return valueListIncludes(criterion.value, task.priority);
        case 'isNot':
        case 'notIn':
          return !valueListIncludes(criterion.value, task.priority);
      }
      return false;

    case 'tags': {
      const taskTags = task.tags ?? [];
      const filterTags = criterion.value ?? [];
      switch (criterion.op) {
        case 'empty':
          return taskTags.length === 0;
        case 'has':
          return filterTags.length > 0 && taskTags.includes(filterTags[0]);
        case 'hasAny':
          return filterTags.some((tagId) => taskTags.includes(tagId));
        case 'hasAll':
          return filterTags.every((tagId) => taskTags.includes(tagId));
      }
      return false;
    }

    case 'calendar':
      switch (criterion.op) {
        case 'is':
          return criterion.value[0] === task.calendarId;
        case 'isAnyOf':
          return criterion.value.includes(task.calendarId);
      }
      return false;

    case 'text': {
      const query = criterion.value.trim().toLowerCase();
      if (!query) return true;
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.url?.toLowerCase().includes(query) === true
      );
    }
  }
};

export const matchesFilter = (task: Task, filter: Filter) => {
  if (filter.criteria.length === 0) return true;
  if (filter.combinator === 'any') {
    return filter.criteria.some((criterion) => matchesCriterion(task, criterion));
  }
  return filter.criteria.every((criterion) => matchesCriterion(task, criterion));
};
