#!/bin/bash

# Set or clear the in-flight archive caching exemption in the root .htaccess on a remote box, for
# grid and charts independently. Called by uploadAndUnzipArchive.sh during a grid release
# candidate, and runnable on its own (e.g. for a charts-only release candidate).

if [ "$#" -lt 3 ]
  then
    echo "You must supply a grid version, a charts version & a host; '-' for a version leaves that product alone"
    echo "For example: ./scripts/deployments/prep_and_archive/patchUncachedArchives.sh 36.1.0 14.1.0 user@host"
    echo "             ./scripts/deployments/prep_and_archive/patchUncachedArchives.sh - 14.1.0 user@host set"
    echo ""
    echo "  set   (default) exempts the named archives from caching while they are under test,"
    echo "        keeping the other product's entry as it is"
    echo "  clear restores normal caching for the named archives, each only if that version is the"
    echo "        one in flight (another version in flight is refused, and nothing changes)"
    echo ""
    echo "For example: ./scripts/deployments/prep_and_archive/patchUncachedArchives.sh 36.1.0 - user@host clear"
    echo ""
    echo "Nothing has to clear this: a production docs deploy emits an empty in-flight block,"
    echo "so going live restores normal caching on its own. That cuts both ways - a docs deploy"
    echo "mid-cycle drops the exemption too, so re-run this if one lands before GA."
    echo ""
    echo "Requires \$SSH_FILE, \$SSH_PORT and \$GRID_ROOT_DIR, as the other deploy scripts do."
    exit 1
fi

# Either may be '-', leaving that product's in-flight entry as it is (but not both).
VERSION=$1
CHARTS_VERSION=$2
CURRENT_HOST=$3
ACTION=${4:-set}

export SSH_LOCATION=$SSH_FILE

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ || "$VERSION" == "-" ]]
then
    echo "Version isn't in the expected format. Valid format is: Number.Number.Number (for example 36.1.0), or -";
    exit 1;
fi

if ! [[ "$CHARTS_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ || "$CHARTS_VERSION" == "-" ]]
then
    echo "Charts version isn't in the expected format. Valid format is: Number.Number.Number (for example 14.1.0), or -";
    exit 1;
fi

if [[ "$VERSION" == "-" && "$CHARTS_VERSION" == "-" ]]
then
    echo "Supply at least one of the grid and charts versions";
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

if ! scp -i $SSH_LOCATION -P $SSH_PORT $CURRENT_HOST:$GRID_ROOT_DIR/$REMOTE "$LIVE_HTACCESS"
then
    patchFailed "Could not fetch the live root .htaccess.";
fi

# sha256 of a local file: sha256sum on Linux (TeamCity), shasum on macOS.
function sha256Of {
    if command -v sha256sum >/dev/null 2>&1; then sha256sum < "$1" | cut -d' ' -f1; else shasum -a 256 < "$1" | cut -d' ' -f1; fi
}

SNAPSHOT_SHA=$(sha256Of "$LIVE_HTACCESS")
OUTCOME=$(node "$PATCHER" "$LIVE_HTACCESS" "$ACTION" "$VERSION" "$CHARTS_VERSION") || patchFailed "Patching failed."
PATCHED_SHA=$(sha256Of "$LIVE_HTACCESS")

# A clear that finds nothing of ours leaves the file untouched. Stop here rather than
# uploading it back: the write cannot fail a release it was never going to change, and a
# stale invocation cannot overwrite a newer state it never looked at.
if [ "$PATCHED_SHA" = "$SNAPSHOT_SHA" ]
then
    rm -f "$LIVE_HTACCESS";
    echo "$GRID_ROOT_DIR/$REMOTE: $OUTCOME";
    exit 0;
fi

# Upload beside the live file, then swap it in only if nothing changed underneath: scp writes in
# place, so an interrupted transfer straight onto .htaccess would leave the site with a truncated
# one, and mv within the same directory is atomic. The patch was made against the copy fetched
# above, so a change to the live file since then - the other product's in-flight entry, or a docs
# deploy - would be silently lost by an unconditional mv. One remote command therefore checks that
# the live file is still that copy and that the upload arrived intact, keeps a timestamped backup
# (one cp away from undoing the patch without this script or a deploy), and only then renames.
# The check and the rename run under an exclusive flock on .htaccess.lock beside the live file, so
# two patchers (grid and charts release candidates at once) cannot both pass the check against the
# same file and then both rename; the second sees the first's change and stops. ag-charts
# tools/archive/ uses the same protocol, and the same lock file, for its charts-only copy, and the
# deploys that replace the root .htaccess (switchReleaseRemote.sh, the staging deploys) hold it too,
# so none can land between the check and the rename. A production switch replaces the whole docroot
# directory, so once the lock is held the swap also checks that the directory it is in is still the
# live one.
if ! scp -i $SSH_LOCATION -P $SSH_PORT "$LIVE_HTACCESS" $CURRENT_HOST:$STAGED
then
    patchFailed "Could not upload the patched root .htaccess.";
fi
SWAP="cd $GRID_ROOT_DIR || exit 5; \
    exec 9>>.htaccess.lock && flock -w 60 9 || { echo 'could not lock .htaccess.lock'; exit 6; }; \
    [ .htaccess.lock -ef $GRID_ROOT_DIR/.htaccess.lock ] || { echo 'the docroot was replaced while waiting'; exit 3; }; \
    [ \"\$(sha256sum < $REMOTE | cut -d' ' -f1)\" = $SNAPSHOT_SHA ] || { echo 'live file changed since it was fetched'; exit 3; }; \
    [ \"\$(sha256sum < $STAGED | cut -d' ' -f1)\" = $PATCHED_SHA ] || { echo 'uploaded file does not match the patched one'; exit 4; }; \
    cp -p $REMOTE $BACKUP && chmod 644 $STAGED && mv $STAGED $REMOTE"
ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "$SWAP"
case $? in
    0) ;;
    3) patchFailed "The live root .htaccess changed while this ran (another in-flight update or a deploy). Re-run this to patch the current file.";;
    4) patchFailed "The upload did not arrive intact. Re-run this.";;
    6) patchFailed "Another patch of the live root .htaccess held its lock for over a minute. Re-run this.";;
    *) patchFailed "Could not move the patched root .htaccess into place.";;
esac
rm -f "$LIVE_HTACCESS"

echo "$GRID_ROOT_DIR/$REMOTE: $OUTCOME (previous copy at $BACKUP)"
