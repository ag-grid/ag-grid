#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply the version as first parameter and then at least one module"
    exit 1
fi


echo "MERGING LOCALLY " $1
cd $1

## for all the modules
declare -a modules=${@:2}

for module in "${modules[@]}"
do

    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    cd "$module"
    rm "$module-$1.tgz" -f

    git checkout master
    git merge $1 --no-commit --no-ff

    cd ..
done

