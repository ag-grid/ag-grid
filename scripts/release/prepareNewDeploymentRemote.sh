#!/usr/bin/env bash

##########################################################################################
## This script is meant to live on ag-grid.com and be invoked by someone doing a deployment
## It's in a separate script as occasionally multiple "ssh -i" from a devs machine would
## result in some of the commands being rejected. Extracting these multiple commands into one
## should alleviate that
##########################################################################################

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release filename"
    echo "For example: deployAgGridReleaseRemote.sh release_20191210.zip"
    exit 1
fi

FILENAME=$1

# delete old temp folder if it exists
rm -f public_html_tmp > /dev/null

# create a new folder - this will become public_html
mkdir public_html_tmp

# unzip release
echo "Unzipping release archive"
mv ./$FILENAME public_html_tmp/
cd public_html_tmp/ && unzip $FILENAME

# copy non versionsed files & directories over
echo "Copying non-versioned directories"
cp -R ./public_html/support public_html_tmp/
cp -R ./public_html/ecommerce public_html_tmp/
cp -R ./public_html/ecommerce-uat public_html_tmp/
cp -R ./public_html/zendesk public_html_tmp/
cp -R ./public_html/services public_html_tmp/
cp -R ./public_html/robots.txt public_html_tmp/
cp -R ./public_html/.htaccess public_html_tmp/
cp -R ./public_html/__shared public_html_tmp/

# jira stuff
echo "Copying JIRA stuff"
cp -R public_html/jira_reports/prod public_html_tmp/jira_reports/
cp -R public_html/jira_reports/jira_config.json public_html_tmp/jira_reports/
cp -R public_html/dist/aui public_html_tmp/dist

#update folder permissions (default is 777 - change to 755)
echo "Updating folder permissions"
find public_html_tmp -maxdepth 1 -not \( -path public_html_tmp/ecommerce -prune \) -not \( -path public_html_tmp/ecommerce-uat -prune \) -not \( -path public_html_tmp/services -prune \) -not \( -path public_html_tmp/archive -prune \) -type d -exec chmod -R 755 {} \;
