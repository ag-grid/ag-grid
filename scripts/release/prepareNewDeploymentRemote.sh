#!/usr/bin/env bash

##########################################################################################
## This script is meant to live on ag-grid.com and be invoked by someone doing a deployment
## It's in a separate script as occasionally multiple "ssh -i" from a devs machine would
## result in some of the commands being rejected. Extracting these multiple commands into one
## should alleviate that
##########################################################################################

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release version"
    echo "For example: deployAgGridReleaseRemote.sh 28.0.0"
    exit 1
fi

RAW_VERSION=$1
VERSION=""${RAW_VERSION//./}""
TIMESTAMP=`date +%Y%m%d`
FILENAME=release_"$TIMESTAMP"_v"$VERSION".zip

cd $WORKING_DIR_ROOT

# delete old temp folder if it exists
rm -f public_html_tmp > /dev/null

# create a new folder - this will become $HTML_FOLDER_NAME
mkdir public_html_tmp

# unzip release
echo "Unzipping release archive"
mv ./$FILENAME public_html_tmp/
cd public_html_tmp/ && unzip $FILENAME
cd ..

# copy non versioned files & directories over
echo "Copying non-versioned directories"
cp -R ./$HTML_FOLDER_NAME/support public_html_tmp/
cp -R ./$HTML_FOLDER_NAME/example-assets public_html_tmp/
cp -R ./$HTML_FOLDER_NAME/ecommerce public_html_tmp/
cp -R ./$HTML_FOLDER_NAME/ecommerce-uat public_html_tmp/
cp -R ./$HTML_FOLDER_NAME/zendesk public_html_tmp/
cp -R ./$HTML_FOLDER_NAME/services public_html_tmp/
cp -R ./$HTML_FOLDER_NAME/robots.txt public_html_tmp/
cp -R ./$HTML_FOLDER_NAME/__shared public_html_tmp/

#update folder permissions (default is 777 - change to 755)
echo "Updating folder permissions"
find public_html_tmp -maxdepth 1 -not \( -path public_html_tmp/ecommerce -prune \) -not \( -path public_html_tmp/ecommerce-uat -prune \) -not \( -path public_html_tmp/services -prune \) -not \( -path public_html_tmp/archive -prune \) -type d -exec chmod -R 755 {} \;
