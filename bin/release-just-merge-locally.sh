#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply the version as first parameter and then at least one module"
    exit 1
fi


echo "MERGING LOCALLY " $1
cd $1

## for all the modules
IFS=' ' read -ra ADDR <<< "${@:2}"
for module in "${ADDR[@]}"
do

    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    cd "$module"
    rm "module.tgz" -f

    git add .
    git commit -m "$1"
    git push --set-upstream origin $1

    git checkout master
    git merge $1 --no-commit --no-ff

    cd ..
done

