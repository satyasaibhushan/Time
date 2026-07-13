#!/bin/zsh

set -euo pipefail

repo_root="${0:A:h:h:h:h}"
output_path="${1:-$repo_root/Tempo.zip}"
archive_path="${RUNNER_TEMP:-/tmp}/Tempo.xcarchive"
app_path="$archive_path/Products/Applications/Tempo.app"

: "${CONVEX_URL:?Set CONVEX_URL to the same Convex deployment used by the web app}"

if [[ "$CONVEX_URL" != https://*.convex.cloud ]]; then
  echo "CONVEX_URL must be an HTTPS URL on convex.cloud" >&2
  exit 1
fi

cd "$repo_root"
rm -rf "$archive_path" "$output_path"

xcodebuild -quiet \
  -project apps/apple/Time.xcodeproj \
  -scheme TempoMac \
  -configuration Release \
  -destination "generic/platform=macOS" \
  -archivePath "$archive_path" \
  ARCHS=arm64 \
  ONLY_ACTIVE_ARCH=NO \
  CODE_SIGNING_ALLOWED=NO \
  CONVEX_URL="$CONVEX_URL" \
  archive

test -x "$app_path/Contents/MacOS/Tempo"
codesign --force --deep --sign - "$app_path"
codesign --verify --deep --strict "$app_path"
ditto -c -k --sequesterRsrc --keepParent "$app_path" "$output_path"

echo "$output_path"
