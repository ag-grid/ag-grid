#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a release filename "
    echo "For example: ./scripts/release/prepareAgGridForRelease.sh release_20191210.zip"
    exit 1
fi

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit;
    fi
}

checkFileExists ~/.ssh/ag_ssh

FILENAME=$1

# delete old temp folder if it exists
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "rm -f public_html_tmp > /dev/null"

# create a new folder - this will become public_html
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "mkdir public_html_tmp"

# unzip release
echo "Unzipping release archive"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "mv ./$FILENAME public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "cd public_html_tmp/ && unzip $FILENAME"

# copy non versionsed files & directories over
echo "Copying non-versionsed directories"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/support public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/ecommerce public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/ecommerce-uat public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/zendesk public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/services public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/robots.txt public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/.htaccess public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/__shared public_html_tmp/"

# jira stuff
echo "Copying JIRA stuff"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R public_html/jira_reports/prod public_html_tmp/jira_reports/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R public_html/jira_reports/jira_config.json public_html_tmp/jira_reports/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R public_html/dist/aui public_html_tmp/dist"

#update folder permissions (default is 777 - change to 755)
echo "Updating folder permissions"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "find public_html_tmp -maxdepth 1 -not \( -path public_html_tmp/ecommerce -prune \) -not \( -path public_html_tmp/ecommerce-uat -prune \) -not \( -path public_html_tmp/services -prune \) -not \( -path public_html_tmp/archive -prune \) -type d -exec chmod -R 755 {} \;"
