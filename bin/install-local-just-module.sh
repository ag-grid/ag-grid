#!/usr/bin/env bash

if [ "$#" -lt 3 ]
  then
    echo "You must supply the parent dir, the module to pack and at least one module to link"
    exit 1
fi

#first run pack
cd $1/$2
rm -rf dist
rm -rf $2-*.tgz
cd ../..
dist-just-module.sh $1 $2
cd $1/$2
npm pack
cd ../..

## for all the modules
IFS=' ' read -ra ADDR <<< "${@:3}"
for module in "${ADDR[@]}"
do
    cd "$1/$module"

    rm -rf node_modules/$2
    npm install ../$2/$2-*.tgz

    cd ../..
done

rm -rf $1/$2/$2-*.tgz


