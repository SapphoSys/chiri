#!/usr/bin/env bash

set -euo pipefail

: "${APPIMAGE_PATH:?APPIMAGE_PATH is required}"
: "${PUBLIC_APPIMAGE_NAME:?PUBLIC_APPIMAGE_NAME is required}"

if [ ! -f "$APPIMAGE_PATH" ]; then
  echo "::error::AppImage not found: $APPIMAGE_PATH"
  exit 1
fi

generated_zsync_path="${APPIMAGE_PATH}.zsync"
if [ ! -s "$generated_zsync_path" ]; then
  echo "::error::Generated zsync metadata not found: $generated_zsync_path"
  exit 1
fi

appimage_dir="${APPIMAGE_PATH%/*}"
public_appimage_path="${appimage_dir}/${PUBLIC_APPIMAGE_NAME}"
public_zsync_path="${public_appimage_path}.zsync"

if [ -e "$public_appimage_path" ] || [ -e "$public_zsync_path" ]; then
  echo "::error::Public AppImage output already exists: $public_appimage_path"
  exit 1
fi

# The AppImage product name is intentionally the bundle identifier for Wayland
# desktop identity. Generate the public zsync file from a final-named copy so
# zsyncmake records the legacy release filename without changing that identity.
cp "$APPIMAGE_PATH" "$public_appimage_path"
rm "$generated_zsync_path"
rm "$APPIMAGE_PATH"

zsyncmake \
  -u "$PUBLIC_APPIMAGE_NAME" \
  -o "$public_zsync_path" \
  -f "$PUBLIC_APPIMAGE_NAME" \
  "$public_appimage_path"

if ! grep -aFqx "Filename: ${PUBLIC_APPIMAGE_NAME}" "$public_zsync_path"; then
  echo "::error::zsyncmake produced metadata for the wrong AppImage: $public_zsync_path"
  exit 1
fi

if ! grep -aFqx "URL: ${PUBLIC_APPIMAGE_NAME}" "$public_zsync_path"; then
  echo "::error::zsyncmake produced a non-release-relative AppImage URL: $public_zsync_path"
  exit 1
fi

echo "$public_zsync_path"
