#!/usr/bin/env bash
error_found=0
node moduleParser.js ChartsModule.ts ../bundles/enterprise.bundle.js false
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ChartsModule.ts ../bundles/community.bundle.js false
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ChartsModule.ts ../bundles/ChartsModule.bundle.js true
if [ $? -eq 1 ]
then
    error_found=1
fi

exit $error_found