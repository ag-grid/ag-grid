#!/bin/bash

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit;
    fi
}

checkFileExists ~/aggrid/aggrid.txt
checkFileExists ~/.ssh/ag_ssh
checkFileExists ~/aggrid/.creds

while true; do
    echo    ""
    echo    "*************************************** ******* ****************************************************"
    echo    "*************************************** WARNING ****************************************************"
    echo    "*************************************** ******* ****************************************************"
    read -p "This script will DELETE the LIVE VERSION of AG-GRID CHANGELOG cache!. Do you wish to continue [y/n]? " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer [y]es or [n]o.";;
    esac
done

USERNAME=`awk '{print $1}' ~/aggrid/aggrid.txt`
PASSWORD=`awk '{print $2}' ~/aggrid/aggrid.txt`

# delete the cache
ssh -i ~/.ssh/ag_ssh -p 2222 ceolter@kpidrill.com "rm public_html/ag-grid.com/jira_reports/cache/changelog.json"
