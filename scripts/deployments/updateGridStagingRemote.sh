#!/usr/bin/env bash

set -euo pipefail

STAGING_DIR="@WWW_ROOT_DIR@/html"
ZIP_PATH="@WWW_ROOT_DIR@/@FILENAME@"
STAGING_NEW="${STAGING_DIR}.new.$$"
STAGING_OLD="${STAGING_DIR}.old"
BRANCH_BUILDS_DIR="branch-builds"

echo "Validating uploaded archive at ${ZIP_PATH}"
if [ ! -f "${ZIP_PATH}" ]; then
    echo "ERROR: ${ZIP_PATH} not found"
    exit 1
fi
unzip -tq "${ZIP_PATH}"

echo "Extracting to ${STAGING_NEW}"
mkdir -p "${STAGING_NEW}"
unzip -q "${ZIP_PATH}" -d "${STAGING_NEW}"

if [ -d "${STAGING_DIR}/${BRANCH_BUILDS_DIR}" ]; then
    echo "Preserving ${BRANCH_BUILDS_DIR} into ${STAGING_NEW}"
    cp -R "${STAGING_DIR}/${BRANCH_BUILDS_DIR}" "${STAGING_NEW}/${BRANCH_BUILDS_DIR}"
fi

echo "Swapping into ${STAGING_DIR}"
rm -rf "${STAGING_OLD}"
if [ -d "${STAGING_DIR}" ]; then
    mv "${STAGING_DIR}" "${STAGING_OLD}"
fi
mv "${STAGING_NEW}" "${STAGING_DIR}"

echo "Cleaning up"
rm -rf "${STAGING_OLD}" "${ZIP_PATH}"
