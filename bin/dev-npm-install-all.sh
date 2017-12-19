#!/usr/bin/env bash

set -e

core_projects=('ag-grid' 'ag-grid-enterprise' 'ag-grid-angular' 'ag-grid-react' 'ag-grid-vue' 'ag-grid-aurelia')
for core_project in ${core_projects[@]}; do
  echo "*********************************************************************************"
  echo "******************************** $core_project **********************************"
  echo "*********************************************************************************"

  if [ -d "$core_project" ]; then
    cd $core_project
    npm install 
    #npm-install-peers
    cd ..
  fi
done

if [ -d "ag-grid-angular-example" ]; then
  cd ag-grid-angular-example

  angular_projects=('webpack' 'webpack2' 'systemjs_aot' 'angular-cli')

  for angular_project in ${angular_projects[@]}; do
    echo "*********************************************************************************"
    echo "*************************** $angular_project ************************************"
    echo "*********************************************************************************"

    cd $angular_project
    npm install
    cd ..
  done

  cd ..
fi

fw_projects=('ag-grid-react-example' 'ag-grid-vue-example' 'ag-grid-aurelia-example')
for fw_project in ${fw_projects[@]}; do
  echo "*********************************************************************************"
  echo "***************************** $fw_project ***************************************"
  echo "*********************************************************************************"
  
  if [ -d "$fw_project" ]; then

    cd $fw_project
    npm install 
    cd ..
  fi
done

