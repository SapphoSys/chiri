import { MOBILE_CONFIG_MIME_TYPE } from '$lib/mobileconfig';
import { getMobileConfigFileName } from '$lib/mobileconfig/export';
import { generateMobileConfig } from '$lib/mobileconfig/generate';
import type { Account } from '$types/account';
import type { MobileConfigGenerationOptions } from '$types/mobileconfig/export';

export type ShareMobileConfigResult = 'shared' | 'unsupported';

/**
 * Share a generated .mobileconfig profile using the Web Share API.
 */
export const shareMobileConfig = async (
  account: Account,
  options: MobileConfigGenerationOptions = {},
): Promise<ShareMobileConfigResult> => {
  const xml = generateMobileConfig(account, options);
  const fileName = getMobileConfigFileName(account);
  const file = new File([xml], fileName, { type: MOBILE_CONFIG_MIME_TYPE });
  const shareData = { files: [file] };

  const canShare = typeof navigator.canShare === 'function' ? navigator.canShare(shareData) : true;

  if (typeof navigator.share === 'function' && canShare) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch (error) {
      // User cancelled the share sheet — rethrow so the caller can ignore it.
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
    }
  }

  return 'unsupported';
};
