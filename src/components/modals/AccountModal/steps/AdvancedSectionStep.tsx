import ChevronDown from 'lucide-react/icons/chevron-down';
import Info from 'lucide-react/icons/info';
import { useState } from 'react';
import { ComposedInput } from '$components/ComposedInput';
import { Tooltip } from '$components/Tooltip';
import { getPredefinedServerUrl } from '$constants/settings';
import type { ServerType } from '$types/account';

interface AdvancedSectionStepProps {
  serverType: ServerType;
  principalUrl: string;
  onPrincipalUrlChange: (v: string) => void;
  calendarHomeUrl: string;
  onCalendarHomeUrlChange: (v: string) => void;
  initialOpen?: boolean;
}

export const AdvancedSectionStep = ({
  serverType,
  principalUrl,
  onPrincipalUrlChange,
  calendarHomeUrl,
  onCalendarHomeUrlChange,
  initialOpen = false,
}: AdvancedSectionStepProps) => {
  const [open, setOpen] = useState(initialOpen);

  if (getPredefinedServerUrl(serverType)) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded text-surface-500 text-xs outline-none transition-colors hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-ink dark:text-surface-400 dark:hover:text-surface-200"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 motion-safe:transition-transform ${open ? '' : '-rotate-90'}`}
        />
        Advanced
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <label
              htmlFor="principal-url"
              className="mb-1 flex items-center gap-1.5 font-medium text-sm text-surface-700 dark:text-surface-300"
            >
              <span>Principal URL</span>
              <Tooltip
                content="Overrides the auto-discovered principal URL. May be absolute or server-relative."
                position="top"
                allowInModal
              >
                <button
                  type="button"
                  aria-label="Principal URL help"
                  className="inline-flex rounded-sm text-surface-400 outline-none transition-colors hover:text-surface-600 focus-visible:ring-2 focus-visible:ring-primary-ink dark:hover:text-surface-300"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </label>
            <ComposedInput
              id="principal-url"
              type="text"
              value={principalUrl}
              onChange={onPrincipalUrlChange}
              placeholder="/principals/user/ or https://caldav.example.com/principals/user/"
              className="w-full rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-800 transition-colors focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
            />
          </div>
          <div>
            <label
              htmlFor="calendar-home-url"
              className="mb-1 flex items-center gap-1.5 font-medium text-sm text-surface-700 dark:text-surface-300"
            >
              <span>Calendar Home URL</span>
              <Tooltip
                content="Uses calendar home URLs directly, bypassing auto-discovery."
                position="top"
                allowInModal
              >
                <button
                  type="button"
                  aria-label="Calendar Home URL help"
                  className="inline-flex rounded-sm text-surface-400 outline-none transition-colors hover:text-surface-600 focus-visible:ring-2 focus-visible:ring-primary-ink dark:hover:text-surface-300"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </label>
            <ComposedInput
              id="calendar-home-url"
              type="url"
              value={calendarHomeUrl}
              onChange={onCalendarHomeUrlChange}
              placeholder="https://caldav.example.com/calendars/user/"
              className="w-full rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-800 transition-colors focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};
