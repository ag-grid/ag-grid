#!/bin/bash
# Apply patches with recovery for stale cached packages.
#
# When CI restores a cached node_modules that contains already-patched or
# differently-patched packages, patch-package fails. This script detects
# that scenario and recovers by removing the affected packages and
# reinstalling them before retrying.

set -e

# Prefer the local binary (no npm invocation = no npm 11 env-var warnings).
# Fall back to npx when invoked manually outside of a yarn/npm script context.
if [[ -x "./node_modules/.bin/patch-package" ]]; then
    _patch_package() { ./node_modules/.bin/patch-package "$@"; }
else
    _patch_package() { npx patch-package "$@"; }
fi

# First attempt - try applying patches normally
if _patch_package; then
    exit 0
fi

echo ""
echo "Patch failed, attempting recovery..."
echo ""

# Remove all patched packages so they can be reinstalled fresh
for patch_file in patches/*.patch; do
    [[ -f "$patch_file" ]] || continue
    filename=$(basename "$patch_file")

    # Extract package name from patch filename
    # Handles: @scope+pkg+version.patch -> @scope/pkg
    #          pkg+version.patch -> pkg
    if [[ "$filename" =~ ^@([^+]+)\+([^+]+)\+.+\.patch$ ]]; then
        pkg="@${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    elif [[ "$filename" =~ ^([^+]+)\+.+\.patch$ ]]; then
        pkg="${BASH_REMATCH[1]}"
    else
        continue
    fi

    if [[ -d "node_modules/$pkg" ]]; then
        echo "Removing node_modules/$pkg"
        rm -rf "node_modules/$pkg"
    fi
done

# Reinstall removed packages without triggering postinstall again
# --ignore-scripts prevents infinite loop
echo ""
echo "Reinstalling packages..."
yarn install --ignore-scripts --check-files

# Retry patches - this should now succeed
echo ""
echo "Retrying patches..."
_patch_package
