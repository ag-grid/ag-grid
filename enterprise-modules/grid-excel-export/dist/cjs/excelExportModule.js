"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var excelXlsxFactory_1 = require("./excelExport/excelXlsxFactory");
var excelXmlFactory_1 = require("./excelExport/excelXmlFactory");
var excelCreator_1 = require("./excelExport/excelCreator");
var grid_csv_export_1 = require("@ag-community/grid-csv-export");
var grid_csv_export_2 = require("@ag-community/grid-csv-export");
exports.ExcelExportModule = {
    moduleName: grid_core_1.ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        excelCreator_1.ExcelCreator, excelXmlFactory_1.ExcelXmlFactory, excelXlsxFactory_1.ExcelXlsxFactory,
        // these beans are part of CSV Export module
        grid_csv_export_1.GridSerializer, grid_csv_export_1.ZipContainer, grid_csv_export_1.XmlFactory, grid_csv_export_1.Downloader, grid_csv_export_1.CsvCreator
    ],
    dependantModules: [
        grid_csv_export_2.CsvExportModule,
        grid_core_2.EnterpriseCoreModule
    ]
};
