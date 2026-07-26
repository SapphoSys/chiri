export interface TaskHistoryEntry {
  id: string;
  taskUid: string;
  changedAt: Date;
  field: string;
  oldValue: string | null;
  newValue: string | null;
}
