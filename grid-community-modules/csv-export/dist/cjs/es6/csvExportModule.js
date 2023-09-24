"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvExportModule = void 0;
const core_1 = require("@ag-grid-community/core");
const csvCreator_1 = require("./csvExport/csvCreator");
const gridSerializer_1 = require("./csvExport/gridSerializer");
const version_1 = require("./version");
exports.CsvExportModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.CsvExportModule,
    beans: [csvCreator_1.CsvCreator, gridSerializer_1.GridSerializer]
};
