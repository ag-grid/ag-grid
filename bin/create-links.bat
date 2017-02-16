cd ..\ag-grid-enterprise
mkdir node_modules
cd node_modules
rmdir ag-grid
mklink /D ag-grid ..\..\ag-grid
cd ..\..\ag-grid-docs\src\dist
rmdir ag-grid
mklink /D ag-grid ..\..\..\ag-grid\dist
rmdir ag-grid-enterprise
mklink /D ag-grid-enterprise ..\..\..\ag-grid-enterprise\dist
