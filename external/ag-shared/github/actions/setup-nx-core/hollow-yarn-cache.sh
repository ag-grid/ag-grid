#!/usr/bin/env bash
# Shrink a yarn v1 download cache before it is saved to the GitHub Actions cache.
#
# Usage: hollow-yarn-cache.sh <yarn-cache-dir>
#
# Yarn 4 (Berry) note: the hollowing logic below only understands the yarn v1 cache
# layout (a `npm-<name>-<version>-<hash>/` directory per entry, containing a
# `.yarn-metadata.json` and a `.yarn-tarball.tgz`). Under Yarn 4 the cache is a flat
# directory of single `<name>-npm-<version>-<hash>-<compression>.zip` files instead, so
# the `npm-*` glob below matches nothing there — verified against a real Yarn 4.10
# global cache (`yarn config get cacheFolder`). This isn't only a format the logic needs
# porting to, though: that same cache was checked for foreign-platform native binaries
# (esbuild, rollup and sharp all ship platform-specific optional dependencies) and none
# were found — only the current runner's own platform/arch had ever been fetched. So
# unlike yarn v1, Yarn 4 filters optional dependencies by os/cpu *before* fetching, not
# after, meaning the bloat this script exists to trim does not occur under Yarn 4 and
# there is nothing to port. It exits early below as a documented, clean no-op rather
# than silently matching nothing under the stale glob.
set -euo pipefail

cache="${1:?usage: hollow-yarn-cache.sh <yarn-cache-dir>}"
if [[ ! -d "${cache}" ]]; then
    echo "No yarn cache at ${cache}; nothing to hollow"
    exit 0
fi

if compgen -G "${cache}"/*.zip > /dev/null; then
    echo "${cache} holds Yarn 4-style *.zip cache entries, not yarn v1's npm-*/ directories; it is already platform-filtered at fetch time. Nothing to hollow."
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
