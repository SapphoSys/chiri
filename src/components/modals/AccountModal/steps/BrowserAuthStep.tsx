import Globe from 'lucide-react/icons/globe';
import Loader2 from 'lucide-react/icons/loader-2';

interface BrowserAuthStepProps {
  providerName: string;
  phase: 'idle' | 'validating' | 'browser' | 'connecting' | 'done';
}

export const BrowserAuthStep = ({ providerName, phase }: BrowserAuthStepProps) => {
  if (phase === 'validating') {
    return (
      <div className="py-8 text-center">
        <Loader2 className="mx-auto mb-3 h-10 w-10 text-primary-500 motion-safe:animate-spin" />
        <h3 className="mb-1 font-medium text-base text-surface-800 dark:text-surface-200">
          Validating server...
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Checking that {providerName} is reachable
        </p>
      </div>
    );
  }

  if (phase === 'browser') {
    return (
      <div className="py-8 text-center">
        <Loader2 className="mx-auto mb-3 h-10 w-10 text-primary-500 motion-safe:animate-spin" />
        <h3 className="mb-1 font-medium text-base text-surface-800 dark:text-surface-200">
          Waiting for authorization...
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Complete the login in your browser, then return here.
        </p>
      </div>
    );
  }

  if (phase === 'connecting') {
    return (
      <div className="py-8 text-center">
        <Loader2 className="mx-auto mb-3 h-10 w-10 text-primary-500 motion-safe:animate-spin" />
        <h3 className="mb-1 font-medium text-base text-surface-800 dark:text-surface-200">
          Setting up your account...
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400">Importing calendars</p>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="py-8 text-center">
        <Loader2 className="mx-auto mb-3 h-10 w-10 text-primary-500 motion-safe:animate-spin" />
        <h3 className="mb-1 font-medium text-base text-surface-800 dark:text-surface-200">
          Finishing up...
        </h3>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-50 p-5 text-center dark:border-surface-600 dark:bg-surface-700/50">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-600">
        <Globe className="size-6 text-surface-600 dark:text-surface-300" />
      </div>
      <h3 className="mb-1 font-medium text-sm text-surface-800 dark:text-surface-200">
        Browser authentication with {providerName}
      </h3>
      <p className="text-sm text-surface-600 dark:text-surface-400">
        Chiri will open your browser for authentication.
      </p>
      <p className="mt-1 text-surface-500 text-xs dark:text-surface-400">
        Once you approve access, you&apos;ll be returned here automatically.
      </p>
    </div>
  );
};
