#!/usr/bin/env bash
# shellcheck disable=SC1091,2154

set -e

# Run the base VSCodium preparation
. ./prepare_vscode.sh

cd vscode || { echo "'vscode' dir not found"; exit 1; }

# Additional Rashizun Branding
setpath() {
  local jsonTmp
  { set +x; } 2>/dev/null
  jsonTmp=$( jq --arg 'value' "${3}" "setpath(path(.${2}); \$value)" "${1}.json" )
  echo "${jsonTmp}" > "${1}.json"
  set -x
}

echo "Adapting VSCodium to Rashizun..."

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  setpath "product" "nameShort" "Rashizun - Insiders"
  setpath "product" "nameLong" "Rashizun - Insiders"
  setpath "product" "applicationName" "rashizun-insiders"
  setpath "product" "dataFolderName" ".rashizun-insiders"
  setpath "product" "linuxIconName" "rashizun-insiders"
  setpath "product" "urlProtocol" "rashizun-insiders"
  setpath "product" "serverApplicationName" "rashizun-server-insiders"
  setpath "product" "serverDataFolderName" ".rashizun-server-insiders"
  setpath "product" "darwinBundleIdentifier" "com.rashizun.RashizunInsiders"
  setpath "product" "win32AppUserModelId" "Rashizun.RashizunInsiders"
  setpath "product" "win32DirName" "Rashizun Insiders"
  setpath "product" "win32MutexName" "rashizuninsiders"
  setpath "product" "win32NameVersion" "Rashizun Insiders"
  setpath "product" "win32RegValueName" "RashizunInsiders"
  setpath "product" "win32ShellNameShort" "Rashizun Insiders"
else
  setpath "product" "nameShort" "Rashizun"
  setpath "product" "nameLong" "Rashizun"
  setpath "product" "applicationName" "rashizun"
  setpath "product" "linuxIconName" "rashizun"
  setpath "product" "urlProtocol" "rashizun"
  setpath "product" "serverApplicationName" "rashizun-server"
  setpath "product" "serverDataFolderName" ".rashizun-server"
  setpath "product" "darwinBundleIdentifier" "com.rashizun"
  setpath "product" "win32AppUserModelId" "Rashizun.Rashizun"
  setpath "product" "win32DirName" "Rashizun"
  setpath "product" "win32MutexName" "rashizun"
  setpath "product" "win32NameVersion" "Rashizun"
  setpath "product" "win32RegValueName" "Rashizun"
  setpath "product" "win32ShellNameShort" "Rashizun"
fi

# Global string replacements from VSCodium to Rashizun
# Using the replace function from utils.sh which was sourced in prepare_vscode.sh
. ../utils.sh

# Update package.json
replace 's|VSCodium|Rashizun|g' package.json
replace 's|codium|rashizun|g' package.json

# Update electron metadata
replace 's|VSCodium|Rashizun|g' build/lib/electron.ts

# Update Linux metadata
if [[ -f resources/linux/code.appdata.xml ]]; then
  sed -i 's|VSCodium|Rashizun|g' resources/linux/code.appdata.xml
  sed -i 's|vscodium.com|rashizun.com|g' resources/linux/code.appdata.xml
fi

if [[ -f resources/linux/debian/control.template ]]; then
  sed -i 's|VSCodium|Rashizun|g' resources/linux/debian/control.template
fi

# Inject Rashizun Core extension
echo "Injected Rashizun Core Extension"
mkdir -p extensions/rashizun-core
cp -r ../extensions/rashizun-core/* extensions/rashizun-core/

# Apply Rashizun Branding to product.json
if [ -f "../rashizun-branding.json" ]; then
    jq -s '.[0] * .[1]' product.json ../rashizun-branding.json > product.json.tmp && mv product.json.tmp product.json
fi

echo "Rashizun Core Integration Complete."

# Final branding touch
echo "Rashizun adaptation complete."

cd ..
