"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelExportModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var excelCreator_1 = require("./excelExport/excelCreator");
var csv_export_1 = require("@ag-grid-community/csv-export");
var csv_export_2 = require("@ag-grid-community/csv-export");
var version_1 = require("./version");
exports.ExcelExportModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        excelCreator_1.ExcelCreator,
        // these beans are part of CSV Export module
        csv_export_1.GridSerializer, csv_export_1.CsvCreator
    ],
    dependantModules: [
        csv_export_2.CsvExportModule,
        core_2.EnterpriseCoreModule
    ]
};
