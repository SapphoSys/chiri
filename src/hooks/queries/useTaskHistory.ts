import { useQuery } from '@tanstack/react-query';
import { db } from '$lib/database';
import { queryKeys } from '$lib/queryClient';

export const useTaskHistory = (taskUid: string) => {
  return useQuery({
    queryKey: queryKeys.taskHistory.byTask(taskUid),
    queryFn: () => db.getTaskHistory(taskUid),
  });
};
