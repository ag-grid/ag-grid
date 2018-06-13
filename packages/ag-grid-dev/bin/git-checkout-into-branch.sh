#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply the branch name as first parameter and then at least one module to checkout into branch"
    exit 1
fi


echo "Checking out into branch " $1
mkdir $1
cd $1

## for all the modules
IFS=' ' read -ra ADDR <<< "${@:2}"
for module in "${ADDR[@]}"
do
    echo =============================================================================================
    echo "CHECKING OUT MODULE  $module to branch $1"
    echo =============================================================================================

    git clone https://github.com/ag-grid/$module.git
    cd $module
    git checkout -b $1
    cd ..
done

cd ..
