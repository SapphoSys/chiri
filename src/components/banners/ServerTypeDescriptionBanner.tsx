import Info from 'lucide-react/icons/info';
import { SERVER_TYPE_OPTIONS } from '$constants/settings';
import type { ServerType } from '$types';

interface ServerTypeDescriptionBannerProps {
  serverType: ServerType;
}

export const ServerTypeDescriptionBanner = ({ serverType }: ServerTypeDescriptionBannerProps) => {
  const option = SERVER_TYPE_OPTIONS.find((o) => o.value === serverType);
  if (!option?.description) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-semantic-info/30 bg-semantic-info/10 p-3 text-surface-700 text-xs dark:text-surface-300">
      <Info className="mt-px size-3.5 shrink-0 text-semantic-info" />
      <div className="min-w-0">
        <span className="block">{option.description}</span>
        {option.homepageUrl && (
          <span className="mt-1 block">
            <a
              href={option.homepageUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-2 hover:opacity-80"
            >
              Learn more about {option.label}
            </a>
            .
          </span>
        )}
      </div>
    </div>
  );
};
