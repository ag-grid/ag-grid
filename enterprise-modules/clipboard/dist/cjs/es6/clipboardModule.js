"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const csv_export_1 = require("@ag-grid-community/csv-export");
const clipboardService_1 = require("./clipboard/clipboardService");
exports.ClipboardModule = {
    moduleName: core_1.ModuleNames.ClipboardModule,
    beans: [clipboardService_1.ClipboardService],
    dependantModules: [
        core_2.EnterpriseCoreModule,
        csv_export_1.CsvExportModule
    ]
};
