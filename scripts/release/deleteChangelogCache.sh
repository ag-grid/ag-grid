#!/bin/bash

function checkFileExists {
    file=$1
    if ! [[ -f "$file" ]]
    then
        echo "File [$file] doesn't exist - exiting script.";
        exit 1;
    fi
}

checkFileExists ~/Documents/aggrid/aggrid/aggrid.txt
checkFileExists ~/.ag_deploy/.ssh/ag_grid_site

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

# download the new changelog information
ssh -i ~/.ag_deploy/.ssh/ag_grid_site aggrid@ag-grid.com "/opt/cpanel/ea-nodejs10/bin/node /home/aggrid/jira_reports/getChangelog.js"
