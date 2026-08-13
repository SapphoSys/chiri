#!/usr/bin/env bash

set -euo pipefail

: "${VERSION:?VERSION is required}"
: "${TAG:?TAG is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"

ASSET_DIR="${ASSET_DIR:-release-assets}"
OUTPUT="${OUTPUT:-${ASSET_DIR}/latest.json}"
BASE_URL="https://github.com/${GITHUB_REPOSITORY}/releases/download/${TAG}"

require_signature() {
  local asset="$1"

  if [ ! -s "${ASSET_DIR}/${asset}" ]; then
    echo "::error::Missing updater signature: ${asset}"
    exit 1
  fi
}

signature_assets=(
  "Chiri_aarch64.app.tar.gz.sig"
  "Chiri_x64.app.tar.gz.sig"
  "Chiri_${VERSION}_amd64.AppImage.sig"
  "Chiri_${VERSION}_aarch64.AppImage.sig"
  "Chiri_${VERSION}_amd64.deb.sig"
  "Chiri_${VERSION}_arm64.deb.sig"
  "Chiri-${VERSION}-1.x86_64.rpm.sig"
  "Chiri-${VERSION}-1.aarch64.rpm.sig"
  "Chiri_${VERSION}_x64_en-US.msi.sig"
  "Chiri_${VERSION}_x64-setup.exe.sig"
  "Chiri_${VERSION}_arm64_en-US.msi.sig"
  "Chiri_${VERSION}_arm64-setup.exe.sig"
)

for asset in "${signature_assets[@]}"; do
  require_signature "$asset"
done

mkdir -p "$(dirname "$OUTPUT")"

PUB_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

jq -n \
  --arg version "$VERSION" \
  --arg pub_date "$PUB_DATE" \
  --arg base "$BASE_URL" \
  --rawfile darwin_aarch64_sig "${ASSET_DIR}/Chiri_aarch64.app.tar.gz.sig" \
  --rawfile darwin_x86_64_sig "${ASSET_DIR}/Chiri_x64.app.tar.gz.sig" \
  --rawfile linux_x86_64_appimage_sig "${ASSET_DIR}/Chiri_${VERSION}_amd64.AppImage.sig" \
  --rawfile linux_aarch64_appimage_sig "${ASSET_DIR}/Chiri_${VERSION}_aarch64.AppImage.sig" \
  --rawfile linux_x86_64_deb_sig "${ASSET_DIR}/Chiri_${VERSION}_amd64.deb.sig" \
  --rawfile linux_aarch64_deb_sig "${ASSET_DIR}/Chiri_${VERSION}_arm64.deb.sig" \
  --rawfile linux_x86_64_rpm_sig "${ASSET_DIR}/Chiri-${VERSION}-1.x86_64.rpm.sig" \
  --rawfile linux_aarch64_rpm_sig "${ASSET_DIR}/Chiri-${VERSION}-1.aarch64.rpm.sig" \
  --rawfile windows_x86_64_msi_sig "${ASSET_DIR}/Chiri_${VERSION}_x64_en-US.msi.sig" \
  --rawfile windows_x86_64_nsis_sig "${ASSET_DIR}/Chiri_${VERSION}_x64-setup.exe.sig" \
  --rawfile windows_aarch64_msi_sig "${ASSET_DIR}/Chiri_${VERSION}_arm64_en-US.msi.sig" \
  --rawfile windows_aarch64_nsis_sig "${ASSET_DIR}/Chiri_${VERSION}_arm64-setup.exe.sig" \
  '
    def platform($signature; $asset): {
      signature: $signature,
      url: ($base + "/" + $asset)
    };

    {
      version: $version,
      notes: "",
      pub_date: $pub_date,
      platforms: {
        "darwin-aarch64": platform($darwin_aarch64_sig; "Chiri_aarch64.app.tar.gz"),
        "darwin-aarch64-app": platform($darwin_aarch64_sig; "Chiri_aarch64.app.tar.gz"),
        "darwin-x86_64": platform($darwin_x86_64_sig; "Chiri_x64.app.tar.gz"),
        "darwin-x86_64-app": platform($darwin_x86_64_sig; "Chiri_x64.app.tar.gz"),

        "linux-x86_64": platform($linux_x86_64_appimage_sig; "Chiri_" + $version + "_amd64.AppImage"),
        "linux-x86_64-appimage": platform($linux_x86_64_appimage_sig; "Chiri_" + $version + "_amd64.AppImage"),
        "linux-x86_64-deb": platform($linux_x86_64_deb_sig; "Chiri_" + $version + "_amd64.deb"),
        "linux-x86_64-rpm": platform($linux_x86_64_rpm_sig; "Chiri-" + $version + "-1.x86_64.rpm"),
        "linux-aarch64": platform($linux_aarch64_appimage_sig; "Chiri_" + $version + "_aarch64.AppImage"),
        "linux-aarch64-appimage": platform($linux_aarch64_appimage_sig; "Chiri_" + $version + "_aarch64.AppImage"),
        "linux-aarch64-deb": platform($linux_aarch64_deb_sig; "Chiri_" + $version + "_arm64.deb"),
        "linux-aarch64-rpm": platform($linux_aarch64_rpm_sig; "Chiri-" + $version + "-1.aarch64.rpm"),

        "windows-x86_64": platform($windows_x86_64_msi_sig; "Chiri_" + $version + "_x64_en-US.msi"),
        "windows-x86_64-msi": platform($windows_x86_64_msi_sig; "Chiri_" + $version + "_x64_en-US.msi"),
        "windows-x86_64-nsis": platform($windows_x86_64_nsis_sig; "Chiri_" + $version + "_x64-setup.exe"),
        "windows-aarch64": platform($windows_aarch64_msi_sig; "Chiri_" + $version + "_arm64_en-US.msi"),
        "windows-aarch64-msi": platform($windows_aarch64_msi_sig; "Chiri_" + $version + "_arm64_en-US.msi"),
        "windows-aarch64-nsis": platform($windows_aarch64_nsis_sig; "Chiri_" + $version + "_arm64-setup.exe")
      }
    }
  ' > "$OUTPUT"

jq -e --arg version "$VERSION" '
  .version == $version and
  (.platforms | type == "object" and length == 18) and
  (.platforms["darwin-aarch64"].signature | length > 0) and
  (.platforms["darwin-x86_64"].signature | length > 0)
' "$OUTPUT" > /dev/null

echo "Generated updater metadata for v${VERSION}: ${OUTPUT}"
