cd ..\ag-grid-enterprise
mkdir node_modules
cd node_modules
rmdir ag-grid
mklink /J ag-grid ..\..\ag-grid
cd ..\..\ag-grid-docs\src\dist
rmdir ag-grid
mklink /J ag-grid ..\..\..\ag-grid\dist
rmdir ag-grid-enterprise
mklink /J ag-grid-enterprise ..\..\..\ag-grid-enterprise\dist
cd ..\..\..\ag-grid-dev
