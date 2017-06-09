#!/usr/bin/env bash
current_dir=$(pwd)

dist-just-module.sh ag-grid-react

cd ag-grid-react-example

npm i
npm run examples
