#!/bin/bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply a grid version, a charts version & a host"
    echo "For example: ./scripts/deployments/prep_and_archive/uploadAndUnzipArchive.sh 36.1.0 14.1.0 user@host"
    echo ""
    echo "Both archives are exempted from caching while they are under test. Nothing undoes"
    echo "that explicitly: a production docs deploy emits an empty in-flight block, so going"
    echo "live restores normal caching on its own."
    exit 1
fi

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit 1;
    fi
}

VERSION=$1
# The charts version cut alongside this grid version.
CHARTS_VERSION=$2
CURRENT_HOST=$3

export SSH_LOCATION=$SSH_FILE

# a few safety checks
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
then
    echo "Version isn't in the expected format. Valid format is: Number.Number.number. For example 19.1.2";
    exit 1;
fi

if ! [[ "$CHARTS_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
then
    echo "Charts version isn't in the expected format. Valid format is: Number.Number.Number. For example 14.1.0";
    exit 1;
fi

if [ -z "$SSH_LOCATION" ]
then
      echo "\$SSH_LOCATION is not set"
      exit 1;
fi

ARCHIVE="archive_`date +%Y%m%d`_$VERSION.tar.gz"


# delete dir if it exists - can ignore dir not found error
echo "ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST \"cd $GRID_ROOT_DIR/archive/ && [[ -d $VERSION ]] && rm -r $VERSION\""
ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "cd $GRID_ROOT_DIR/archive/ && [[ -d $VERSION ]] && rm -r $VERSION"

# upload file
echo "ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST \"mkdir -p $GRID_ROOT_DIR/archive/$VERSION\""
ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "mkdir -p $GRID_ROOT_DIR/archive/$VERSION"
echo "scp -i $SSH_LOCATION -P $SSH_PORT $ARCHIVE $CURRENT_HOST:$GRID_ROOT_DIR/archive/$VERSION/"
scp -i $SSH_LOCATION -P $SSH_PORT $ARCHIVE $CURRENT_HOST:$GRID_ROOT_DIR/archive/$VERSION/

# unzip archive
echo "ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST \"cd $GRID_ROOT_DIR/archive/$VERSION && tar -m -xf $ARCHIVE\""
ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "cd $GRID_ROOT_DIR/archive/$VERSION && tar -m -xf $ARCHIVE"

#update folder permissions (default is 777 - change to 755)
echo "ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST \"chmod -R 755 $GRID_ROOT_DIR/archive/$VERSION\""
ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "chmod -R 755 $GRID_ROOT_DIR/archive/$VERSION"

# Exempt this release candidate from caching, by patching the live root .htaccess in place.
# A production docs deploy emits an empty block, so going live undoes it with no step here.
PATCHER="$(dirname "$0")/../../uncached-archives.mjs"
checkFileExists "$PATCHER"

LIVE_HTACCESS=$(mktemp)
REMOTE=".htaccess"
STAGED="$GRID_ROOT_DIR/.htaccess.new-$$"
BACKUP="$GRID_ROOT_DIR/.htaccess.bak-$(date +%Y%m%d%H%M%S)"

function patchFailed {
    echo "$1";
    echo "The live root .htaccess has NOT been changed. The archive is deployed but still";
    echo "cacheable - fix this and re-run, or the release candidate will serve stale.";
    rm -f "$LIVE_HTACCESS";
    ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "rm -f $STAGED" 2>/dev/null;
    exit 1;
}

# Checksum the live file before and after patching locally, both computed on the box with the
# same tool, and refuse if it moved in between. A docs deploy or another release step landing
# in that window would otherwise be silently reverted by uploading our now-stale whole-file copy.
BEFORE_SUM=$(ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "md5sum $GRID_ROOT_DIR/$REMOTE | cut -d' ' -f1")
if [ -z "$BEFORE_SUM" ]
then
    patchFailed "Could not checksum the live root .htaccess.";
fi

echo "scp -i $SSH_LOCATION -P $SSH_PORT $CURRENT_HOST:$GRID_ROOT_DIR/$REMOTE -> local"
if ! scp -i $SSH_LOCATION -P $SSH_PORT $CURRENT_HOST:$GRID_ROOT_DIR/$REMOTE "$LIVE_HTACCESS"
then
    patchFailed "Could not fetch the live root .htaccess.";
fi

node "$PATCHER" "$LIVE_HTACCESS" set "$VERSION" "$CHARTS_VERSION" || patchFailed "Patching failed."

NOW_SUM=$(ssh -i $SSH_LOCATION -p $SSH_PORT $CURRENT_HOST "md5sum $GRID_ROOT_DIR/$REMOTE | cut -d' ' -f1")
if [ "$NOW_SUM" != "$BEFORE_SUM" ]
then
    patchFailed "The live root .htaccess changed while we were patching it ($BEFORE_SUM -> $NOW_SUM).";
fi

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
