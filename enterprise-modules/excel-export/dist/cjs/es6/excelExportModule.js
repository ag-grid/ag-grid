"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const excelCreator_1 = require("./excelExport/excelCreator");
const csv_export_1 = require("@ag-grid-community/csv-export");
const csv_export_2 = require("@ag-grid-community/csv-export");
exports.ExcelExportModule = {
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
