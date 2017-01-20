#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must specify the parent folder"
    exit 1
fi


cd $1/ag-grid-react-example
npm i
npm i webpack -g
npm run standard