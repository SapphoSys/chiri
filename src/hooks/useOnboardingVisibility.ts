import { useEffect, useState } from 'react';
import type { Account } from '$types/account';
import type { Task } from '$types/task/model';
import { shouldShowOnboarding } from '$utils/onboarding';

interface UseOnboardingVisibilityOptions {
  onboardingCompleted: boolean;
  accountsPending: boolean;
  tasksPending: boolean;
  accounts: Account[];
  tasks: Task[];
}

export const useOnboardingVisibility = ({
  onboardingCompleted,
  accountsPending,
  tasksPending,
  accounts,
  tasks,
}: UseOnboardingVisibilityOptions) => {
  const [onboardingSessionActive, setOnboardingSessionActive] = useState(false);

  const showOnboarding = shouldShowOnboarding({
    onboardingCompleted,
    onboardingSessionActive,
    accountsPending,
    tasksPending,
    accounts,
    tasks,
  });

  useEffect(() => {
    if (onboardingCompleted) {
      setOnboardingSessionActive(false);
      return;
    }

    if (showOnboarding && !onboardingSessionActive) {
      setOnboardingSessionActive(true);
    }
  }, [onboardingCompleted, onboardingSessionActive, showOnboarding]);

  return showOnboarding;
};
