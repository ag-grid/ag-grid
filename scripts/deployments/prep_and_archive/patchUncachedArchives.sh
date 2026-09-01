#!/bin/bash

# Set or clear the in-flight archive caching exemption in the root .htaccess on a remote box.
# Called by uploadAndUnzipArchive.sh during a grid release candidate, and runnable on its own.

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

LIVE_HTACCESS=$(mktemp)
REMOTE=".htaccess"
STAGED="$GRID_ROOT_DIR/.htaccess.new-$$"
BACKUP="$GRID_ROOT_DIR/.htaccess.bak-$(date +%Y%m%d%H%M%S)"

function patchFailed {
    echo "$1";
    echo "The live root .htaccess has NOT been changed.";
    if [[ "$ACTION" == "set" ]]
    then
        echo "The archive is cacheable - fix this and re-run, or it will serve stale.";
    fi
    rm -f "$LIVE_HTACCESS";
    ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "rm -f $STAGED" 2>/dev/null;
    exit 1;
}

echo "scp -i $SSH_LOCATION -P $SSH_PORT $CURRENT_HOST:$GRID_ROOT_DIR/$REMOTE -> local"
if ! scp -i $SSH_LOCATION -P $SSH_PORT $CURRENT_HOST:$GRID_ROOT_DIR/$REMOTE "$LIVE_HTACCESS"
then
    patchFailed "Could not fetch the live root .htaccess.";
fi

node "$PATCHER" "$LIVE_HTACCESS" "$ACTION" "$VERSION" "$CHARTS_VERSION" || patchFailed "Patching failed."

# Keep a timestamped copy on the box, so a bad patch is one cp away from being undone without
# needing this script or a deploy.
echo "ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST \"cp $GRID_ROOT_DIR/$REMOTE $BACKUP\""
if ! ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "cp $GRID_ROOT_DIR/$REMOTE $BACKUP"
then
    patchFailed "Could not back up the live root .htaccess.";
fi

# Upload beside the live file and rename over it: scp writes in place, so an interrupted
# transfer straight onto .htaccess would leave the site with a truncated one. mv within the
# same directory is atomic, so a reader sees either the old file or the new one.
echo "scp -i $SSH_LOCATION -P $SSH_PORT local -> $CURRENT_HOST:$STAGED"
if ! scp -i $SSH_LOCATION -P $SSH_PORT "$LIVE_HTACCESS" $CURRENT_HOST:$STAGED
then
    patchFailed "Could not upload the patched root .htaccess.";
fi
if ! ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "chmod 644 $STAGED && mv $STAGED $GRID_ROOT_DIR/$REMOTE"
then
    patchFailed "Could not move the patched root .htaccess into place.";
fi
rm -f "$LIVE_HTACCESS"

echo "Root .htaccess patched. Previous copy kept at $BACKUP"
echo "NOTE: a docs deploy resets the in-flight block. That is how the exemption is removed at"
echo "      GA, but it also means a mid-cycle docs deploy drops it - re-run this if so."
