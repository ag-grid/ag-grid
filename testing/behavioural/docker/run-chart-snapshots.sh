#!/usr/bin/env bash
# Runs the chart-snapshot tests inside a container so rendered output is byte-identical between
# developer machines and CI - Skia's font/AA rendering is not guaranteed identical across host
# OSes, only across identical containers. IMAGE_TAG is pinned by digest (not a floating tag) so
# an upstream base-image rebuild can't silently change font/AA rendering out from under us - the
# whole point of pinning. To move to a newer digest deliberately, re-resolve it (see the comment
# by IMAGE_TAG below), update this script, then re-run with --update to confirm baselines still match.
#
# The repo is bind-mounted read-write (as the host uid:gid, via --user, so anything written is
# correctly owned on the host - build outputs like dist/ and .nx's cache are expected to land
# there, same as a native `yarn build-generators` run would produce). The one thing that must
# never be silently rewritten is yarn.lock, so it's individually overridden read-only.
#
# Every node_modules directory that already exists on the host (yarn workspaces hoists most
# installs to the repo root, but any workspace can end up with its own nested node_modules) is
# individually shadowed by its own writable named volume - never the host's own directory - both
# because installing Linux-native binaries (skia-canvas, sharp, ...) into it would corrupt the
# host's macOS/Windows install, and because the volumes persist across runs for fast incremental
# installs. Volume names are suffixed with the host uid so two developers (or a developer and a
# future CI runner) sharing a machine never race on the same root-owned-until-first-chown volume.
#
# Usage:
#   ./run-chart-snapshots.sh            # run the snapshot tests, fail on any pixel diff
#   ./run-chart-snapshots.sh --update   # regenerate baseline PNGs from the current render
#   ./run-chart-snapshots.sh --clean    # wipe the node_modules/yarn-cache volumes and reinstall from scratch
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
# Pinned by digest, not the floating `22-bookworm` tag - see header comment. Resolved via:
#   docker pull mcr.microsoft.com/devcontainers/javascript-node:22-bookworm
#   docker image inspect mcr.microsoft.com/devcontainers/javascript-node:22-bookworm --format '{{index .RepoDigests 0}}'
IMAGE_TAG="mcr.microsoft.com/devcontainers/javascript-node@sha256:92e97da1df8f4135188053b3a5e22e3ef316ecaf2a0d33b8831e1dec5cdaa77f"
UID_TAG="$(id -u)"
YARN_CACHE_VOLUME="ag-grid-chart-yarn-cache-$UID_TAG"

UPDATE=0
CLEAN=0
for arg in "$@"; do
    case "$arg" in
        --update) UPDATE=1 ;;
        --clean) CLEAN=1 ;;
        *)
            echo "Unknown argument: $arg" >&2
            exit 1
            ;;
    esac
done

# Discover every node_modules directory already present in the repo - not just the root one -
# so each can be shadowed. Excludes node_modules nested inside another node_modules (a package's
# own dependency tree), which don't need independent shadowing.
# NOT `mapfile` - this script runs on the host first (macOS ships bash 3.2, no `mapfile` builtin)
# before ever touching the container, so only bash-3.2-portable constructs are safe here.
NODE_MODULES_RELPATHS=()
while IFS= read -r relpath; do
    NODE_MODULES_RELPATHS+=("$relpath")
done < <(
    find "$REPO_ROOT" -type d -name node_modules -not -path '*/node_modules/*/node_modules*' \
        | sed "s|^$REPO_ROOT/||; s|^$REPO_ROOT\$|.|"
)

volume_name_for() {
    # Sanitize a relative path (e.g. "testing/behavioural/node_modules") into a valid volume name.
    echo "ag-grid-chart-nm-$(echo "$1" | tr '/.' '--')-$UID_TAG"
}

ALL_VOLUMES=("$YARN_CACHE_VOLUME")
for relpath in "${NODE_MODULES_RELPATHS[@]}"; do
    ALL_VOLUMES+=("$(volume_name_for "$relpath")")
done

if [[ "$CLEAN" == "1" ]]; then
    docker volume rm -f "${ALL_VOLUMES[@]}" >/dev/null 2>&1 || true
fi

for vol in "${ALL_VOLUMES[@]}"; do
    if ! docker volume inspect "$vol" >/dev/null 2>&1; then
        docker volume create "$vol" >/dev/null
        # Named volumes are created root-owned regardless of the --user the consuming container
        # runs as; fix that once here rather than on every run. Volume names are already uid-suffixed
        # above, so this chown is never contended by another uid.
        docker run --rm -v "$vol:/vol" "$IMAGE_TAG" chown -R "$UID_TAG:$(id -g)" /vol
    fi
done

# Create on the host (as the current user) before docker does - an auto-created bind mount point
# would otherwise end up owned by the container's runtime user.
mkdir -p "$REPO_ROOT/testing/behavioural/src/charts/__image_snapshots__"

NODE_MODULES_MOUNT_ARGS=()
for relpath in "${NODE_MODULES_RELPATHS[@]}"; do
    NODE_MODULES_MOUNT_ARGS+=(-v "$(volume_name_for "$relpath"):/workspace/$relpath")
done

NX_TARGET="ag-behavioural-testing:test-chart-snapshots"
if [[ "$UPDATE" == "1" ]]; then
    NX_TARGET="$NX_TARGET:update"
fi

docker run --rm \
    --user "$UID_TAG:$(id -g)" \
    -e HOME=/tmp \
    -v "$REPO_ROOT:/workspace" \
    -v "$REPO_ROOT/yarn.lock:/workspace/yarn.lock:ro" \
    "${NODE_MODULES_MOUNT_ARGS[@]}" \
    -v "$YARN_CACHE_VOLUME:/tmp/yarn-cache" \
    -w /workspace \
    "$IMAGE_TAG" \
    bash -c "
        set -euo pipefail
        git config --global --add safe.directory /workspace
        # NOT --ignore-scripts: skia-canvas's own postinstall fetches its native binary for the
        # current platform - skipping all postinstall scripts to dodge ag-grid's own (git-hooks
        # setup, prompt-sync) took skia-canvas's down with them. ag-grid's postinstall hooks run
        # fine here since, unlike an image-baked COPY, this bind-mounts the real .git.
        #
        # Colima's virtiofs bind-mount occasionally EACCESes creating a new file in an unrelated
        # nested workspace under concurrent install - transient, not a real permission problem
        # (retrying with no changes succeeds). Only retry on that specific signature so a genuine
        # lockfile mismatch or network failure surfaces immediately instead of being retried blind.
        for attempt in 1 2 3; do
            install_log=\"\$(mktemp)\"
            if yarn install --frozen-lockfile --cache-folder /tmp/yarn-cache >\"\$install_log\" 2>&1; then
                cat \"\$install_log\"
                rm -f \"\$install_log\"
                break
            fi
            cat \"\$install_log\"
            if [ \"\$attempt\" = 3 ] || ! grep -q EACCES \"\$install_log\"; then
                rm -f \"\$install_log\"
                exit 1
            fi
            rm -f \"\$install_log\"
            echo \"yarn install attempt \$attempt failed with EACCES, retrying...\" >&2
        done
        yarn nx run $NX_TARGET
    "
