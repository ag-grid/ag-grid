#!/usr/bin/env bash

error_found=0

TEST_FILES=*.ts
for f in $TEST_FILES
do
    node dist/moduleParser.js $f ../dist/enterprise.bundle.js false
    if [ $? -eq 1 ]
    then
        error_found=1
    fi

    node dist/moduleParser.js $f ../dist/community.bundle.js false
    if [ $? -eq 1 ]
    then
        error_found=1
    fi

    node dist/moduleParser.js $f ../dist/charts.bundle.js true
    if [ $? -eq 1 ]
    then
        error_found=1
    fi
done

exit $error_found
