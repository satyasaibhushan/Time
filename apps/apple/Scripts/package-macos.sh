#!/bin/zsh

set -euo pipefail

repo_root="${0:A:h:h:h:h}"
output_path="${1:-$repo_root/Tempo.zip}"
archive_path="${RUNNER_TEMP:-/tmp}/Tempo.xcarchive"
app_path="$archive_path/Products/Applications/Tempo.app"

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
  archive

test -x "$app_path/Contents/MacOS/Tempo"
codesign --force --deep --sign - "$app_path"
codesign --verify --deep --strict "$app_path"
ditto -c -k --sequesterRsrc --keepParent "$app_path" "$output_path"

echo "$output_path"
