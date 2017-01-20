#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply the parent dir and at least one module to build"
    exit 1
fi


## for all the modules
IFS=' ' read -ra ADDR <<< "${@:2}"
for module in "${ADDR[@]}"
do
    cd "$1/$module"

    npm install
    npm-install-peers

    cd ../../
done


