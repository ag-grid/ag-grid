#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the parent dir"
    exit 1
fi

cd $1

echo "Processing ag-grid"
cd ag-grid
rm -rf dist
rm .gitignore
npm install > ../ag-grid-install.log
gulp release

echo "Processing ag-grid-enterprise"
cd ../ag-grid-enterprise
rm -rf dist
rm .gitignore
npm install > ../ag-grid-enterprise-install.log
rm -rf node_modules/ag-grid
npm i "file:../ag-grid"
gulp release

echo "Processing ag-grid-angular"
cd ../ag-grid-angular
rm -rf dist
npm install > ../ag-grid-angular-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-enterprise
npm i "file:../ag-grid"
npm i "file:../ag-grid-enterprise"
npm run clean
npm run build

echo "Processing ag-grid-angular systemjs"
cd ../ag-grid-angular-example/systemjs_aot
rm -rf dist
npm install > ../ag-grid-sjs-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-angular
rm -rf node_modules/ag-grid-enterprise
npm i "file:../../ag-grid"
npm i "file:../../ag-grid-enterprise"
npm i "file:../../ag-grid-angular"
npm run clean
npm run tsc

echo "Processing ag-grid-angular webpack"
cd ../webpack
rm -rf dist
npm install > ../ag-grid-weback-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-angular
rm -rf node_modules/ag-grid-enterprise
npm i "file:../../ag-grid"
npm i "file:../../ag-grid-enterprise"
npm i "file:../../ag-grid-angular"
npm run clean
npm run build

echo "Processing ag-grid-angular webpack2"
cd ../webpack2
rm -rf dist
npm install > ../ag-grid-weback-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-angular
rm -rf node_modules/ag-grid-enterprise
npm i "file:../../ag-grid"
npm i "file:../../ag-grid-enterprise"
npm i "file:../../ag-grid-angular"
npm run clean
npm run build

echo "Processing ag-grid-angular angularcli"
cd ../angular-cli
rm -rf dist
npm install > ../ag-grid-webpack2-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-angular
rm -rf node_modules/ag-grid-enterprise
npm i "file:../../ag-grid"
npm i "file:../../ag-grid-enterprise"
npm i "file:../../ag-grid-angular"

echo "Processing ag-grid-react"
cd ../../ag-grid-react
rm -rf dist
npm install > ../ag-grid-react-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-enterprise
npm i "file:../ag-grid"
npm i "file:../ag-grid-enterprise"
gulp

echo "Processing ag-grid-react-example"
cd ../ag-grid-react-example
rm -rf dist
npm install > ../ag-grid-react-example-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-enterprise
rm -rf node_modules/ag-grid-react
npm i "file:../ag-grid"
npm i "file:../ag-grid-enterprise"
npm i "file:../ag-grid-react"

echo "Processing ag-grid-vue"
cd ../ag-grid-vue
rm -rf dist
npm install > ../ag-grid-vue-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-enterprise
npm i "file:../ag-grid"
npm i "file:../ag-grid-enterprise"
gulp

echo "Processing ag-grid-vue-example"
cd ../ag-grid-vue-example
rm -rf dist
npm install > ../ag-grid-vue-example-install.log
rm -rf node_modules/ag-grid
rm -rf node_modules/ag-grid-enterprise
rm -rf node_modules/ag-grid-vue
npm i "file:../ag-grid"
npm i "file:../ag-grid-enterprise"
npm i "file:../ag-grid-vue"
npm run build

echo "Processing ag-grid-polymer"
cd ../ag-grid-polymer
npm install > ../ag-grid-polymer-install.log
rm -rf bower_components/ag-grid
bower install ../ag-grid

echo "Processing ag-grid-polymer-example"
cd ../ag-grid-polymer-example
npm install > ../ag-grid-polymer-example-install.log
rm -rf bower_components/ag-grid
rm -rf bower_components/ag-grid-enterprise
rm -rf bower_components/ag-grid-polymer
bower install ../ag-grid
bower install ../ag-grid-enterprise
bower install ../ag-grid-polymer
