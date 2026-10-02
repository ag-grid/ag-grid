#!/usr/bin/env bash

ZIP_PREFIX=`date +%Y%m%d`

echo "Deploying Docs to Build Server"

if [ ! -d "documentation/ag-grid-docs/dist" ];
then
  echo "documentation/ag-grid-docs/dist does NOT EXIST. Exiting with error."
  exit 1
fi

cd documentation/ag-grid-docs/dist

FILENAME=release_"$ZIP_PREFIX"_v"$ZIP_PREFIX".zip
echo "Creating $FILENAME"
zip -qr ../../../$FILENAME *
# The glob above skips dot-prefixed entries, so add them explicitly:
# - the generated .htaccess (present on staging/production builds)
# - the .well-known directory (e.g. the MCP discovery card, SE-79)
if [ -f .htaccess ]; then
  zip -q ../../../$FILENAME .htaccess
fi
if [ -d .well-known ]; then
  zip -qr ../../../$FILENAME .well-known
fi

cd ../../../

# Hold the root .htaccess lock that patchUncachedArchives.sh takes for its check-and-rename, so an
# in-flight patch cannot land between its check and its rename and undo this deploy's .htaccess.
exec 9>>/var/www/html/.htaccess.lock
if ! flock -w 300 9
then
    echo "Could not take /var/www/html/.htaccess.lock - an in-flight patch is holding it. Re-run this."
    exit 1
fi

echo "Cleaning current grid staging"
# remove dot-prefixed entries (.htaccess, .well-known) too - otherwise unzip below prompts to replace
# them and exits non-zero when there's no tty to answer - but keep the lock file held above
find /var/www/html -mindepth 1 -maxdepth 1 ! -name .htaccess.lock -exec rm -rf {} +
mv $FILENAME /var/www/html/

echo "Unzipping new grid staging"
unzip -qo /var/www/html/$FILENAME -d /var/www/html/
