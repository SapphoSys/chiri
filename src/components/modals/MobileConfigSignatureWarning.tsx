import TriangleAlert from 'lucide-react/icons/triangle-alert';
import type {
  MobileConfigSignatureStatus,
  MobileConfigSignerInfo,
} from '$types/mobileconfig/decode';

interface MobileConfigSignatureWarningProps {
  signature: MobileConfigSignatureStatus;
  signer?: MobileConfigSignerInfo;
}

const getSignerLabel = (signer: MobileConfigSignerInfo | undefined) => {
  if (!signer) return null;
  return signer.organization ?? signer.commonName ?? null;
};

export const MobileConfigSignatureWarning = ({
  signature,
  signer,
}: MobileConfigSignatureWarningProps) => {
  if (signature !== 'signed-unverified') return null;

  const signerLabel = getSignerLabel(signer);

  return (
    <div className="flex gap-2 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 px-3 py-2 text-surface-700 text-xs dark:text-surface-300">
      <TriangleAlert className="mt-px size-3.5 shrink-0 text-semantic-warning" />
      <span>
        {signerLabel
          ? `This profile says it was signed by ${signerLabel}, but Chiri has not verified the signer yet.`
          : 'This profile is signed, but Chiri has not verified the signer yet.'}{' '}
        Only continue if you trust where the profile came from.
      </span>
    </div>
  );
};
