"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var excelXlsxFactory_1 = require("./excelExport/excelXlsxFactory");
var excelXmlFactory_1 = require("./excelExport/excelXmlFactory");
var excelCreator_1 = require("./excelExport/excelCreator");
var csv_export_1 = require("@ag-grid-community/csv-export");
var csv_export_2 = require("@ag-grid-community/csv-export");
exports.ExcelExportModule = {
    moduleName: core_1.ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        excelCreator_1.ExcelCreator, excelXmlFactory_1.ExcelXmlFactory, excelXlsxFactory_1.ExcelXlsxFactory,
        // these beans are part of CSV Export module
        csv_export_1.GridSerializer, csv_export_1.ZipContainer, csv_export_1.XmlFactory, csv_export_1.Downloader, csv_export_1.CsvCreator
    ],
    dependantModules: [
        csv_export_2.CsvExportModule,
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=excelExportModule.js.map