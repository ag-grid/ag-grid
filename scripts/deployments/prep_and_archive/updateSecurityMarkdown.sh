#!/bin/bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the grid version"
    echo "For example: ./scripts/deployments/prep_and_archive/updateSecurityMarkdown.sh 37.0.0"
    exit 1
fi

NEW_GRID_VERSION=$1

npx tsx external/ag-shared/scripts/security/update-security-versions.ts --type latest --version $NEW_GRID_VERSION --file SECURITY.md
