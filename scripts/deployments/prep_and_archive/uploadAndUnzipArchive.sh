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

# Exempt this release candidate from caching until it goes live.
PATCHER="$(dirname "$0")/patchUncachedArchives.sh"
checkFileExists "$PATCHER"
"$PATCHER" "$VERSION" "$CHARTS_VERSION" "$CURRENT_HOST" set || exit 1
