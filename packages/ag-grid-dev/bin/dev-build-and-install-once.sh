set -e

echo "*********************************************************************************"
echo "********************************** ag-grid **************************************"
echo "*********************************************************************************"
cd ag-grid
gulp release
cd ..

core_projects=('ag-grid-enterprise' 'ag-grid-angular' 'ag-grid-react' 'ag-grid-vue' 'ag-grid-aurelia')
for core_project in ${core_projects[@]}; do
  echo "*********************************************************************************"
  echo "******************************** $core_project **********************************"
  echo "*********************************************************************************"

  if [ -d "$core_project" ]; then
    cd $core_project
    npm install ag-grid@file:../ag-grid
    npm run build
    cd ..
  fi
done

if [ -d "ag-grid-angular-example" ]; then
  cd ag-grid-angular-example

  angular_projects=('webpack' 'webpack2' 'systemjs_aot' 'angular-cli')

  for angular_project in ${angular_projects[@]}; do
    echo "*********************************************************************************"
    echo "*************************** angular - $angular_project **************************"
    echo "*********************************************************************************"

    cd $angular_project
    npm install ag-grid-enterprise@file:../../ag-grid-enterprise
    npm install ag-grid-angulare@file:../../ag-grid-angular
    npm install ag-grid@file:../../ag-grid
    npm run build
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
    npm install ag-grid@file:../ag-grid
    npm install ag-grid-enterprise@file:../ag-grid-enterprise

    fw=`echo $fw_project  | sed 's/-example//'`
    npm install $fw@file:../$fw

    npm run build
    cd ..
  fi
done

if [ -d "ag-grid-polymer" ] || [ "ag-grid-polymer-example"]; then 
  sources=('ag-grid' 'ag-grid-enterprise' 'ag-grid-polymer')
  for source in ${sources[@]}; do
    if [ -d "$source" ]; then
      cd $source
      bower link
      cd ..
    fi
  done
fi

if [ -d "ag-grid-polymer" ]; then 
  cd ag-grid-polymer

  echo "*********************************************************************************"
  echo "*********************** ag-grid-polymer *********************************"
  echo "*********************************************************************************"
  
  npm install

  if [ -d "../ag-grid"]; then 
    bower link ag-grid
  fi

  cd ..
fi

if [ -d "ag-grid-polymer-example" ]; then 
  cd ag-grid-polymer-example

  echo "*********************************************************************************"
  echo "*********************** ag-grid-polymer-example *********************************"
  echo "*********************************************************************************"
  
  npm install

  sources=('ag-grid' 'ag-grid-enterprise' 'ag-grid-polymer')
  for source in ${sources[@]}; do
    if [ -d "../$source" ]; then
      echo "linking $source"
      bower link $source
    fi
  done

  cd ..
fi
