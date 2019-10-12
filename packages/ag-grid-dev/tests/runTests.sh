#!/usr/bin/env bash
error_found=0
node moduleParser.js InfiniteRowModelModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js InfiniteRowModelModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js InfiniteRowModelModule.ts ../bundles/InfiniteRowModelModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js CsvExportModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js CsvExportModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js CsvExportModule.ts ../bundles/CsvExportModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ExcelExportModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ExcelExportModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ExcelExportModule.ts ../bundles/ExcelExportModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ChartsModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ChartsModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ChartsModule.ts ../bundles/ChartsModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ClipboardModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ClipboardModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ClipboardModule.ts ../bundles/ClipboardModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ColumnToolPanelModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ColumnToolPanelModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ColumnToolPanelModule.ts ../bundles/ColumnToolPanelModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js FiltersToolPanelModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js FiltersToolPanelModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js FiltersToolPanelModule.ts ../bundles/FiltersToolPanelModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js MenuModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js MenuModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js MenuModule.ts ../bundles/MenuModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js RichSelectModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js RichSelectModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js RichSelectModule.ts ../bundles/RichSelectModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js RowGroupingModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js RowGroupingModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js RowGroupingModule.ts ../bundles/RowGroupingModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js SetFilterModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js SetFilterModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js SetFilterModule.ts ../bundles/SetFilterModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js SideBarModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js SideBarModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js SideBarModule.ts ../bundles/SideBarModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js StatusBarModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js StatusBarModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js StatusBarModule.ts ../bundles/StatusBarModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule,clipboardModule,columnsToolPanelModule,filtersToolPanelModule,menuModule,richSelectModule,rowGroupingModule,setFilterModule,sideBarModule,statusBarModule
if [ $? -eq 1 ]
then
    error_found=1
fi

exit $error_found