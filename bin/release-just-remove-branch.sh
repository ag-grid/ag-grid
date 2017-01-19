#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply the version of the branch to delete and at least one module"
    exit 1
fi


echo "Deleting release branch " $1
cd $1

## for all the modules
IFS=' ' read -ra ADDR <<< "${@:2}"
for module in "${ADDR[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================
    cd $module

    git push origin --delete $1

    cd ..
    rm -rf $module
done
cd ..
rm -rf $1

