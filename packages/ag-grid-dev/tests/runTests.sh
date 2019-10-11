#!/usr/bin/env bash
error_found=0
node moduleParser.js InfiniteRowModelModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js InfiniteRowModelModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js InfiniteRowModelModule.ts ../bundles/InfiniteRowModelModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js CsvExportModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js CsvExportModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js CsvExportModule.ts ../bundles/CsvExportModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ExcelExportModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ExcelExportModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ExcelExportModule.ts ../bundles/ExcelExportModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ChartsModule.ts ../bundles/enterprise.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ChartsModule.ts ../bundles/community.bundle.js false infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi
node moduleParser.js ChartsModule.ts ../bundles/ChartsModule.bundle.js true infiniteRowModelModule,csvExportModule,excelExportModule,chartsModule
if [ $? -eq 1 ]
then
    error_found=1
fi

exit $error_found