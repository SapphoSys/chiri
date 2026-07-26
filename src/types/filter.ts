import type { Priority, Status } from '$types/task/model';

type FilterCombinator = 'all' | 'any';

type DateFilterOp = 'exists' | 'empty' | 'today' | 'tomorrow' | 'beforeToday' | 'withinDays';

export type DateFilterField = 'dueDate' | 'startDate' | 'createdAt' | 'modifiedAt' | 'completedAt';

export type FilterCriterion =
  | {
      field: DateFilterField;
      op: DateFilterOp;
      value?: number;
    }
  | {
      field: 'status';
      op: 'is' | 'isNot' | 'in' | 'notIn';
      value: Status | Status[];
    }
  | {
      field: 'priority';
      op: 'is' | 'isNot' | 'in' | 'notIn';
      value: Priority | Priority[];
    }
  | {
      field: 'tags';
      op: 'has' | 'hasAny' | 'hasAll' | 'empty';
      value?: string[];
    }
  | {
      field: 'calendar';
      op: 'is' | 'isAnyOf';
      value: string[];
    }
  | {
      field: 'text';
      op: 'contains';
      value: string;
    };

export interface Filter {
  id: string;
  presetId?: string;
  name: string;
  icon?: string;
  emoji?: string;
  color?: string;
  combinator: FilterCombinator;
  criteria: FilterCriterion[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type FilterPresetDefinition = Pick<
  Filter,
  'name' | 'icon' | 'combinator' | 'criteria' | 'sortOrder'
> & {
  presetId: string;
};
