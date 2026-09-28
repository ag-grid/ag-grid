#!/usr/bin/env bash
# Shrink a yarn v1 download cache before it is saved to the GitHub Actions cache.
#
# Usage: hollow-yarn-cache.sh <yarn-cache-dir>
#
# yarn v1 fetches every optional dependency in the lockfile and only then checks its
# os/cpu fields, so the cache holds native binaries for every platform (esbuild, rollup,
# swc, sharp, ...) although this runner links only its own. Two things are trimmed:
#
# - Foreign-platform entries are hollowed to their .yarn-metadata.json and package.json.
#   Deleting them instead makes the next install re-download them all: yarn treats an
#   entry as cached when its metadata file exists, and needs only the manifest to skip
#   an incompatible package, so a hollow entry is never fetched, linked or read.
# - The packed .yarn-tarball.tgz copy kept beside each extracted package is removed;
#   installs link from the extracted files.
#
# Hollow entries are valid only on runners of the same OS and architecture, so the
# cache key must include both.
set -euo pipefail

cache="${1:?usage: hollow-yarn-cache.sh <yarn-cache-dir>}"
if [[ ! -d "${cache}" ]]; then
    echo "No yarn cache at ${cache}; nothing to hollow"
    exit 0
fi

# npm cpu names match the package-name suffixes native packages use (x64, arm64, ...).
arch="$(node -p process.arch)"
platform_suffix='-(darwin|win32|android|freebsd|openbsd|netbsd|sunos|aix|openharmony)-|-linux-(arm|arm64|x64|ia32|ppc64|ppc64le|s390x|riscv64|loong64|mips64el|loongarch64)-|-linuxmusl-|-musl-'
# glibc builds are suffixed -gnu (rollup, swc, nx, ...) or -glibc (@parcel/watcher).
own_platform="-linux-${arch}-(gnu-|glibc-)?[0-9]"

before="$(du -sh "${cache}" | cut -f1)"
hollowed=0
for entry in "${cache}"/npm-*; do
    name="$(basename "${entry}")"
    grep -qE -- "${platform_suffix}" <<< "${name}" || continue
    if grep -qE -- "${own_platform}" <<< "${name}" && ! grep -qE -- '-musl-' <<< "${name}"; then
        continue
    fi
    find "${entry}" -mindepth 1 -type f ! -name .yarn-metadata.json ! -name package.json -delete
    find "${entry}" -mindepth 1 -type d -empty -delete
    hollowed=$((hollowed + 1))
done
find "${cache}" -name .yarn-tarball.tgz -delete

echo "Hollowed ${hollowed} foreign-platform entries; yarn cache ${before} -> $(du -sh "${cache}" | cut -f1)"
