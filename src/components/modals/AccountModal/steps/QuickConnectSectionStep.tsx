import Cloud from 'lucide-react/icons/cloud';
import type { ServerType } from '$types/account';

interface QuickConnectConfig {
  label: string;
  description: string;
  buttonClassName: string;
}

const QUICK_CONNECT_CONFIG: Partial<Record<ServerType, QuickConnectConfig>> = {
  nextcloud: {
    label: 'Use Nextcloud Login Flow',
    description: 'Automatically authenticate via browser',
    buttonClassName:
      'bg-semantic-info/10 hover:bg-semantic-info/20 border border-semantic-info/30 text-surface-800 dark:text-surface-200 [&_svg]:text-semantic-info',
  },
  rustical: {
    label: 'Use RustiCal Login Flow',
    description: 'Automatically authenticate via browser',
    buttonClassName:
      'bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-surface-800 dark:text-surface-200 [&_svg]:text-primary-500',
  },
};

interface QuickConnectSectionStepProps {
  serverType: ServerType;
  onClick: () => void;
}

export const QuickConnectSectionStep = ({ serverType, onClick }: QuickConnectSectionStepProps) => {
  const config = QUICK_CONNECT_CONFIG[serverType];
  if (!config) return null;

  return (
    <div className="border-surface-200 pt-3 dark:border-surface-700">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex-1 border-surface-200 border-t dark:border-surface-700" />
        <span className="text-surface-400 text-xs dark:text-surface-500">Quick connect</span>
        <div className="flex-1 border-surface-200 border-t dark:border-surface-700" />
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${config.buttonClassName}`}
      >
        <Cloud className="h-4 w-4" />
        {config.label}
      </button>
      <p className="mt-2 text-center text-surface-500 text-xs dark:text-surface-400">
        {config.description}
      </p>
    </div>
  );
};
