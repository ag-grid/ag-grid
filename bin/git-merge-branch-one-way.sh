#!/usr/bin/env bash


if [ "$#" -lt 2 ]
  then
    echo "You must supply as 1st parameter the origin branch and least one module to merge"
    exit 1
fi




## for all the modules
IFS=' ' read -ra ADDR <<< "${@:2}"
for module in "${ADDR[@]}"
do
    echo =============================================================================================
    echo "MODULE  $module"
    echo =============================================================================================

    echo "Merging $current_branch into $1"
    cd $module
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    git stash
    git checkout $1
    git pull
    git checkout $current_branch
    git pull
    git merge $1 --no-commit --no-ff
    git stash apply
    cd ..


done