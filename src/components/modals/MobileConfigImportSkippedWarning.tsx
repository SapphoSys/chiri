import TriangleAlert from 'lucide-react/icons/triangle-alert';
import type { MobileConfigSkippedCalDAVPayload } from '$types/mobileconfig/import';

interface MobileConfigImportSkippedWarningProps {
  skippedCandidates?: MobileConfigSkippedCalDAVPayload[];
}

export const MobileConfigImportSkippedWarning = ({
  skippedCandidates,
}: MobileConfigImportSkippedWarningProps) => {
  const skippedCount = skippedCandidates?.length ?? 0;
  if (skippedCount === 0) return null;

  return (
    <div className="flex gap-2 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 px-3 py-2 text-surface-700 text-xs dark:text-surface-300">
      <TriangleAlert className="mt-px size-3.5 shrink-0 text-semantic-warning" />
      <span>
        {skippedCount === 1
          ? '1 CalDAV account in this profile could not be imported.'
          : `${skippedCount} CalDAV accounts in this profile could not be imported.`}
      </span>
    </div>
  );
};
