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
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "mv ./$FILENAME public_html_tmp/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "cd public_html_tmp/ && unzip $FILENAME"

# copy non versionsed files & diretories over
NON_VERSIONED_ENTRIES=(support ecommerce services robots.txt .htaccess .ftpquota )
for entry in "${NON_VERSIONED_ENTRIES[@]}"; do
  ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R ./public_html/$entry public_html_tmp/"
done

# jira stuff
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R public_html/jira_reports/prod public_html_tmp/jira_reports/"
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com  "cp -R public_html/jira_reports/jira_config.json public_html_tmp/jira_reports/"

#update folder permissions (default is 777 - change to 755)
ssh -i ~/.ssh/ag_ssh ceolter@ag-grid.com "find public_html_tmp -maxdepth 1 -not \( -path public_html_tmp/ecommerce -prune \) -not \( -path public_html_tmp/ecommerce-uat -prune \) -not \( -path public_html_tmp/services -prune \) -not \( -path public_html_tmp/archive -prune \) -type d -exec chmod -R 755 {} \;"
