import Cloud from 'lucide-react/icons/cloud';
import HardDrive from 'lucide-react/icons/hard-drive';
import Sparkles from 'lucide-react/icons/sparkles';

export const WelcomeStep = () => (
  <div className="flex flex-1 flex-col justify-end gap-6">
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-surface-200 p-3 dark:border-surface-700">
        <HardDrive className="mb-3 h-5 w-5 text-primary-500" />
        <div className="font-medium text-sm text-surface-900 dark:text-surface-100">
          Local first
        </div>
      </div>
      <div className="rounded-lg border border-surface-200 p-3 dark:border-surface-700">
        <Cloud className="mb-3 h-5 w-5 text-primary-500" />
        <div className="font-medium text-sm text-surface-900 dark:text-surface-100">Sync ready</div>
      </div>
      <div className="rounded-lg border border-surface-200 p-3 dark:border-surface-700">
        <Sparkles className="mb-3 h-5 w-5 text-primary-500" />
        <div className="font-medium text-sm text-surface-900 dark:text-surface-100">No fuss</div>
      </div>
    </div>
  </div>
);
