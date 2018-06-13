cd ..

cd ag-grid-enterprise
mkdir node_modules
cd node_modules
rmdir ag-grid
mklink /J ag-grid ..\..\ag-grid
cd ..\..

cd ag-grid-docs\src\dist
rmdir ag-grid
mklink /J ag-grid ..\..\..\ag-grid\dist
rmdir ag-grid-enterprise
mklink /J ag-grid-enterprise ..\..\..\ag-grid-enterprise\dist
cd ..\..\..

cd ag-grid-angular
mkdir node_modules
cd node_modules
rmdir ag-grid
mklink /J ag-grid ..\..\ag-grid
rmdir ag-grid-enterprise
mklink /J ag-grid-enterprise ..\..\ag-grid-enterprise
cd ..\..

cd ag-grid-react
mkdir node_modules
cd node_modules
rmdir ag-grid
mklink /J ag-grid ..\..\ag-grid
rmdir ag-grid-enterprise
mklink /J ag-grid-enterprise ..\..\ag-grid-enterprise
cd ..\..

cd ag-grid-dev
