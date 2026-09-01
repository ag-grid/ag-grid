#!/bin/bash

# Set or clear the in-flight archive caching exemption on a remote box.
# Called by uploadAndUnzipArchive.sh during a grid release candidate, and runnable on its own.
#
# Patches the root .htaccess and, where they carry the marker block, each archive's own copy.
# Both are needed: Apache merges root-down and the deeper file wins on Header set, so an
# archive that ships the hashed-asset rule keeps its /_astro/ files cached for a week unless
# its own copy is patched too.

if [ "$#" -lt 3 ]
  then
    echo "You must supply a grid version, a charts version & a host"
    echo "For example: ./scripts/deployments/prep_and_archive/patchUncachedArchives.sh 36.1.0 14.1.0 user@host"
    echo ""
    echo "  set   (default) exempts both archives from caching while they are under test"
    echo "  clear restores normal caching, and only if both versions match what is in flight"
    echo ""
    echo "For example: ./scripts/deployments/prep_and_archive/patchUncachedArchives.sh 36.1.0 14.1.0 user@host clear"
    echo ""
    echo "Nothing has to clear this: a production docs deploy emits an empty in-flight block,"
    echo "so going live restores normal caching on its own."
    echo ""
    echo "Requires \$SSH_FILE, \$SSH_PORT and \$GRID_ROOT_DIR, as the other deploy scripts do."
    exit 1
fi

VERSION=$1
# The charts version cut alongside this grid version.
CHARTS_VERSION=$2
CURRENT_HOST=$3
ACTION=${4:-set}

export SSH_LOCATION=$SSH_FILE

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
then
    echo "Version isn't in the expected format. Valid format is: Number.Number.Number. For example 36.1.0";
    exit 1;
fi

if ! [[ "$CHARTS_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
then
    echo "Charts version isn't in the expected format. Valid format is: Number.Number.Number. For example 14.1.0";
    exit 1;
fi

if [[ "$ACTION" != "set" && "$ACTION" != "clear" ]]
then
    echo "Action must be 'set' or 'clear', not '$ACTION'";
    exit 1;
fi

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit 1;
fi

if [ -z "$GRID_ROOT_DIR" ]
then
      echo "\$GRID_ROOT_DIR is not set"
      exit 1;
fi

PATCHER="$(dirname "$0")/../../uncached-archives.mjs"
if ! [[ -f "$PATCHER" ]]
then
    echo "File [$PATCHER] doesn't exist - exiting script.";
    exit 1;
fi

MARKER="# BEGIN in-flight release archives"
CACHED_ASSET_RULE="max-age=604800"
WARNED=0
PREPARED=()

function remoteExists {
    ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "test -f $1"
}

# prepare <remote .htaccess> <required|optional>
#
# Fetches, classifies and patches a LOCAL copy. Nothing is written to the box here, so a
# problem with the second or third file is found before the first one has been changed.
#
# required - the root file. Anything unexpected is fatal.
# optional - an archive's own copy. Older archives have neither the marker block nor the
#            hashed-asset rule, and need no patch: the root file already covers them.
function prepare {
    local remote=$1
    local mode=$2
    local local_copy

    echo "$remote"

    if ! remoteExists "$remote"
    then
        if [[ "$mode" == "optional" ]]
        then
            echo "  no .htaccess here - nothing to patch";
            return 0;
        fi
        echo "  It does not exist. Nothing has been changed.";
        exit 1;
    fi

    # It exists, so a failed fetch is a real failure - never a reason to skip silently.
    local_copy=$(mktemp)
    if ! scp -i $SSH_LOCATION -P $SSH_PORT $CURRENT_HOST:$remote "$local_copy"
    then
        echo "  Could not fetch it, though it exists. Nothing has been changed.";
        rm -f "$local_copy";
        exit 1;
    fi

    if ! grep -q "$MARKER" "$local_copy"
    then
        if [[ "$mode" == "optional" ]]
        then
            # Only worth saying during set: on clear, an unpatchable file is already in the
            # state clear is trying to reach.
            if [[ "$ACTION" == "set" ]] && grep -q "$CACHED_ASSET_RULE" "$local_copy"
            then
                echo "  WARNING: it caches hashed assets but has no in-flight marker block, so it";
                echo "  cannot be patched. Its /_astro/ files will stay cached while under test.";
                WARNED=1;
            else
                echo "  no marker block - the root file covers it";
            fi
            rm -f "$local_copy";
            return 0;
        fi
        echo "  No in-flight marker block. It predates this feature, or is not a generated .htaccess.";
        echo "  Nothing has been changed.";
        rm -f "$local_copy";
        exit 1;
    fi

    # Patch the local copy. A guarded clear refusing is caught here, before any remote write.
    # Drop the patcher's trailing "applied to <temp file>" - the remote path is printed above.
    node "$PATCHER" "$local_copy" "$ACTION" "$VERSION" "$CHARTS_VERSION" | grep -v "^applied to " | sed 's/^/  /'
    if [ "${PIPESTATUS[0]}" -ne 0 ]
    then
        echo "  Patching failed. Nothing has been changed.";
        rm -f "$local_copy";
        exit 1;
    fi

    PREPARED+=("$remote|$local_copy")
}

# commit <remote .htaccess> <patched local copy>
function commit {
    local remote=$1
    local local_copy=$2
    local staged="$remote.new-$$"
    local backup="$remote.bak-$(date +%Y%m%d%H%M%S)"

    function commitFailed {
        echo "  $1";
        rm -f "$local_copy";
        ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "rm -f $staged" 2>/dev/null;
        exit 1;
    }

    # Keep a timestamped copy on the box, so a bad patch is one cp away from being undone.
    if ! ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "cp $remote $backup"
    then
        commitFailed "Could not back up $remote.";
    fi

    # Upload beside it and rename over: scp writes in place, so an interrupted transfer
    # straight onto the live file would leave a truncated one. mv within a directory is
    # atomic, so a reader sees either the old file or the new one.
    if ! scp -i $SSH_LOCATION -P $SSH_PORT "$local_copy" $CURRENT_HOST:$staged
    then
        commitFailed "Could not upload the patched $remote.";
    fi
    if ! ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "chmod 644 $staged && mv $staged $remote"
    then
        commitFailed "Could not move the patched $remote into place.";
    fi
    rm -f "$local_copy"

    echo "$remote patched. Previous copy kept at $backup"
}

# The root file governs each archive's HTML and its non-hashed files, and is the only place
# that covers a charts archive whose own copy comes from the charts repo.
prepare "$GRID_ROOT_DIR/.htaccess" required

# Each archive's own copy, which overrides the root for anything it sets a value for.
prepare "$GRID_ROOT_DIR/archive/$VERSION/.htaccess" optional
prepare "$GRID_ROOT_DIR/charts/archive/$CHARTS_VERSION/.htaccess" optional

echo ""
for entry in "${PREPARED[@]}"
do
    commit "${entry%%|*}" "${entry##*|}"
done

if [ "$WARNED" -eq 1 ]
then
    echo ""
    echo "Finished with warnings - see above. The archives are exempt except where noted."
else
    echo ""
    echo "Done."
fi

echo "NOTE: a docs deploy resets the root in-flight block. That is how the exemption is"
echo "      removed at GA, but a mid-cycle docs deploy drops it - re-run this if so."
